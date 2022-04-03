import Habit from "~/models/Habit.server";
import { HabitWithId } from "~/types/habits.server";
export async function getHabitsForUser(userId: string) {
  return await Habit.find<HabitWithId>({ user: userId }).sort({ name: 1 });
}
