import React from "react";
import { Link } from "remix";
import { MarkedHabitWithHabit } from "~/types/markedHabit.server";
import CustomCalendarDay from "./customCalendarDay";

type Props = {
  month: Date;
  markedHabits: Array<MarkedHabitWithHabit>;
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  today: Date;
};

export default function customCalendarMonth({
  month,
  markedHabits,
  selectedDate,
  setSelectedDate,
  today
}: Props) {
  let loopingDay = new Date(month);
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  let days: Array<Array<Date | null>> = [
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null]
  ];

  for (let i = 0; i < days.length; i++) {
    for (let j = 0; j < days[i].length; j++) {
      if (loopingDay.getUTCMonth() !== month.getUTCMonth()) {
        break;
      }

      const loopingWeekday = loopingDay.toLocaleString("en", {
        weekday: "short"
      });
      const loopingWeekdayIndex = weekdays.indexOf(loopingWeekday);
      //set the weekday index to index in the loop
      j = loopingWeekdayIndex;

      days[i][j] = new Date(loopingDay);
      const nextLoopingDay = loopingDay.setUTCDate(loopingDay.getUTCDate() + 1);
      loopingDay = new Date(nextLoopingDay);
    }
  }

  const monthYearString = month.toLocaleString("en", {
    month: "long",
    year: "numeric"
  });
  return (
    <div className='calendar-month'>
      <h6 className='calendar-month-header'>{monthYearString}</h6>
      <div className='calendar-month-weekdays-header'>
        {weekdays.map((weekday, index) => {
          const isWeekend = index === 5 || index === 6;
          return (
            <span
              className={`${isWeekend ? "text-muted" : ""}`}
              key={`${monthYearString}-${weekday}`}>
              {weekday}
            </span>
          );
        })}
      </div>
      <div key={`${monthYearString}`} className='calendar-month-days'>
        {days.map((week) =>
          week.map((day, j) => (
            <CustomCalendarDay
              key={`${day?.getTime()}`}
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
  );
}
