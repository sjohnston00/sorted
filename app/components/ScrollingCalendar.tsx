import React, { useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  parseISO,
  startOfToday,
  startOfWeek,
  subMonths
} from 'date-fns'
import { classNames } from '~/utils'
import { twMerge } from 'tailwind-merge'
import { AutoSizer, List } from 'react-virtualized'

type ScrollingCalendarProps = {
  indicators?: any[]
  monthsPrevious?: number
  monthsNext?: number
}

export default function ScrollingCalendar({
  indicators,
  monthsPrevious = 5,
  monthsNext = 2
}: ScrollingCalendarProps) {
  //   const { markedHabits } = useLoaderData<typeof loader>();
  const today = startOfToday()
  const currentMonth = format(today, 'MMM-yyyy')
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date())
  const previousMonths: Date[] = []
  const [selectedDay, setSelectedDay] = useState(today)

  for (let index = monthsPrevious; index > 0; index--) {
    previousMonths.push(subMonths(firstDayCurrentMonth, index))
  }

  const nextMonths: Date[] = []
  for (let index = 0; index < monthsNext; index++) {
    nextMonths.push(addMonths(firstDayCurrentMonth, index + 1))
  }

  const monhts = [...previousMonths, firstDayCurrentMonth, ...nextMonths]

  let colStartClasses = [
    '',
    'col-start-2',
    'col-start-3',
    'col-start-4',
    'col-start-5',
    'col-start-6',
    'col-start-7'
  ]
  return (
    <div className='flex gap-8 overflow-x-auto snap-x snap-mandatory pb-4 mb-20 [-webkit-overflow-scrolling:touch] scroll-smooth'>
      {monhts.map((month, i) => {
        const days = eachDayOfInterval({
          start: startOfWeek(month, {
            weekStartsOn: 1
          }),
          end: endOfWeek(endOfMonth(month), {
            weekStartsOn: 1
          })
        })
        const monthIndicators = indicators?.filter((m) =>
          isSameMonth(parseISO(m.date), month)
        )
        return (
          // TODO: Get `react-virtualized` working
          // https://github.com/bvaughn/react-virtualized/issues/1632
          // Maybe try using <Grid/> instead of <List/> for horizontal scrolling as suggested in
          //
          // https://stackoverflow.com/questions/46177344/react-virtualized-table-x-scrolling
          //
          //
          // <ReactVirtualizedScrollingCalendar indicators={indicators} monthsNext={monthsNext} monthsPrevious={monthsPrevious}/>
          <div
            key={month.getTime()}
            className='[scroll-snap-align:start] snap-always min-w-full min-h-full'>
            <span className='text-xl font-bold ml-2'>
              {format(month, 'MMMM yyyy')}
            </span>
            <div className='grid grid-cols-7 mt-10 text-xs leading-6 text-center text-gray-500'>
              <div>M</div>
              <div>T</div>
              <div>W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
              <div>S</div>
            </div>
            <div className='grid grid-cols-7 mt-2 text-sm'>
              {days.map((day, dayIdx) => {
                const dayIndicators = monthIndicators
                  ?.filter((m) => isSameDay(parseISO(m.date), day))
                  .slice(0, 3)
                return (
                  <div
                    key={day.toString()}
                    className={classNames(
                      dayIdx === 0 && colStartClasses[getDay(day) - 1],
                      'py-1.5'
                    )}>
                    <button
                      type='submit'
                      name='date'
                      value={format(day, 'yyyy-MM-dd')}
                      className={twMerge(
                        'mx-auto flex h-8 w-8 items-center justify-center rounded-full',
                        isEqual(day, selectedDay) && 'text-white',
                        !isEqual(day, selectedDay) &&
                          isToday(day) &&
                          'text-red-500',
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          isSameMonth(day, firstDayCurrentMonth) &&
                          'text-gray-900 dark:text-gray-300',
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          !isSameMonth(day, firstDayCurrentMonth) &&
                          'text-gray-400',
                        isEqual(day, selectedDay) &&
                          isToday(day) &&
                          'bg-red-500',
                        isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          'bg-gray-900',
                        !isEqual(day, selectedDay) &&
                          'hover:bg-gray-200 dark:hover:bg-gray-700',
                        (isEqual(day, selectedDay) || isToday(day)) &&
                          'font-semibold'
                      )}
                      onClick={() => {
                        setSelectedDay(day)
                      }}>
                      <time dateTime={format(day, 'yyyy-MM-dd')}>
                        {format(day, 'd')}
                      </time>
                    </button>
                    <div className='flex h-1 w-fit gap-px mx-auto mt-1'>
                      {dayIndicators?.map((m) => (
                        <div
                          key={`calendar-${m.id}`}
                          className='w-1 h-1 rounded-full'
                          style={{
                            backgroundColor: m.habit.colour
                          }}></div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ReactVirtualizedScrollingCalendar({
  indicators,
  monthsNext = 5,
  monthsPrevious = 2
}: ScrollingCalendarProps) {
  //   const { markedHabits } = useLoaderData<typeof loader>();
  const today = startOfToday()
  const currentMonth = format(today, 'MMM-yyyy')
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date())
  const previousMonths: Date[] = []
  const [selectedDay, setSelectedDay] = useState(today)

  for (let index = monthsPrevious; index > 0; index--) {
    previousMonths.push(subMonths(firstDayCurrentMonth, index))
  }

  const nextMonths: Date[] = []
  for (let index = 0; index < monthsNext; index++) {
    nextMonths.push(addMonths(firstDayCurrentMonth, index + 1))
  }

  const monhts = [...previousMonths, firstDayCurrentMonth, ...nextMonths]

  let colStartClasses = [
    '',
    'col-start-2',
    'col-start-3',
    'col-start-4',
    'col-start-5',
    'col-start-6',
    'col-start-7'
  ]
  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          rowCount={monhts.length}
          width={width}
          rowHeight={300}
          className='flex gap-8 overflow-x-auto snap-x snap-mandatory pb-4 mb-20 [-webkit-overflow-scrolling:touch] scroll-smooth'
          rowRenderer={({ key, index, style }) => {
            const month = monhts[index]
            const days = eachDayOfInterval({
              start: startOfWeek(month, {
                weekStartsOn: 1
              }),
              end: endOfWeek(endOfMonth(month), {
                weekStartsOn: 1
              })
            })
            return (
              <div key={key} style={style}>
                <div className='[scroll-snap-align:start] snap-always min-w-full min-h-full'>
                  <span className='text-xl font-bold ml-2'>
                    {format(month, 'MMMM yyyy')}
                  </span>
                  <div className='grid grid-cols-7 mt-10 text-xs leading-6 text-center text-gray-500'>
                    <div>M</div>
                    <div>T</div>
                    <div>W</div>
                    <div>T</div>
                    <div>F</div>
                    <div>S</div>
                    <div>S</div>
                  </div>
                  <div className='grid grid-cols-7 mt-2 text-sm'>
                    {days.map((day, dayIdx) => (
                      <div
                        key={day.toString()}
                        className={classNames(
                          dayIdx === 0 && colStartClasses[getDay(day) - 1],
                          'py-1.5'
                        )}>
                        <button
                          type='submit'
                          name='date'
                          value={format(day, 'yyyy-MM-dd')}
                          className={twMerge(
                            'mx-auto flex h-8 w-8 items-center justify-center rounded-full',
                            isEqual(day, selectedDay) && 'text-white',
                            !isEqual(day, selectedDay) &&
                              isToday(day) &&
                              'text-red-500',
                            !isEqual(day, selectedDay) &&
                              !isToday(day) &&
                              isSameMonth(day, firstDayCurrentMonth) &&
                              'text-gray-900 dark:text-gray-300',
                            !isEqual(day, selectedDay) &&
                              !isToday(day) &&
                              !isSameMonth(day, firstDayCurrentMonth) &&
                              'text-gray-400',
                            isEqual(day, selectedDay) &&
                              isToday(day) &&
                              'bg-red-500',
                            isEqual(day, selectedDay) &&
                              !isToday(day) &&
                              'bg-gray-900',
                            !isEqual(day, selectedDay) &&
                              'hover:bg-gray-200 dark:hover:bg-gray-700',
                            (isEqual(day, selectedDay) || isToday(day)) &&
                              'font-semibold'
                          )}
                          onClick={() => {
                            setSelectedDay(day)
                          }}>
                          <time dateTime={format(day, 'yyyy-MM-dd')}>
                            {format(day, 'd')}
                          </time>
                        </button>
                        <div className='flex h-1 w-fit gap-px mx-auto mt-1'>
                          {indicators
                            ?.filter((m) => isSameDay(parseISO(m.date), day))
                            .slice(0, 3)
                            .map((m) => (
                              <div
                                key={`calendar-${m.id}`}
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
              </div>
            )
          }}
        />
      )}
    </AutoSizer>
  )
}
