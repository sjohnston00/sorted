import MarkedHabit from "~/models/MarkedHabit.server";

export async function getMarkedHabitsForUser(userId: string) {
  return await MarkedHabit.find({ user: userId })
    .populate("habit")
    .sort({ date: 1 });
}
