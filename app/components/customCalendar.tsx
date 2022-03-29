import React, { useEffect, useRef, useState } from "react"
import CustomCalendarMonth from "./customCalendarMonth"

type CalendarMonth = {
  month: number
  year: number
}

export default function customCalendar() {
  const [showMonths, setShowMonths] = useState(10)
  const [priorMonths, setPriorMonths] = useState(2)
  let observer: React.MutableRefObject<IntersectionObserver>
  if (typeof window !== "undefined") {
    observer = useRef(
      new IntersectionObserver(
        (entries) => {
          const [entry] = entries
          if (entry.target.id === "calendar-top") {
            if (entry.isIntersecting) {
              setPriorMonths((prev) => {
                return prev + 5
              })
            }
          }
          if (entry.target.id === "calendar-bottom") {
            if (entry.isIntersecting) {
              setShowMonths((prev) => prev + 5)
            }
          }
        },
        { threshold: 0.3, rootMargin: "20px" }
      )
    )
  }
  const [bottom, setBottom] = useState<HTMLDivElement | null>(null)
  const [top, setTop] = useState<HTMLDivElement | null>(null)
  const date = new Date()

  //2 months prior
  date.setMonth(date.getMonth() - priorMonths)
  date.setDate(1)
  let months: Array<CalendarMonth> = []
  for (let i = 0; i < showMonths; i++) {
    const month = date.getMonth()
    months.push({ month: month, year: date.getFullYear() })
    date.setMonth(month + 1)
  }

  useEffect(() => {
    const bottomElement = bottom
    const topElement = top
    const currentObserver = observer.current

    if (bottomElement && topElement) {
      currentObserver.observe(bottomElement)
      currentObserver.observe(topElement)
    }

    return () => {
      if (bottomElement && topElement) {
        currentObserver.unobserve(bottomElement)
        currentObserver.unobserve(topElement)
      }
    }
  }, [bottom, top])

  return (
    <div className="calendar">
      <div ref={setTop} id="calendar-top"></div>
      {months.map(({ month, year }) => (
        <CustomCalendarMonth month={month} year={year} />
      ))}
      <div ref={setBottom} id="calendar-bottom"></div>
    </div>
  )
}
