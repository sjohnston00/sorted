import React from "react"
import {
  ActionFunction,
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
    <div>
      Friend Requests
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
      {user.friends.map((friend: any) => (
        <FriendRow friend={friend} key={friend._id} />
      ))}
    </div>
  )
}

function FriendRow({ friend }: any) {
  const fetcher = useFetcher()
  return (
    <div
      className={`flex gap-2 items-center transition-all ${
        fetcher.submission ? "opacity-70" : ""
      }`}
    >
      {friend.username}{" "}
      <fetcher.Form method="post">
        <input type="hidden" name="friendId" id="friendId" value={friend._id} />
        <input
          type="hidden"
          name="_action"
          id="_action"
          value="remove-friend"
        />
        <button type="submit">&times;</button>
      </fetcher.Form>
    </div>
  )
}

function FriendRequestRow({ friendRequest }: any) {
  const fetcher = useFetcher()
  return (
    <div className="flex gap-2 ">
      From: {friendRequest.from?.username} To: {friendRequest.to?.username}{" "}
      <fetcher.Form method="post">
        <input
          type="hidden"
          name="friendRequestId"
          id="friendRequestId"
          value={friendRequest._id}
        />
        <input type="hidden" name="_action" id="_action" value="add-friend" />
        <button type="submit" disabled={friendRequest.accepted}>
          {friendRequest.accepted ? "✔" : "❌"}
        </button>
      </fetcher.Form>
    </div>
  )
}
