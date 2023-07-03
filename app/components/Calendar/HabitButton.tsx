import { Habit } from "@prisma/client"
import { SerializeFrom } from "@remix-run/node"
import { useFetcher } from "@remix-run/react"
import { format } from "date-fns"
import React from "react"

type HabitButtonProps = {
  habit: SerializeFrom<Habit>
  selectedDay: Date
}

export default function HabitButton({ habit, selectedDay }: HabitButtonProps) {
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state === "submitting"
  return (
    <fetcher.Form method="post" className="h-full w-full">
      <input type="hidden" name="_action" value="mark-date" />
      <input
        type="hidden"
        name="date"
        value={format(selectedDay, "yyyy-MM-dd")}
      />
      <input type="hidden" name="habitName" value={habit.name} />
      <input type="hidden" name="habitColour" value={habit.colour} />
      <button
        className="min-h-[8rem] w-full py-4 min px-2 rounded shadow border-2 text-center font-semibold text-lg tracking-wide disabled:opacity-30 disabled:cursor-not-allowed active:opacity-70 active:scale-90 transition"
        style={
          {
            color: habit.colour,
            borderColor: habit.colour,
            backgroundColor: `${habit.colour}20`,
            "--tw-shadow-color": habit.colour,
          } as React.CSSProperties
        }
        type="submit"
        name="habitId"
        value={habit.id}
        disabled={isSubmitting}>
        {habit.name}
      </button>
    </fetcher.Form>
  )
}
