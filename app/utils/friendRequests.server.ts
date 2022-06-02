import FriendRequest from "~/models/FriendRequest.server"

export async function declineAllFriendRequestForUser(userId: string) {
  return await FriendRequest.updateMany(
    { $or: [{ to: userId }, { from: userId }] },
    { $set: { accepted: true } }
  )
}
