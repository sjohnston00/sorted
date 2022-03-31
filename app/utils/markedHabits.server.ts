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

  return (await MarkedHabit.find({ user: userId, date: searchFilter })
    .populate("habit")
    .sort({ date: 1 })) as any
}
