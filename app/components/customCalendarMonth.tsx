import React from "react"
import { Link } from "remix"
import { MarkedHabitWithHabit } from "~/types/markedHabit.server"
import CustomCalendarDay from "./customCalendarDay"

type Props = {
  month: number
  year: number
  markedHabits: Array<MarkedHabitWithHabit>
  selectedDate: Date
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>
  today: Date
}

export default function customCalendarMonth({
  month,
  year,
  markedHabits,
  selectedDate,
  setSelectedDate,
  today,
}: Props) {
  const date = new Date(year, month, 1)
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const monthDays = (month: number, year: number) => {
    var d = new Date(year, month + 1, 0)
    return d.getDate()
  }

  let days: Array<Array<number | null>> = [
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
  ]

  for (let i = 0; i < days.length; i++) {
    for (let j = 0; j < days[i].length; j++) {
      if (date.getMonth() !== month) {
        break
      }

      const firstOfMonthDay = date.toLocaleString("en", {
        weekday: "short",
      })
      const indexOfDay = weekdays.indexOf(firstOfMonthDay)
      const day = date.getDate()
      j = indexOfDay

      days[i][indexOfDay] = day
      date.setDate(day + 1)
    }
  }

  const monthYearString = new Date(year, month, 1).toLocaleString("en", {
    month: "long",
    year: "numeric",
  })
  return (
    <div className="calendar-month">
      <h6 className="calendar-month-header">{monthYearString}</h6>
      <div className="calendar-month-weekdays-header">
        {weekdays.map((weekday, index) => {
          const isWeekend = index === 5 || index === 6
          return (
            <span
              className={`${isWeekend ? "text-muted" : ""}`}
              key={`${monthYearString}-${weekday}`}
            >
              {weekday}
            </span>
          )
        })}
      </div>
      <div key={`${monthYearString}`} className="calendar-month-days">
        {days.map((week) =>
          week.map((day, j) => (
            <CustomCalendarDay
              key={`${year}-${month}-${day ? day : `empty${j}`}`}
              year={year}
              month={month}
              day={day}
              selectedDate={selectedDate}
              markedHabits={markedHabits}
              setSelectedDate={setSelectedDate}
              today={today}
            />
          ))
        )}
      </div>
    </div>
  )
}
