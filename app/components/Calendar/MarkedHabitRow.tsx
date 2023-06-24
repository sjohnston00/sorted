import { Habit, MarkedHabit } from '@prisma/client'
import { SerializeFrom } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import React from 'react'

type MarkedHabitRowProps = {
  markedHabit: SerializeFrom<MarkedHabit & { habit: Habit }>
}

export default function MarkedHabitRow({ markedHabit }: MarkedHabitRowProps) {
  const fetcher = useFetcher()
  return (
    <div className='flex gap-2 py-2 items-center'>
      <span>{markedHabit.habit.name}</span>
      <div
        className='h-3 w-3 rounded-full shadow-sm'
        style={{ backgroundColor: markedHabit.habit.colour }}></div>
    </div>
  )
}
