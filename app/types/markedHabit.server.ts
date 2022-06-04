import { Habit } from "./habits.server"
import { User } from "./user.server"

export type MarkedHabit = {
  date: Date | string
  habit: Habit
  user: User
  visibility: "public" | "private"
  note: string
}
