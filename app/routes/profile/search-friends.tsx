import React from "react"
import {
  ActionFunction,
  Form,
  Link,
  LoaderFunction,
  useFetcher,
  useLoaderData,
  useMatches,
  useSearchParams,
} from "remix"
import User from "~/models/User.server"
import type { User as UserType } from "~/types/user.server"
import {
  HiOutlineUserAdd,
  HiOutlineUserRemove,
  HiUser,
  HiX,
} from "react-icons/hi"
import { requireUserId } from "~/utils/session.server"
import { createFriendRequest } from "~/utils/friends.server"
import FriendRequest from "~/models/FriendRequest.server"
import { FriendRequest as FriendRequestType } from "~/types/friends.server"
import { MongoDocument } from "~/types"

type LoaderData = {
  users?: MongoDocument<UserType>[]
  myFriendRequests: MongoDocument<FriendRequestType>[]
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const url = new URL(request.url)
  const searchedUsername = url.searchParams.get("username")

  //search for users if the username params is there
  if (typeof searchedUsername === "string") {
    if (searchedUsername.length > 0) {
      const users = await User.find({
        username: new RegExp(searchedUsername, "i"),
        visibility: "public",
      })
      const myFriendRequests = await FriendRequest.find({
        $or: [{ from: userId }, { to: userId }],
        accepted: false,
      })

      //TODO: sort the users by if they are friends first
      return {
        users: users.filter((user) => !user._id.equals(userId)),
        myFriendRequests,
      }
    } else {
      return {}
    }
  }
  return {}
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  //TODO: Validate that the user is not already friends with the user
  //TODO: Validate that the user has not already sent a friend request
  if (data._action === "send-friend-request") {
    await createFriendRequest(userId, data.userId.toString())
    return {}
  }

  if (data._action === "cancel-friend-request") {
    await FriendRequest.updateOne(
      { _id: data.friendRequestId },
      { $set: { accepted: true } }
    )
    return {}
  }
  if (data._action === "accept-friend-request") {
    await Promise.all([
      FriendRequest.updateOne(
        { _id: data.friendRequestId },
        { $set: { accepted: true } }
      ),
      User.updateOne(
        { _id: userId },
        {
          $push: { friends: data.userId },
        }
      ),
      User.updateOne(
        { _id: data.userId },
        {
          $push: { friends: userId },
        }
      ),
    ])
    return {}
  }
  if (data._action === "decline-friend-request") {
    await FriendRequest.updateOne(
      { _id: data.friendRequestId },
      { $set: { accepted: true } }
    )
    return {}
  }

  return { data }
}

export default function SearchFriends() {
  const data = useLoaderData<LoaderData>()
  const [searchParams] = useSearchParams()
  return (
    <div>
      <Form method="get">
        <input
          type="text"
          className="input"
          name="username"
          id="username"
          defaultValue={searchParams.get("username") || ""}
        />
        <div className="flex gap-2 py-2">
          <Link className="btn btn-dark" to={"/profile"}>
            Back
          </Link>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </Form>
      <div className="flex flex-col gap-4 p-2">
        {data?.users?.map((user) => (
          <UserRow
            user={user}
            key={user._id}
            myFriendRequests={data.myFriendRequests}
          />
        ))}
      </div>
    </div>
  )
}

type UserRowProps = {
  user: UserType & { _id: string }
  myFriendRequests: Array<
    FriendRequestType & {
      _id: string
    }
  >
}

function UserRow({ user, myFriendRequests }: UserRowProps) {
  const [{ data }] = useMatches()
  const loggedInUser: MongoDocument<UserType> = data.user
  const fetcher = useFetcher()
  const isFriend = loggedInUser?.friends?.includes(user._id)

  const friendRequest = myFriendRequests.find(
    (friendRequest) =>
      friendRequest.from === user._id || friendRequest.to === user._id
  )

  const myFriendRequestPending = myFriendRequests.some(
    (friendRequest) =>
      friendRequest.from === loggedInUser._id && friendRequest.to === user._id
  )
  const incomingFriendRequestPending = myFriendRequests.some(
    (friendRequest) =>
      friendRequest.from === user._id && friendRequest.to === loggedInUser._id
  )

  return (
    <div
      className={`transition-all flex items-center ${
        fetcher.submission ? "opacity-50" : ""
      }`}
    >
      <div className="flex gap-2">
        <img
          src={user.gravatarURL}
          className={`rounded-full ${
            isFriend
              ? "outline outline-2 outline-offset-2 outline-green-500"
              : ""
          }`}
          width={48}
          height={48}
        />
        <p className="py-2">{user.username}</p>
      </div>
      <fetcher.Form method="post">
        <input type="hidden" name="userId" id="userId" value={user._id} />
        <input
          type="hidden"
          name="friendRequestId"
          id="friendRequestId"
          value={friendRequest?._id}
        />
        {incomingFriendRequestPending ? (
          <>
            <button
              className={`p-2`}
              name="_action"
              id="_action"
              title="Accept Friend Request"
              value="accept-friend-request"
            >
              <HiOutlineUserAdd />
            </button>
            <button
              className={`p-2`}
              name="_action"
              id="_action"
              title="Decline Friend Request"
              value="decline-friend-request"
            >
              <HiOutlineUserRemove />
            </button>
          </>
        ) : myFriendRequestPending ? (
          <div className="flex items-center">
            <HiUser className={`h-8 w-8`} title="Friend Request Pending" />
            <button
              className={`p-2`}
              name="_action"
              id="_action"
              title="Cancel Friend Request"
              value="cancel-friend-request"
            >
              <HiX />
            </button>
          </div>
        ) : (
          <button
            className={`p-2`}
            name="_action"
            id="_action"
            title="Send Friend Request"
            value="send-friend-request"
            disabled={isFriend}
          >
            {!isFriend && <HiOutlineUserAdd />}
          </button>
        )}
      </fetcher.Form>
    </div>
  )
}
