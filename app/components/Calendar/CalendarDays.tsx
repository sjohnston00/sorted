import React from "react";
import CalendarDayButton from "./CalendarDayButton";
import { isSameDay, parseISO } from "date-fns";

type CalendarDaysProps = {
  days: Date[];
  month: Date;
  selectedDay: Date;
  setSelectedDay: React.Dispatch<React.SetStateAction<Date>>;
  monthIndicators?: any[];
};

export default function CalendarDays({
  days,
  month,
  selectedDay,
  setSelectedDay,
  monthIndicators,
}: CalendarDaysProps) {
  return (
    <div className="grid grid-cols-7 mt-2 text-sm">
      {days.map((day, dayIdx) => {
        const dayIndicators = monthIndicators?.filter((m) =>
          isSameDay(parseISO(m.date), day)
        );
        return (
          <CalendarDayButton
            key={day.toString()}
            dayIndicators={dayIndicators}
            day={day}
            dayIdx={dayIdx}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            month={month}
          />
        );
      })}
    </div>
  );
}
