import { MongoDocument } from "."
import type { User } from "./user.server"

export type FriendRequest = {
  from: MongoDocument<User>
  to: MongoDocument<User>
  createdAt: string
  updatedAt: string
  accepted: boolean
}
