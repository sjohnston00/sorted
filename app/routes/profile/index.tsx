import React from "react"
import { HiSearch } from "react-icons/hi"
import {
  ActionFunction,
  Link,
  LoaderFunction,
  useFetcher,
  useLoaderData,
  useMatches,
} from "remix"
import { FriendRequestRow } from "~/components/FriendRequestRow"
import { FriendRow } from "~/components/FriendRow"
import LoadingIndicator from "~/components/LoadingIndicator"
import ProfileVisibility from "~/components/ProfileVisibility"
import FriendRequest from "~/models/FriendRequest.server"
import User from "~/models/User.server"
import { MongoDocument } from "~/types"
import { FriendRequest as FriendRequestType } from "~/types/friends.server"
import { User as UserType } from "~/types/user.server"
import { requireUserId } from "~/utils/session.server"
import { updateUserVisibility } from "~/utils/user.server"

type LoaderData = {
  friendRequests: MongoDocument<FriendRequestType>[]
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const friendRequests = await FriendRequest.find({
    to: userId,
    accepted: false,
  })
    .populate("from to")
    .sort({ createdAt: -1 })

  return { friendRequests }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const userId = await requireUserId(request)
  const data = Object.fromEntries(formData)

  if (data._action === "update-visibility") {
    await updateUserVisibility(
      userId,
      data.visibility === "public" ? "public" : "private"
    )
  }

  if (data._action === "add-friend") {
    if (data.friendRequestAction === "0") {
      await FriendRequest.updateOne(
        { _id: data.friendRequestId },
        { $set: { accepted: true } }
      )
      return {}
    }
    const acceptedFriendRequest = await FriendRequest.findOneAndUpdate(
      { _id: data.friendRequestId },
      { $set: { accepted: true } }
    )

    await Promise.all([
      User.updateOne(
        { _id: acceptedFriendRequest?.from },
        {
          $push: { friends: acceptedFriendRequest?.to },
        }
      ),
      User.updateOne(
        { _id: acceptedFriendRequest?.to },
        {
          $push: { friends: acceptedFriendRequest?.from },
        }
      ),
    ])

    return { acceptedFriendRequest }
  }

  if (data._action === "remove-friend") {
    await Promise.all([
      User.updateOne({ _id: userId }, { $pull: { friends: data.friendId } }),
      User.updateOne({ _id: data.friendId }, { $pull: { friends: userId } }),
    ])
    return {}
  }

  return { data }
}

