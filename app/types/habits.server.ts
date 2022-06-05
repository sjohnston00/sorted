import { MongoDocument } from "."
import { User } from "./user.server"

export type Habit = {
  name: string
  colour: string
  user: MongoDocument<User>
  visibility: "public" | "private"
  note: string
}
