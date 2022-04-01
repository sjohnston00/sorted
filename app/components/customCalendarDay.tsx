import React from "react"
import { Link } from "remix"
import { MarkedHabitWithHabit } from "~/types/markedHabit.server"

type Props = {
  year: number
  month: number
  day: number | null
  markedHabits: Array<MarkedHabitWithHabit>
  selectedDate: Date
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>
  today: Date
}
export default function customCalendarDay({
  year,
  month,
  day,
  markedHabits,
  selectedDate,
  setSelectedDate,
  today,
}: Props) {
  const calDate = day ? new Date(year, month, day) : null
  const isSelected =
    year === selectedDate.getFullYear() &&
    month === selectedDate.getMonth() &&
    day === selectedDate.getDate()

  const isToday =
    year === today.getFullYear() &&
    month === today.getMonth() &&
    day === today.getDate()
  const isWeekend = calDate?.getDay() === 6 || calDate?.getDay() === 0
  const todaysHabits = markedHabits.filter((markedHabit) => {
    const markedHabitDateString = markedHabit.date.toString().split("T")[0]
    const calendarDateString = calDate?.toISOString().split("T")[0]

    return markedHabitDateString == calendarDateString
  })
  return (
    <div className="calendar-month-day">
      <button
        id={isToday ? "today" : ""}
        className={`${
          isSelected
            ? "text-neutral-800 dark:text-neutral-50 bg-primary shadow-sm"
            : ""
        } ${
          isWeekend ? "text-muted" : " text-neutral-800 dark:text-neutral-50"
        } p-1.5 transition-all hover:no-underline self-center hover:bg-primary rounded-full scroll-mt-48 ${
          day ? "" : "pointer-events-none"
        }`}
        onClick={() => {
          if (calDate) {
            setSelectedDate(calDate)
          }
        }}
      >
        {day}
      </button>
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
