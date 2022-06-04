import { ActionFunction, LoaderFunction, redirect } from "remix"
import { requireUserId } from "~/utils/session.server"
import { getMarkedHabitsForUser } from "~/utils/markedHabits.server"
import { getHabitsForUser } from "~/utils/habits.server"
import MarkedHabit from "~/models/MarkedHabit.server"
import mongoose from "mongoose"
import { MarkedHabitWithHabit } from "~/types/markedHabit.server"
import { Habit } from "~/types/habits.server"

type LoaderData = {
  habits: Array<Habit>
  markedHabits: Array<MarkedHabitWithHabit>
}

type ActionData = {
  errors?: {
    message?: string
    habit?: string
    markedDate?: string
  }
}

export const loader: LoaderFunction = async ({
  request,
  params,
}): Promise<LoaderData> => {
  const userId = await requireUserId(request)
  if (typeof params.date !== "string") {
    throw redirect("/dashboard")
  }
  const dateStamp = Number(params.date)
  if (isNaN(dateStamp)) {
    throw redirect("/dashboard")
  }

  const date = new Date(dateStamp)

  const nextDate = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + 1,
      0,
      0,
      0,
      0
    )
  )

  const markedHabits = await getMarkedHabitsForUser(userId, date, nextDate)
  const habits = await getHabitsForUser(userId)

  return {
    habits: habits,
    markedHabits: markedHabits,
  }
}

export const action: ActionFunction = async ({
  request,
  params,
}): Promise<ActionData> => {
  const userId = await requireUserId(request)
  const formData = await request.formData()

  if (request.method === "DELETE") {
    const markedHabitId = formData.get("markedHabitId")
    if (typeof markedHabitId !== "string") {
      return {}
    }
    await MarkedHabit.deleteOne({
      _id: markedHabitId,
      user: userId,
    })
    return {}
  }
  const habitId = formData.get("selectedHabit")

  const date = params.date
  if (typeof habitId !== "string" || typeof date !== "string") {
    return {
      errors: {
        message: "Please provide a valid Habit",
        markedDate: "Please provide a valid Date",
      },
    }
  }

  const newMarkedHabit = new MarkedHabit({
    user: new mongoose.Types.ObjectId(userId),
    habit: new mongoose.Types.ObjectId(habitId),
    date: new Date(date),
  })

  await newMarkedHabit.save()
  return {}
}