export default function Index() {
  const { friendRequests } = useLoaderData<LoaderData>()
  const [{ data }] = useMatches()
  const user: MongoDocument<UserType> = data.user
  const imageSize = 144
  return (
    <>
      <div className="flex justify-around pt-4 mb-4">
        <div className="flex items-center flex-col gap-4">
          <img
            src={`${user.gravatarURL}&s=200`}
            className="rounded-full"
            alt="users profile image"
            width={imageSize}
            height={imageSize}
          />
          <span className="text-lg tracking-wide text-neutral-200">
            {user.username}
          </span>
        </div>
        <div className="self-center py-8 border-l-2 border-l-neutral-600 flex flex-col gap-1 justify-center items-center pl-6">
          <h2 className="text-3xl font-medium tracking-wide">Joined</h2>
          <span className="font-light text-neutral-400">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      {/* <UserProfileVisibility user={user} /> */}
      {/* The top 3 users friend requests*/}
      {friendRequests.length > 0 ? (
        <>
          <Link
            to={"friend-requets"}
            className="flex items-start gap-2 text-3xl tracking-wide font-medium hover:no-underline text-neutral-50 hover:text-neutral-50 mb-4"
          >
            Friend Requests
            <span className="text-sm">{friendRequests.length}</span>
          </Link>
          {friendRequests.map((friendRequest) => (
            <FriendRequestRow
              friendRequest={friendRequest}
              key={friendRequest._id}
            />
          ))}
          {friendRequests.length > 3 ? (
            <Link to={"friend-requests"} className="block text-center">
              See All
            </Link>
          ) : null}
        </>
      ) : null}
      {user.friends.length > 0 ? (
        <>
          <Link
            to={"friends"}
            className="flex items-start gap-2 text-3xl tracking-wide font-medium hover:no-underline text-neutral-50 hover:text-neutral-50 mb-4"
          >
            Friends
            <span className="text-sm">{user.friends.length}</span>
          </Link>
          {user.friends.map((friend) => (
            <FriendRow friend={friend} key={friend._id} />
          ))}
          {user.friends.length > 3 ? (
            <Link to={"friends"} className="block text-center">
              See All
            </Link>
          ) : null}
        </>
      ) : null}
      <h1 className="text-3xl tracking-wide font-medium mt-4">Settings</h1>
      <h2 className="text-2xl tracking-wide font-medium ">
        Profile Visibility
      </h2>
      <p className="mb-4 text-neutral-200">
        Public profiles allow users to be able to add you as a friend. Private
        profiles do not allow you to be searchable but you can still keep your
        current friends.
      </p>
      {/* <Form
        className="flex justify-around"
        ref={ref}
        onChange={(e) => ref.current?.submit()}
        method="put"
      >
        <label
          className="flex gap-2 items-center"
          htmlFor="profile-visibility-public"
        >
          <input
            type={"radio"}
            name="profile-visibility"
            defaultChecked={user.visibility === "public"}
            id="profile-visibility-public"
            value={"public"}
          />
          Public
        </label>
        <label
          className="flex gap-2 items-center"
          htmlFor="profile-visibility-private"
        >
          <input
            type={"radio"}
            name="profile-visibility"
            defaultChecked={user.visibility === "private"}
            id="profile-visibility-private"
            value={"private"}
          />
          Private
        </label>
      </Form> */}
      <ProfileVisibility visibility={user.visibility} />
      <h2 className="text-2xl tracking-wide font-medium ">Profile Picture</h2>
      <p className="text-neutral-200">
        Your profile picture comes from gravatar, simply use the same email here
        as your gravatar account.
      </p>
      <h1 className="text-3xl tracking-wide font-medium my-4">Account</h1>
      <div className="flex flex-col gap-2">
        <Link
          to={"change-password"}
          className="btn border-2 text-sky-500 border-sky-600 bg-sky-600 bg-opacity-40 hover:bg-opacity-80 hover:bg-sky-600 text-center"
        >
          Change Password
        </Link>
        <Link
          to={"search-friends"}
          className="btn border-2 text-sky-500 border-sky-600 bg-sky-600 bg-opacity-40 hover:bg-opacity-80 hover:bg-sky-600 justify-center flex items-center gap-1"
        >
          Search Friends <HiSearch />
        </Link>
        <form action="/logout" method="post">
          <button className="btn border-2 text-red-500 hover:text-neutral-100 border-red-600 bg-red-600 bg-opacity-40 hover:bg-opacity-80 hover:bg-red-600 w-full">
            Logout
          </button>
        </form>
        <Link to={"delete-account"} className="btn btn-danger text-center">
          Delete Account
        </Link>
      </div>
    </>
  )
}

type UserProfileVisibilityProps = {
  user: MongoDocument<UserType>
}

export function UserProfileVisibility({ user }: UserProfileVisibilityProps) {
  const fetcher = useFetcher()
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    fetcher.submit(
      {
        visibility: String(e.target.checked),
        _action: "update-visibility",
      },
      {
        action: `${window.location.href}?index`,
        method: "put",
        encType: "application/x-www-form-urlencoded",
      }
    )
  }
  return (
    <fetcher.Form method="put">
      <label htmlFor="profile-visibility" className="block">
        Public Profile{" "}
        {fetcher.state === "submitting" ? (
          <LoadingIndicator className="spinner h-6 w-6" />
        ) : null}
      </label>
      <input
        type="checkbox"
        defaultChecked={user.visibility === "public"}
        onChange={handleFormChange}
        name="profile-visibility"
        id="profile-visibility"
      />
    </fetcher.Form>
  )
}
