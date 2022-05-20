import FriendRequest from "~/models/FriendRequest.server"

export async function createFriendRequest(
  fromUserId: string,
  toUserId: string
) {
  const newFriendRequest = new FriendRequest({
    from: fromUserId,
    to: toUserId,
  })
  const savedFriendRequest = await newFriendRequest.save()
  return savedFriendRequest
}
