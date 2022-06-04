import { User } from "./user.server"

export type Habit = {
  name: string
  colour: string
  user: User
  visibility: "public" | "private"
  note: string
}
