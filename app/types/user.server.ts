import { MongoDocument } from "."

export type User = {
  username: string
  email: string
  password: string
  visibility: "public" | "private"
  gravatarURL: string
  friends: MongoDocument<User>[]
}
