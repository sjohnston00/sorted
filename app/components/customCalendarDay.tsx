import React from "react";
import { Link } from "remix";

type Props = {
  today: Date;
  year: number;
  month: number;
  day: number | null;
};
export default function customCalendarDay({ year, month, day, today }: Props) {
  const calDate = day ? new Date(year, month, day) : null;
  const isToday =
    year === today.getFullYear() &&
    month === today.getMonth() &&
    day === today.getDate();
  const isWeekend = calDate?.getDay() === 6 || calDate?.getDay() === 0;
  const dateLink = day ? `/dashboard/${year}-${month}-${day}` : `#`;

  return (
    <div>
      <Link
        className={`${isToday ? "bg-primary" : ""} ${
          isWeekend ? "text-muted" : " text-neutral-800 dark:text-neutral-50"
        } p-1.5 transition-all hover:no-underline hover:bg-primary rounded-full ${
          day ? "" : "pointer-events-none"
        }`}
        to={dateLink}>
        {day}
      </Link>
    </div>
  );
}
