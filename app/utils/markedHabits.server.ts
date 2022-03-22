import MarkedHabit from "~/models/MarkedHabit.server"

export async function getMarkedHabitsForUser(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  const searchFilter = {
    $gte: startDate.toISOString(),
    $lt: endDate.toISOString(),
  }

  return await MarkedHabit.find({ user: userId, date: searchFilter })
    .populate("habit")
    .sort({ date: 1 })
}
