import Habit from "~/models/Habit.server";
export async function getHabitsForUser(userId: string) {
  return await Habit.find({ user: userId }).sort({ name: 1 });
}
