import { Types } from "mongoose"
import { Habit } from "./habits.server"
import { User } from "./user.server"

export type MarkedHabit = {
  date: Date | string
  habit: Types.ObjectId
  user: Types.ObjectId
}

export type MarkedHabitWithId = MarkedHabit & {
  _id: string
}

export interface MarkedHabitWithHabit extends Omit<MarkedHabitWithId, "habit"> {
  habit: Habit
}

export interface MarkedHabitWithUser extends Omit<MarkedHabitWithId, "user"> {
  user: User
}

export interface MarkedHabitWithUserAndHabit
  extends Omit<MarkedHabitWithId, "user" | "habit"> {
  user: User
  habit: Habit
}
