import { Habit, MarkedHabit } from '@prisma/client'
import { SerializeFrom } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { format } from 'date-fns'
import React from 'react'

type MarkedHabitRowProps = {
  markedHabit: SerializeFrom<MarkedHabit & { habit: Habit }>
}

export default function MarkedHabitRow({ markedHabit }: MarkedHabitRowProps) {
  const fetcher = useFetcher()
  const isSubmitting = !!fetcher.submission

  return (
    <div
      className={`flex gap-2 py-2 items-center transition ${
        isSubmitting ? 'hidden' : ''
      }`}>
      <span>{markedHabit.habit.name}</span>
      <div
        className='h-3 w-3 rounded-full shadow-sm'
        style={{ backgroundColor: markedHabit.habit.colour }}></div>
      <fetcher.Form method='post'>
        <input type='hidden' name='_action' value='remove-marked-habit' />
        <input type='hidden' name='markedHabit-id' value={markedHabit.id} />
        <button type='submit' className='p-2' disabled={isSubmitting}>
          x
        </button>
      </fetcher.Form>
    </div>
  )
}
