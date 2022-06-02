import MarkedHabit from "~/models/MarkedHabit.server"
import { MarkedHabitWithHabit } from "~/types/markedHabit.server"

export async function getMarkedHabitsForUser(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Array<MarkedHabitWithHabit>> {
  const searchFilter = {
    $gte: startDate.toISOString(),
    $lt: endDate.toISOString(),
  }

  const markedHabits = await MarkedHabit.find<MarkedHabitWithHabit>({
    user: userId,
    date: searchFilter,
  })
    .populate("habit")
    .sort({ date: 1 })
  return markedHabits
}
export async function getMarkedHabitsForFriend(
  friendId: string,
  startDate: Date,
  endDate: Date
): Promise<Array<MarkedHabitWithHabit>> {
  const searchFilter = {
    $gte: startDate.toISOString(),
    $lt: endDate.toISOString(),
  }

  const markedHabits = await MarkedHabit.find<MarkedHabitWithHabit>({
    user: friendId,
    date: searchFilter,
    visibility: "public",
  })
    .populate("habit")
    .sort({ date: 1 })
  return markedHabits
}

export async function deleteMarkedHabitsForUser(userId: string) {
  return await MarkedHabit.deleteMany({ user: userId })
}
