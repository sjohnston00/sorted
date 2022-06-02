import React from "react"
import { HiCheck, HiX } from "react-icons/hi"
import {
  ActionFunction,
  Link,
  LoaderFunction,
  useFetcher,
  useLoaderData,
  useMatches,
} from "remix"
import FriendRequest from "~/models/FriendRequest.server"
import User from "~/models/User.server"
import { User as UserType } from "~/types/user.server"
import { requireUserId } from "~/utils/session.server"
import { getUserDetails } from "~/utils/user.server"

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const user = await getUserDetails(userId)

  const friendRequests = await FriendRequest.find({
    to: userId,
    accepted: false,
  })
    .populate("from to")
    .sort({ createdAt: -1 })

  return { user, friendRequests }
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const formData = await request.formData()
  const data = Object.fromEntries(formData)

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

    await User.updateOne(
      { _id: acceptedFriendRequest?.from },
      {
        $push: { friends: acceptedFriendRequest?.to },
      }
    )
    await User.updateOne(
      { _id: acceptedFriendRequest?.to },
      {
        $push: { friends: acceptedFriendRequest?.from },
      }
    )

    return { acceptedFriendRequest }
  }

  if (data._action === "remove-friend") {
    await User.updateOne({ _id: userId }, { $pull: { friends: data.friendId } })
    await User.updateOne({ _id: data.friendId }, { $pull: { friends: userId } })
    return {}
  }
}

export default function Friends() {
  const { friendRequests, user } = useLoaderData()

  return (
    <div className="my-2">
      <Link to="/profile" className="btn btn-dark mb-2">
        Back
      </Link>
      <h2>Friend Requests</h2>
      <div className="flex flex-col gap-2">
        {friendRequests.length > 0 ? (
          friendRequests.map((friendRequest: any) => (
            <FriendRequestRow
              friendRequest={friendRequest}
              key={friendRequest._id}
            />
          ))
        ) : (
          <p className="text-red-500 ">No Friend request yet</p>
        )}
      </div>
      Friends
      {user.friends.length > 0 ? (
        user.friends.map((friend: any) => (
          <FriendRow friend={friend} key={friend._id} />
        ))
      ) : (
        <p className="text-red-500 ">No Friends yet</p>
      )}
    </div>
  )
}

function FriendRow({ friend }: any) {
  const fetcher = useFetcher()
  return (
    <div
      className={`flex gap-2 items-end transition-all ${
        fetcher.submission ? "opacity-50" : ""
      }`}
    >
      <div className="flex gap-2 flex-col">
        <img
          src={friend.gravatarURL}
          className="rounded-full"
          width={48}
          height={48}
        />
        <span>{friend.username}</span>
      </div>
      <fetcher.Form method="post">
        <input type="hidden" name="friendId" id="friendId" value={friend._id} />
        <input
          type="hidden"
          name="_action"
          id="_action"
          value="remove-friend"
        />
        <button type="submit">
          <HiX className="h-8 w-8" />
        </button>
      </fetcher.Form>
    </div>
  )
}

function FriendRequestRow({ friendRequest }: any) {
  const fetcher = useFetcher()
  return (
    <div
      className={`transition-all flex gap-2 items-center ${
        fetcher.submission ? "opacity-50" : ""
      }`}
    >
      From: {friendRequest.from?.username} To: {friendRequest.to?.username}{" "}
      <fetcher.Form method="post">
        <input
          type="hidden"
          name="friendRequestId"
          id="friendRequestId"
          value={friendRequest._id}
        />
        <input type="hidden" name="_action" id="_action" value="add-friend" />
        <div className="flex gap-2 items-center">
          <button
            className="p-0.5"
            type="submit"
            name="friendRequestAction"
            id="friendRequestAction"
            value="1"
          >
            <HiCheck className="h-8 w-8" />
          </button>
          <button
            className="p-0.5"
            type="submit"
            name="friendRequestAction"
            id="friendRequestAction"
            value="0"
          >
            <HiX className="h-8 w-8" />
          </button>
        </div>
      </fetcher.Form>
    </div>
  )
}
