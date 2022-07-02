import React from "react"
import { LoaderFunction, useLoaderData } from "remix"
import BackButton from "~/components/BackButton"
import { FriendRequestRow } from "~/components/FriendRequestRow"
import { MongoDocument } from "~/types"
import { User as UserType } from "~/types/user.server"
import { FriendRequest as FriendRequestType } from "~/types/friends.server"
import { requireUserId } from "~/utils/session.server"
import { getUserDetails } from "~/utils/user.server"
import FriendRequest from "~/models/FriendRequest.server"

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

export default function FriendRequests() {
  const { friendRequests } = useLoaderData<LoaderData>()
  return (
    <div className="my-2">
      <BackButton to="/profile">Profile</BackButton>
      <h2 className="flex items-start gap-2 text-3xl tracking-wide font-medium mb-2">
        Friend Requests
        <span className="text-sm text-neutral-400">
          {friendRequests.length}
        </span>
      </h2>
      <div className="flex flex-col gap-2">
        {friendRequests.length > 0 ? (
          friendRequests.map((friendRequest) => (
            <FriendRequestRow
              friendRequest={friendRequest}
              key={friendRequest._id}
            />
          ))
        ) : (
          <p className="text-neutral-400 text-sm font-light">
            No friend requests
          </p>
        )}
      </div>
    </div>
  )
}
