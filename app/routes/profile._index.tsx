import { TrashIcon } from "@heroicons/react/24/outline";
import { ChildrenFeatureFlag, FeatureFlag } from "@prisma/client";
import type { LoaderFunctionArgs, SerializeFrom } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useRouteLoaderData,
  useSubmit,
} from "@remix-run/react";
import React from "react";
import { z } from "zod";
import Button from "~/components/Button";
import Input from "~/components/Input";
import Switch from "~/components/Switch";
import Spinner from "~/components/icons/Spinner";
import { prisma } from "~/db.server";
import { RootLoaderData } from "~/root";
import { loader as searchUsersLoader } from "~/routes/api.users";
import { authenticator } from "~/services/auth.server";
import { DUMMY_AVATAR_IMAGE_URL } from "~/utils/constants";
import { getRelativeTime } from "~/utils/dates/formatting";
import { getUsersFriendRequests } from "~/utils/friendRequests/queries.server";
import { getUsersFriends } from "~/utils/friends/queries.server";
import { getUsersByIDs } from "~/utils/users/queries.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const [userDetails] = await getUsersByIDs([user.id]);

  const { myReceivedFriendRequests, mySentFriendRequests, friendRequests } =
    await getUsersFriendRequests(user.id);

  const friends = await getUsersFriends(user.id);

  const featureFlags = await prisma.featureFlag.findMany({
    where: {
      enabled: true,
    },
    include: {
      childrenFeatureFlags: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return {
    user: {
      ...user,
      createdAt: userDetails.createdAt,
      lastLogin: userDetails.lastLogin,
    },
    friendRequests,
    myReceivedFriendRequests,
    mySentFriendRequests,
    friends,
    featureFlags,
  };
};

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-md px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6 my-8">
      <h1 className="text-2xl tracking-tight font-bold">Profile</h1>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={user.avatarUrl || DUMMY_AVATAR_IMAGE_URL}
            className="rounded-full w-14 h-14"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col text-sm tracking-wide">
            <span>{user.username}</span>
            <code className="text-gray-600">{user.email}</code>
            <span className="text-gray-600">
              Joined {getRelativeTime(user.createdAt)}
            </span>
          </div>
        </div>

        <Form method="POST" action="/logout">
          <Button>Logout</Button>
        </Form>
      </div>

      <div className="mt-4">
        <div className="my-8">
          <Friends />
        </div>
        <div className="my-8">
          <ReceivedFriendRequests />
        </div>
        <div className="my-8">
          <SearchUsers />
        </div>
        <div className="my-8">
          <FeatureFlags />
        </div>
      </div>
    </div>
  );
}

function Friends() {
  const { friends, user } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  return (
    <>
      <h1 className="text-xl font-bold tracking-tight mb-2">Friends</h1>
      <hr className="border-gray-700" />
      <div className="flex flex-col gap-2 mt-4">
        {friends.length > 0 ? (
          friends.map((f) => {
            const friend = f.friendIdFrom === user.id ? f.userTo : f.userFrom;
            return (
              <div
                key={f.id}
                className="flex gap-2 items-center justify-between px-2 py-3 rounded-lg transition dark:hover:bg-slate-700"
              >
                <div className="flex gap-2 items-center">
                  <img
                    src={friend?.avatarUrl || DUMMY_AVATAR_IMAGE_URL}
                    alt="friend request user profile image"
                    className="rounded-full h-10 w-10 md:h-12 md:w-12"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col  text-sm tracking-wide">
                    <span>{friend?.username}</span>
                  </div>
                </div>
                <fetcher.Form
                  method="delete"
                  action="/api/friend"
                  className="flex gap-1"
                >
                  <input
                    type="hidden"
                    name="_action"
                    id="_action"
                    value="removeFriend"
                  />
                  <input
                    type="hidden"
                    name="friendRowId"
                    id="friendRowId"
                    value={f.id}
                  />
                  <Button
                    className="btn-circle btn-outline btn-error"
                    title="Remove friend"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </fetcher.Form>
              </div>
            );
          })
        ) : (
          <p className="text-gray-600 text-sm text-center">
            No friends added yet!
          </p>
        )}
      </div>
    </>
  );
}

