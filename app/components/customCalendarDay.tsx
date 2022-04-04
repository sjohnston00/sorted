import React from "react"
import { Link } from "remix"
import { MarkedHabitWithHabit } from "~/types/markedHabit.server"

type Props = {
  day: Date | null
  markedHabits: Array<MarkedHabitWithHabit>
  selectedDate: Date
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>
  today: Date
}
export default function customCalendarDay({
  day,
  markedHabits,
  selectedDate,
  setSelectedDate,
  today,
}: Props) {
  const calDate = day ? new Date(day) : null
  const isSelected =
    calDate?.getUTCFullYear() === selectedDate.getUTCFullYear() &&
    calDate?.getUTCMonth() === selectedDate.getUTCMonth() &&
    calDate.getUTCDate() === selectedDate.getUTCDate()

  const isToday =
    calDate?.getUTCFullYear() === today.getUTCFullYear() &&
    calDate?.getUTCMonth() === today.getUTCMonth() &&
    calDate.getUTCDate() === today.getUTCDate()
  const isWeekend = calDate?.getDay() === 6 || calDate?.getDay() === 0
  const todaysHabits = markedHabits.filter((markedHabit) => {
    if (!calDate) return false

    const markedHabitDate = new Date(markedHabit.date)
    const nextDate = new Date(new Date(calDate).setDate(calDate.getDate() + 1))
    return markedHabitDate >= calDate && markedHabitDate < nextDate
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
        } w-9 h-9`}
        onClick={() => {
          if (calDate) {
            setSelectedDate(calDate)
          }
        }}
      >
        {day?.getDate()}
      </button>
      <div className="calendar-month-day-habits">
        {todaysHabits.map((todayHabit, i) => (
          <div
            key={`${todayHabit._id}-${i}`}
            className="h-4 w-4 rounded-full shadow-sm"
            style={{ backgroundColor: todayHabit.habit.colour }}
            title={todayHabit.habit.name}
          ></div>
        ))}
      </div>
    </div>
  )
}
