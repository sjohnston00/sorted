import React from "react"
import { Link } from "remix"
import { MarkedHabitWithHabit } from "~/types/markedHabit.server"

type Props = {
  today: Date
  year: number
  month: number
  day: number | null
  markedHabits: Array<MarkedHabitWithHabit>
}
export default function customCalendarDay({
  year,
  month,
  day,
  today,
  markedHabits,
}: Props) {
  const calDate = day ? new Date(year, month, day) : null
  const isToday =
    year === today.getFullYear() &&
    month === today.getMonth() &&
    day === today.getDate()
  const isWeekend = calDate?.getDay() === 6 || calDate?.getDay() === 0
  const dateLink = day ? `/dashboard/${year}-${month + 1}-${day}` : `#`
  const todaysHabits = markedHabits.filter((markedHabit) => {
    const markedHabitDateString = markedHabit.date.toString().split("T")[0]
    const calendarDateString = calDate?.toISOString().split("T")[0]

    return markedHabitDateString == calendarDateString
  })
  return (
    <div className="calendar-month-day">
      <Link
        className={`${isToday ? "bg-primary" : ""} ${
          isWeekend ? "text-muted" : " text-neutral-800 dark:text-neutral-50"
        } p-1.5 transition-all hover:no-underline hover:bg-primary rounded-full ${
          day ? "" : "pointer-events-none"
        }`}
        to={dateLink}
      >
        {day}
      </Link>
      <div className="calendar-month-day-habits">
        {todaysHabits.map((todayHabit) => (
          <div
            key={`${year}-${month}-${day}-${todayHabit._id}`}
            className="h-4 w-4 rounded-full shadow-sm"
            style={{ backgroundColor: todayHabit.habit.colour }}
            title={todayHabit.habit.name}
          ></div>
        ))}
      </div>
    </div>
  )
}
