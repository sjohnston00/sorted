import { Habit, MarkedHabit } from '@prisma/client'
import { SerializeFrom } from '@remix-run/node'
import { useFetcher, useFetchers } from '@remix-run/react'
import { format, parseISO } from 'date-fns'
import React from 'react'
import Trash from '../icons/Trash'
import { motion } from 'framer-motion'
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import EllipsisVertical from '../icons/EllipsisVertical'

type MarkedHabitRowProps = {
  markedHabit: SerializeFrom<MarkedHabit & { habit: Habit }>
  closeModal: () => void
  openModal: () => void
  setFocusedMarkedHabit: React.Dispatch<
    React.SetStateAction<SerializeFrom<MarkedHabit & { habit: Habit }> | null>
  >
}

export default function MarkedHabitRow({
  markedHabit,
  openModal,
  setFocusedMarkedHabit
}: MarkedHabitRowProps) {
  const fetcher = useFetcher()
  const fetchers = useFetchers()
  const isSubmitting = !!fetcher.formData

  console.log(fetchers)

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
      className={`flex gap-2 group justify-between items-center transition rounded-xl  hover:bg-gray-50 dark:hover:bg-gray-700 focus-within:bg-gray-50 dark:focus-within:bg-gray-700 ${
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

          {fetchers.filter(
            (f) =>
              f.formData?.get('_action')?.toString() ===
                'updateMarkedHabitTime' &&
              f.formData?.get('markedHabitId')?.toString() === markedHabit.id &&
              f.state === 'submitting'
          )[0] ? (
            <p className='text-xs text-gray-300'>
              {fetchers
                .filter(
                  (f) =>
                    f.formData?.get('_action')?.toString() ===
                      'updateMarkedHabitTime' &&
                    f.formData?.get('markedHabitId')?.toString() ===
                      markedHabit.id &&
                    f.state === 'submitting'
                )[0]
                .formData?.get('newMarkedHabitTime')
                ?.toString()}{' '}
              saving...
            </p>
          ) : (
            <p className='text-xs text-gray-500'>
              {format(parseISO(markedHabit.date), 'HH:mm')}
            </p>
          )}
        </div>
      </div>
      <div className='flex gap-px items-center'>
        <fetcher.Form method='post'>
          <input type='hidden' name='_action' value='remove-marked-habit' />
          <input type='hidden' name='markedHabit-id' value={markedHabit.id} />
          <button
            type='submit'
            className='py-2 px-3 text-red-300 md:opacity-0 hover:text-red-400 focus:text-red-400 group-focus-within:opacity-100 group-hover:opacity-100 transition'
            disabled={isSubmitting}>
            <Trash />
          </button>
        </fetcher.Form>
        <button
          type='button'
          className='py-2 px-3 text-gray-300 md:opacity-0 hover:text-gray-400 focus:text-gray-400 group-focus-within:opacity-100 group-hover:opacity-100 transition'
          onClick={() => {
            setFocusedMarkedHabit(markedHabit)
            openModal()
          }}>
          <EllipsisVertical />
        </button>
      </div>
    </motion.div>
  )
}
