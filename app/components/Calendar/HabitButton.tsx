import { Habit } from '@prisma/client'
import { SerializeFrom } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { format } from 'date-fns'
import React from 'react'

type HabitButtonProps = {
  habit: SerializeFrom<Habit>
  selectedDay: Date
}

export default function HabitButton({ habit, selectedDay }: HabitButtonProps) {
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state === 'submitting'
  return (
    <fetcher.Form method='post'>
      <input type='hidden' name='_action' value='mark-date' />
      <input
        type='hidden'
        name='date'
        value={format(selectedDay, 'yyyy-MM-dd')}
      />
      <button
        className='py-4 px-2 rounded shadow border-2 font-semibold text-lg tracking-wide uppercase disabled:opacity-80 disabled:cursor-not-allowed active:opacity-70 active:scale-90 transition'
        style={
          {
            color: habit.colour,
            borderColor: habit.colour,
            backgroundColor: `${habit.colour}20`,
            '--tw-shadow-color': habit.colour
          } as React.CSSProperties
        }
        type='submit'
        name='habitId'
        value={habit.id}
        disabled={isSubmitting}>
        {habit.name}
      </button>
    </fetcher.Form>
  )
}
