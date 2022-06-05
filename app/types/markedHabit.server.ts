import { MongoDocument } from "."
import { Habit } from "./habits.server"
import { User } from "./user.server"

export type MarkedHabit = {
  date: Date | string
  habit: MongoDocument<Habit>
  user: MongoDocument<User>
  visibility: "public" | "private"
  note: string
}
