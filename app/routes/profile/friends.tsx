import React from "react"
import {
  ActionFunction,
  LoaderFunction,
  useFetcher,
  useLoaderData,
  useMatches,
} from "remix"
import FriendRequest from "~/models/FriendRequest.server"
import { User } from "~/types/user.server"
import { requireUserId } from "~/utils/session.server"
import { getUserDetails } from "~/utils/user.server"

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const user = await getUserDetails(userId)

  //TODO: get the friend requests that have the current user in
  const friendRequests = await FriendRequest.find({
    $or: [{ from: userId }, { to: userId }],
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
    const acceptedFriendRequest = await FriendRequest.updateOne(
      { _id: data.friendRequestId },
      { $set: { accepted: true } }
    )

    return { acceptedFriendRequest }
  }
}

export default function Friends() {
  const [{ data }] = useMatches()
  const { user } = data as { user: User }
  const { friendRequests } = useLoaderData()

  return (
    <div>
      Friend Requests
      <div className="flex flex-col gap-2">
        {friendRequests.map((friendRequest: any) => (
          <FriendRequestRow
            friendRequest={friendRequest}
            key={friendRequest._id}
          />
        ))}
      </div>
      Friends
      {user.friends.map((friend) => (
        <div key={friend.email}>{friend.username}</div>
      ))}
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
