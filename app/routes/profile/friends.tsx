import React from "react"
import { HiCheck, HiX } from "react-icons/hi"
import {
  ActionFunction,
  Link,
  LoaderFunction,
  useFetcher,
  useLoaderData,
} from "remix"
import FriendRequest from "~/models/FriendRequest.server"
import { FriendRequest as FriendRequestType } from "~/types/friends.server"
import { User as UserType } from "~/types/user.server"
import User from "~/models/User.server"
import { MongoDocument } from "~/types"
import { requireUserId } from "~/utils/session.server"
import { getUserDetails } from "~/utils/user.server"
import { FriendRow } from "~/components/FriendRow"
import { FriendRequestRow } from "~/components/FriendRequestRow"

type LoaderData = {
  user: MongoDocument<UserType>
  friendRequests: MongoDocument<FriendRequestType>[]
}

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
}

export default function Friends() {
  const { friendRequests, user } = useLoaderData<LoaderData>()

  return (
    <div className="my-2">
      <Link to="/profile" className="btn btn-dark mb-2">
        Back
      </Link>
      <h2>Friend Requests</h2>
      <div className="flex flex-col gap-2">
        {friendRequests.length > 0 ? (
          friendRequests.map((friendRequest) => (
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
        user.friends.map((friend) => (
          <FriendRow friend={friend} key={friend._id} />
        ))
      ) : (
        <p className="text-red-500 ">No Friends yet</p>
      )}
    </div>
  )
}
