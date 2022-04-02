import React, { useEffect, useRef, useState } from "react";
import { MarkedHabitWithHabit } from "~/types/markedHabit.server";
import CustomCalendarMonth from "./customCalendarMonth";
import TodayButton from "./TodayButton";

type CalendarMonth = {
  month: number;
  year: number;
};

type Props = {
  markedHabits: Array<MarkedHabitWithHabit>;
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
};

export default function customCalendar({
  markedHabits,
  selectedDate,
  setSelectedDate
}: Props) {
  const [showMonths, setShowMonths] = useState(3);
  const [priorMonths, setPriorMonths] = useState(3);
  let observer: React.MutableRefObject<IntersectionObserver>;
  if (typeof window !== "undefined") {
    observer = useRef(
      new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.target.id === "calendar-top") {
            if (entry.isIntersecting) {
              setPriorMonths((prev) => {
                // return prev + 5;
                return prev;
              });
            }
          }
          if (entry.target.id === "calendar-bottom") {
            if (entry.isIntersecting) {
              // setShowMonths((prev) => prev + 5);
              setShowMonths((prev) => prev);
            }
          }
        },
        { threshold: 0.3, rootMargin: "20px" }
      )
    );
  }
  const [bottom, setBottom] = useState<HTMLDivElement | null>(null);
  const [top, setTop] = useState<HTMLDivElement | null>(null);

  const today = new Date();
  //this month
  const startMonth = new Date(
    today.getUTCFullYear(),
    today.getUTCMonth() - priorMonths,
    1
  );
  const endMonth = new Date(
    today.getUTCFullYear(),
    today.getUTCMonth() + showMonths,
    1
  );

  let loopingMonth = new Date(startMonth);
  let months: Array<Date> = [];

  while (loopingMonth < endMonth) {
    months.push(loopingMonth);
    let nextMonth = loopingMonth.setUTCMonth(loopingMonth.getUTCMonth() + 1);
    loopingMonth = new Date(nextMonth);
  }

  useEffect(() => {
    const bottomElement = bottom;
    const topElement = top;
    const currentObserver = observer.current;

    if (bottomElement && topElement) {
      currentObserver.observe(bottomElement);
      currentObserver.observe(topElement);
    }

    return () => {
      if (bottomElement && topElement) {
        currentObserver.unobserve(bottomElement);
        currentObserver.unobserve(topElement);
      }
    };
  }, [bottom, top]);

  return (
    <div className='calendar'>
      <div ref={setTop} id='calendar-top'></div>
      {months.map((month) => (
        <CustomCalendarMonth
          key={`month-${month.getTime()}`}
          month={month}
          markedHabits={markedHabits}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          today={today}
        />
      ))}
      <TodayButton setSelectedDate={setSelectedDate} />
      <div ref={setBottom} id='calendar-bottom'></div>
    </div>
  );
}