function ReceivedFriendRequests() {
  const { myReceivedFriendRequests } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  return (
    <>
      <h1 className="text-xl font-bold tracking-tight mb-2">Friend Requests</h1>
      <hr className="border-gray-700" />
      <div className="flex flex-col gap-2 mt-4">
        {myReceivedFriendRequests.length > 0 ? (
          myReceivedFriendRequests.map((f) => (
            <div
              key={f.id}
              className="flex gap-2 items-center justify-between px-2 py-3 rounded-lg transition dark:hover:bg-slate-700"
            >
              <div className="flex gap-2 items-center">
                <img
                  src={f.user?.avatarUrl || DUMMY_AVATAR_IMAGE_URL}
                  alt="friend request user profile image"
                  className="rounded-full h-10 w-10 md:h-12 md:w-12"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col  text-sm tracking-wide">
                  <span>{f.user?.username}</span>
                </div>
              </div>
              <fetcher.Form
                method="put"
                action="/api/friendRequest"
                className="flex gap-1"
              >
                <input
                  type="hidden"
                  name="_action"
                  id="_action"
                  value="updateFriendRequest"
                />
                <input
                  type="hidden"
                  name="friendRequestId"
                  id="friendRequestId"
                  value={f.id}
                />
                <Button
                  name="value"
                  id="value"
                  value="accept"
                  className="btn-primary"
                >
                  Accept
                </Button>
                <Button
                  name="value"
                  id="value"
                  value="decline"
                  className="btn-error"
                >
                  Decline
                </Button>
              </fetcher.Form>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-sm text-center">
            No friend requests yet!
          </p>
        )}
      </div>
    </>
  );
}

function isErrorObj(data: unknown): data is { error: string } {
  const schema = z.object({
    error: z.string(),
  });

  return schema.safeParse(data).success;
}

function SearchUsers() {
  const { user } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof searchUsersLoader>();
  const isLoading = fetcher.state === "loading";

  if (isErrorObj(fetcher.data)) {
    return (
      <>
        <fetcher.Form method="get" action="/api/users">
          <Input
            label="Search users"
            name="search"
            id="search"
            autoComplete="off"
          />
        </fetcher.Form>
        <div className="mt-4">
          <p className="text-sm text-red-400">Error: {fetcher.data.error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <fetcher.Form
        method="get"
        action="/api/users"
        onChange={(e) => {
          fetcher.submit(e.currentTarget);
        }}
      >
        <Input
          label={
            <div className="flex gap-1 items-center">
              Search users {isLoading ? <Spinner /> : null}
            </div>
          }
          placeholder="Username, Email or Name"
          name="search"
          id="search"
        />
      </fetcher.Form>
      <div className="mt-4">
        {fetcher.data ? (
          fetcher.data.users.length > 0 ? (
            <div className="flex flex-col gap-1">
              {fetcher.data?.users.map((u) => (
                <UserRow key={u.id} user={u} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center text-sm">No users found</p>
          )
        ) : null}
      </div>
    </>
  );
}

type UserRowProps = {
  children?: React.ReactNode;
  user: Record<string, any>;
};

function UserRow({ children, user }: UserRowProps) {
  const { user: loggedInUser } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  //TODO: if loggedInUser has this user has a friend then don't show the add friend button
  const {
    friendRequests,
    myReceivedFriendRequests,
    friends,
    mySentFriendRequests,
  } = useLoaderData<typeof loader>();

  const areUsersFriends = friends.some(
    (f) =>
      (f.friendIdFrom === loggedInUser?.id && f.friendIdTo === user.id) ||
      (f.friendIdFrom === user?.id && f.friendIdTo === loggedInUser?.id)
  );
  const hasPendingRequest = friendRequests.some(
    (f) =>
      f.friendRequestFrom === loggedInUser?.id &&
      f.friendRequestTo === user.id &&
      f.status === "PENDING"
  );
  const hasReceivedFriendRequest = myReceivedFriendRequests.some(
    (f) => f.friendRequestFrom === user.id
  );
  return (
    <div className="flex gap-2 items-center justify-between px-2 py-3 rounded-lg transition dark:hover:bg-slate-700">
      <div className="flex gap-2 justify-between text-gray-300 items-center">
        <img
          src={user.avatarUrl || DUMMY_AVATAR_IMAGE_URL}
          alt="user profile image"
          className="rounded-full h-10 w-10 md:h-12 md:w-12"
          referrerPolicy="no-referrer"
        />
        <div className="flex flex-col text-sm tracking-wide">
          <span>{user.username}</span>
          <span className="text-xs text-gray-400">
            {user.firstName} {user.lastName}
          </span>
        </div>
      </div>

      {/* TODO: remove if the user already has this friend */}
      {hasPendingRequest ? <span>Pending request</span> : null}
      {hasReceivedFriendRequest ? <span>Reply to request</span> : null}
      {!areUsersFriends &&
      !hasReceivedFriendRequest &&
      !hasPendingRequest &&
      loggedInUser?.id !== user.id ? (
        <fetcher.Form method="post" action="/api/friendRequest">
          <input
            type="hidden"
            name="friendIdTo"
            id="friendIdTo"
            value={user.id}
          />
          <Button type="submit">Add friend</Button>
        </fetcher.Form>
      ) : null}
    </div>
  );
}

function FeatureFlags() {
  const { featureFlags } = useLoaderData<typeof loader>();

  return (
    <>
      <h1 className="text-xl font-bold tracking-tight mb-2">Features</h1>
      <hr className="border-gray-700" />
      {featureFlags.map((f) => (
        <FeatureFlagRow key={f.id} featureFlag={f} />
      ))}
    </>
  );
}

type FeatureFlagRowProps = {
  featureFlag: SerializeFrom<
    FeatureFlag & {
      childrenFeatureFlags: ChildrenFeatureFlag[];
    }
  >;
};

function FeatureFlagRow({ featureFlag }: FeatureFlagRowProps) {
  const loggedInUser = useRouteLoaderData<RootLoaderData>("root");
  const fetcher = useFetcher();
  const submit = useSubmit();
  const userFlagEnabled = loggedInUser?.userFeatureFlags.some(
    (uf) => uf.featureFlagId === featureFlag.id && uf.enabled
  );
  return (
    <>
      <fetcher.Form
        method="post"
        onChange={(e) => {
          submit(e.currentTarget, {
            replace: true,
            navigate: false,
            preventScrollReset: true,
            action: "/api/featureFlag",
            method: "post",
          });
        }}
      >
        <input type="hidden" name="featureFlagId" value={featureFlag.id} />
        <input type="hidden" name="_action" value="updateUserFeatureFlag" />
        <Switch
          label={featureFlag.name}
          description={featureFlag.description}
          badge={featureFlag.badge}
          name="enabled"
          className="checked:toggle-primary"
          defaultChecked={userFlagEnabled}
        />
      </fetcher.Form>
      {userFlagEnabled && featureFlag.childrenFeatureFlags.length > 0 ? (
        <div className="mt-2 text-sm border-l-2 border-l-gray-700 ml-3 pl-2">
          {featureFlag.childrenFeatureFlags.map((ffc) => (
            <ChildrenFeatureFlagRow childFeatureFlag={ffc} key={ffc.id} />
          ))}
        </div>
      ) : null}
    </>
  );
}

type ChildrenFeatureFlagRowProps = {
  childFeatureFlag: SerializeFrom<ChildrenFeatureFlag>;
};

function ChildrenFeatureFlagRow({
  childFeatureFlag,
}: ChildrenFeatureFlagRowProps) {
  const loggedInUser = useRouteLoaderData<RootLoaderData>("root");
  const fetcher = useFetcher();
  const submit = useSubmit();
  return (
    <fetcher.Form
      method="post"
      onSubmit={(e) => {
        e.preventDefault();
      }}
      onBlur={(e) => {
        submit(e.currentTarget, {
          replace: true,
          navigate: false,
          preventScrollReset: true,
          action: "/api/childFeatureFlag",
          method: "post",
        });
      }}
    >
      <input
        type="hidden"
        name="childFeatureFlagId"
        value={childFeatureFlag.id}
      />
      <input type="hidden" name="_action" value="updateUserChildFeatureFlag" />
      <div className="form-control" key={childFeatureFlag.id}>
        <input
          type="hidden"
          name="childrenFeatureFlagId"
          value={childFeatureFlag.id}
        />

        <label className="label cursor-pointer">
          <span className="label-text">
            {childFeatureFlag.name}{" "}
            {childFeatureFlag.badge ? (
              <span className="badge badge-xs text-2xs badge-outline badge-primary ml-1">
                {childFeatureFlag.badge}
              </span>
            ) : null}
          </span>
          <input
            className="input input-bordered max-w-24"
            type={childFeatureFlag.inputType}
            defaultValue={
              loggedInUser?.userChildrenFeatureFlag.find(
                (ufc) => ufc.childrenFeatureFlagId === childFeatureFlag.id
              )?.value || undefined
            }
            name="value"
          />
        </label>
        {childFeatureFlag.description ? (
          <span className="px-1 text-xs text-gray-500">
            {childFeatureFlag.description}
          </span>
        ) : null}
      </div>
    </fetcher.Form>
  );
}
