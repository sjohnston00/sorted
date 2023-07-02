import { Habit, MarkedHabit } from '@prisma/client'
import { SerializeFrom } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import { format, parseISO } from 'date-fns'
import React from 'react'
import Trash from '../icons/Trash'
import { motion } from 'framer-motion'

type MarkedHabitRowProps = {
  markedHabit: SerializeFrom<MarkedHabit & { habit: Habit }>
}

export default function MarkedHabitRow({ markedHabit }: MarkedHabitRowProps) {
  const fetcher = useFetcher()
  const isSubmitting = !!fetcher.formData

  return (
    <motion.div
      // initial={{ opacity: 0, height: 0 }}
      animate={{
        opacity: isSubmitting ? 0 : 1,
        scale: isSubmitting ? 0 : 1,
        height: isSubmitting ? 0 : 'auto'
      }}
      transition={{
        duration: 0.15
      }}
      // exit={{ opacity: 0, height: 0 }}
      className={`flex gap-2 group justify-between items-center transition rounded-xl hover:bg-gray-50 ${
        isSubmitting ? '' : ''
      }`}>
      <div className='flex gap-4 py-2 px-4 items-center'>
        <div
          className='h-10 w-10 rounded-full shadow-sm'
          style={{ backgroundColor: markedHabit.habit.colour }}></div>
        <div>
          <p>
            {markedHabit.habit.name}{' '}
            {/* TODO: Figure out to calculate streaks */}
            {/* <span className='text-sm text-gray-400' title='Streak'>
              🔥 4
            </span> */}
          </p>
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
    </motion.div>
  )
}
