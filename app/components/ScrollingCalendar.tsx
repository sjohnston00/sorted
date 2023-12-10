import React, { useEffect, useRef, useState } from 'react'
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
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import Button from './Button'

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
  const calendarRef = useRef<HTMLDivElement>(null)

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
    <>
      <Pagination monthsPrevious={monthsPrevious} calendarRef={calendarRef} />
      <div
        id='carousel'
        className='flex gap-8 overflow-x-auto snap-x snap-mandatory pb-4 mb-20 [-webkit-overflow-scrolling:touch] scroll-smooth'
        ref={calendarRef}>
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
                            isSameMonth(day, month) &&
                            'text-gray-900 dark:text-gray-300',
                          !isEqual(day, selectedDay) &&
                            !isToday(day) &&
                            !isSameMonth(day, month) &&
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
    </>
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

type PaginationProps = {
  monthsPrevious: number
  calendarRef: React.RefObject<HTMLDivElement>
}

function Pagination({ monthsPrevious, calendarRef }: PaginationProps) {
  // Scroll by 1 page in the given direction (-1 or +1).
  // This uses the width of the carousel minus the padding and gap between items.
  // Use behavior: 'smooth' and the browser will animate the scrolling.
  //Initial render should scroll to the current month, every other button press should use the scrollBy
  let scroll = (dir: number, behavior: ScrollBehavior = 'smooth') => {
    if (typeof window === 'undefined') return
    if (!calendarRef.current) return

    const style = window.getComputedStyle(calendarRef.current)
    const left =
      dir *
      (calendarRef.current.clientWidth -
        parseInt(style.paddingLeft, 10) -
        parseInt(style.paddingRight, 10) +
        parseInt(style.columnGap, 10))
    calendarRef.current.scrollBy({
      left,
      behavior
    })
  }

  let instantScroll = (page: number, behavior: ScrollBehavior = 'instant') => {
    if (typeof window === 'undefined') return
    if (!calendarRef.current) return

    const style = window.getComputedStyle(calendarRef.current)
    const left =
      page *
      (calendarRef.current.clientWidth -
        parseInt(style.paddingLeft, 10) -
        parseInt(style.paddingRight, 10) +
        parseInt(style.columnGap, 10))
    calendarRef.current.scrollTo({
      left,
      behavior
    })
  }

  let [isPrevDisabled, setPrevDisabled] = useState(true)
  let [isNextDisabled, setNextDisabled] = useState(false)

  // Use the scroll position to determine if we are at the start or end of the carousel.
  // This controls whether the previous and next buttons are enabled.
  useEffect(() => {
    if (typeof window === 'undefined') return
    //On initial render, scroll to the currentMonth
    instantScroll(monthsPrevious)

    let update = () => {
      if (!calendarRef.current) return
      setPrevDisabled(calendarRef.current.scrollLeft <= 0)
      setNextDisabled(
        calendarRef.current.scrollLeft >=
          calendarRef.current.scrollWidth - calendarRef.current.clientWidth
      )
    }

    update()

    // Use the scrollend event if supported for better perf, with fallback to regular scroll.
    if ('onscrollend' in document) {
      calendarRef.current?.addEventListener('scrollend', update)
      return () => calendarRef.current?.removeEventListener('scrollend', update)
    } else {
      calendarRef.current?.addEventListener('scroll', update)
      return () => calendarRef.current?.removeEventListener('scroll', update)
    }
  }, [])

  return (
    <div className='flex gap-2 justify-end'>
      {/* TODO: Show a back to today button if the current scrolled position isnt the current month */}
      <Button
        className='btn-ghost'
        aria-label='Previous Page'
        disabled={isPrevDisabled}
        onClick={() => scroll(-1)}>
        <ChevronLeftIcon className='w-5 h-5' />
      </Button>
      <Button
        className='btn-ghost'
        aria-label='Next Page'
        disabled={isNextDisabled}
        onClick={() => scroll(1)}>
        <ChevronRightIcon className='w-5 h-5' />
      </Button>
    </div>
  )
}
