import { Habit, MarkedHabit } from '@prisma/client'
import { SerializeFrom } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { format, parseISO } from 'date-fns'
import React from 'react'
import Trash from '../icons/Trash'

type MarkedHabitRowProps = {
  markedHabit: SerializeFrom<MarkedHabit & { habit: Habit }>
}

export default function MarkedHabitRow({ markedHabit }: MarkedHabitRowProps) {
  const fetcher = useFetcher()
  const isSubmitting = !!fetcher.formData

  return (
    <div
      className={`flex gap-2 py-2 group justify-between items-center transition rounded-xl px-4 hover:bg-gray-50 ${
        isSubmitting ? 'scale-50 opacity-0 origin-left' : ''
      }`}>
      <div className='flex gap-4 items-center'>
        <div
          className='h-10 w-10 rounded-full shadow-sm'
          style={{ backgroundColor: markedHabit.habit.colour }}></div>
        <div>
          <p>{markedHabit.habit.name}</p>
          <p className='text-xs text-gray-500'>
            {format(parseISO(markedHabit.createdAt), 'HH:mm')}
          </p>
        </div>
      </div>
      <fetcher.Form method='post'>
        <input type='hidden' name='_action' value='remove-marked-habit' />
        <input type='hidden' name='markedHabit-id' value={markedHabit.id} />
        <button
          type='submit'
          className='py-2 pl-6 pr-2 text-red-300 md:opacity-0  hover:text-red-400  group-hover:opacity-100 transition'
          disabled={isSubmitting}>
          <Trash />
        </button>
      </fetcher.Form>
    </div>
  )
}
