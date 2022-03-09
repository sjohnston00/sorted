import { LoaderFunction } from "remix";
import MarkedHabit from "~/models/MarkedHabit.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const { userId, date } = params;

  if (typeof userId !== "string" || typeof date !== "string") {
    return {
      error: "User ID or Date is not a string"
    };
  }

  const choosenDate = new Date(date);
  const nextDate = new Date(choosenDate);
  nextDate.setDate(choosenDate.getDate() + 1);

  const dateFilter = {
    $gte: choosenDate,
    $lt: nextDate
  };

  const dates = await MarkedHabit.find({ user: userId, date: dateFilter })
    .populate("habit")
    .sort({ date: 1 });
  return dates;
};
