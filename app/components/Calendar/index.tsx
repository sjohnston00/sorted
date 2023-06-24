import React, { useState } from 'react'
import MarkedHabitRow from './MarkedHabitRow'
import { Form } from '@remix-run/react'
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  parseISO,
  startOfToday
} from 'date-fns'
import { Habit, MarkedHabit } from '@prisma/client'
import Chevron from '../icons/Chevron'
import { classNames } from '~/utils'
import { SerializeFrom } from '@remix-run/node'
import HabitButton from './HabitButton'

type CalendarProps = {
  markedHabits: SerializeFrom<(MarkedHabit & { habit: Habit })[]>
  habits: SerializeFrom<Habit[]>
  startWeekMonday?: boolean
}

export default function Calendar({
  markedHabits,
  habits,
  startWeekMonday
}: CalendarProps) {
  let colStartClasses = [
    '',
    'col-start-2',
    'col-start-3',
    'col-start-4',
    'col-start-5',
    'col-start-6',
    'col-start-7'
  ]

  const today = startOfToday()
  const [selectedDay, setSelectedDay] = useState(today)
  const [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'))
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date())

  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth)
  })

  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'))
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'))
  }

  const selectedDayMarkedHabits = markedHabits.filter((m) =>
    isSameDay(new Date(m.date), selectedDay)
  )
  return (
    <div className='md:grid md:grid-cols-2 md:divide-x md:divide-gray-200'>
      <div className='md:pr-14'>
        <div className='flex items-center'>
          <h2 className='flex-auto font-semibold text-gray-900'>
            {format(firstDayCurrentMonth, 'MMMM yyyy')}
          </h2>
          <button
            type='button'
            onClick={previousMonth}
            className='-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500'>
            <span className='sr-only'>Previous month</span>
            <Chevron direction='left' />
          </button>
          <button
            onClick={nextMonth}
            type='button'
            className='-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500'>
            <span className='sr-only'>Next month</span>
            <Chevron direction='right' />
          </button>
        </div>
        <div className='grid grid-cols-7 mt-10 text-xs leading-6 text-center text-gray-500'>
          <div>S</div>
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
        </div>
        <div className='grid grid-cols-7 mt-2 text-sm'>
          {days.map((day, dayIdx) => (
            <div
              key={day.toString()}
              className={classNames(
                dayIdx === 0 && colStartClasses[getDay(day)],
                'py-1.5'
              )}>
              <button
                type='submit'
                name='date'
                value={format(day, 'yyyy-MM-dd')}
                onClick={() => setSelectedDay(day)}
                className={classNames(
                  isEqual(day, selectedDay) && 'text-white',
                  !isEqual(day, selectedDay) && isToday(day) && 'text-red-500',
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    isSameMonth(day, firstDayCurrentMonth) &&
                    'text-gray-900',
                  !isEqual(day, selectedDay) &&
                    !isToday(day) &&
                    !isSameMonth(day, firstDayCurrentMonth) &&
                    'text-gray-400',
                  isEqual(day, selectedDay) && isToday(day) && 'bg-red-500',
                  isEqual(day, selectedDay) && !isToday(day) && 'bg-gray-900',
                  !isEqual(day, selectedDay) && 'hover:bg-gray-200',
                  (isEqual(day, selectedDay) || isToday(day)) &&
                    'font-semibold',
                  'mx-auto flex h-8 w-8 items-center justify-center rounded-full'
                )}>
                <time dateTime={format(day, 'yyyy-MM-dd')}>
                  {format(day, 'd')}
                </time>
              </button>
              <div className='flex w-fit gap-px mx-auto mt-1'>
                {markedHabits
                  .filter((m) => isSameDay(parseISO(m.date), day))
                  .slice(0, 3)
                  .map((m) => (
                    <div
                      className='w-1 h-1 rounded-full'
                      style={{
                        backgroundColor: m.habit.colour
                      }}></div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className='p-4 '>
        <div className='min-h-[5rem]'>
          {selectedDayMarkedHabits.length > 0 ? (
            selectedDayMarkedHabits.map((s) => (
              <MarkedHabitRow key={s.id} markedHabit={s} />
            ))
          ) : (
            <span className='text-gray-400 block text-center'>
              No habits marked for this day
            </span>
          )}
        </div>

        <hr />
        <div className='grid grid-cols-3 place-items-center mt-4'>
          {habits.map((h) => (
            <HabitButton habit={h} selectedDay={selectedDay} key={h.id} />
          ))}
        </div>
      </div>
    </div>
  )
}
