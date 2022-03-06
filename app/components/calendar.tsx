import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";

type Props = {
  markedHabits: any;
  value: Date;
  onChange: React.Dispatch<React.SetStateAction<Date>>;
};

export default function CalendarComponent({
  markedHabits,
  value,
  onChange
}: Props) {
  const today = new Date();

  useEffect(() => {
    // console.log(value);
  }, [value]);

  return (
    <div>
      <Calendar
        onChange={onChange}
        value={value}
        minDate={today}
        minDetail={"year"}
        className='text-white'
        tileContent={({ activeStartDate, date, view }) => {
          const todaysHabits = markedHabits.filter(
            (markedHabit: any) =>
              new Date(markedHabit.date).getDate() === date.getDate() &&
              new Date(markedHabit.date).getMonth() === date.getMonth() &&
              new Date(markedHabit.date).getFullYear() === date.getFullYear()
          );

          return (
            <div className='flex justify-center items-center mt-2'>
              {todaysHabits.length > 0 ? (
                todaysHabits.map((todayHabit: any) => (
                  <div
                    className='h-4 w-4 mr-1 border-2 border-slate-700 rounded-full shadow-sm'
                    style={{ backgroundColor: todayHabit.habit.colour }}
                    title={todayHabit.habit.name}></div>
                ))
              ) : (
                <p>&nbsp;</p>
              )}
            </div>
          );
        }}
        showNeighboringMonth={true}
        showFixedNumberOfWeeks={true}
      />
    </div>
  );
}
