import { Habit, MarkedHabit } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";
import {
  endOfDay,
  format,
  getDay,
  isAfter,
  isEqual,
  isSameMonth,
  isToday,
  startOfToday,
} from "date-fns";
import { twMerge } from "tailwind-merge";
import { classNames } from "~/utils/index.client";

let colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];

type CalendarDayButtonProps = {
  day: Date;
  dayIdx: number;
  selectedDay: Date;
  setSelectedDay: React.Dispatch<React.SetStateAction<Date>>;
  month: Date;
  dayIndicators?: SerializeFrom<(MarkedHabit & { habit: Habit })[]>;
};

export default function CalendarDayButton({
  day,
  dayIdx,
  selectedDay,
  setSelectedDay,
  month,
  dayIndicators,
}: CalendarDayButtonProps) {
  const today = startOfToday();
  return (
    <div
      className={classNames(
        dayIdx === 0 && colStartClasses[getDay(day) - 1],
        "py-1.5"
      )}
    >
      <button
        disabled={isAfter(day, endOfDay(today))}
        type="submit"
        name="date"
        value={format(day, "yyyy-MM-dd")}
        className={twMerge(
          "mx-auto flex h-8 w-8 items-center justify-center rounded-full disabled:!text-gray-400 disabled:pointer-events-none",
          isEqual(day, selectedDay) && "text-white",
          !isEqual(day, selectedDay) && isToday(day) && "text-red-500",
          !isEqual(day, selectedDay) &&
            !isToday(day) &&
            isSameMonth(day, month) &&
            "text-gray-900 dark:text-gray-300",
          !isEqual(day, selectedDay) &&
            !isToday(day) &&
            !isSameMonth(day, month) &&
            "text-gray-400",

          isEqual(day, selectedDay) && isToday(day) && "bg-red-500",
          isEqual(day, selectedDay) && !isToday(day) && "bg-gray-900",
          !isEqual(day, selectedDay) &&
            "hover:bg-gray-200 dark:hover:bg-gray-700",
          (isEqual(day, selectedDay) || isToday(day)) && "font-semibold"
        )}
        onClick={() => {
          setSelectedDay(day);
        }}
      >
        <time dateTime={format(day, "yyyy-MM-dd")}>{format(day, "d")}</time>
      </button>
      <div className="grid grid-cols-3 min-h-1.5 w-fit gap-0.5 mx-auto mt-1">
        {dayIndicators?.map((m) => (
          <div
            key={`calendar-${m.id}`}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: m.habit.colour,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
