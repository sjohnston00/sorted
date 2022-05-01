import type { User } from "./user.server"

export type FriendRequest = {
  from: User
  to: User
  createdAt: Date
  updatedAt: Date
  accepted: boolean
}
