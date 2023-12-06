import { useUser } from '@clerk/remix'
import { Habit, MarkedHabit } from '@prisma/client'
import {
  ActionFunctionArgs,
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  parseISO,
  startOfToday,
  startOfWeek
} from 'date-fns'
import { z } from 'zod'
import Calendar from '~/components/Calendar'
import FriendsRow from '~/components/FriendsRow'
import { prisma } from '~/db.server'
import { classNames, getClerkUser } from '~/utils'
import { getUser } from '~/utils/auth.server'

type LoaderData = {
  markedHabits: (MarkedHabit & {
    habit: Habit
  })[]
  habits: Habit[]
  isLoadingFriendsHabits: boolean
}

export const loader = async (args: LoaderFunctionArgs): Promise<LoaderData> => {
  const { userId } = await getUser(args)

  const url = new URL(args.request.url)
  const { friend } = z
    .object({
      friend: z.string().optional()
    })
    .parse(Object.fromEntries(url.searchParams))

  if (friend) {
    const friendData = await getClerkUser(friend)
    if (!friendData) {
      throw redirect('/')
    }

    const userFriend = await prisma.userFriends
      .findFirstOrThrow({
        where: {
          OR: [
            {
              AND: {
                friendIdFrom: friendData.id,
                friendIdTo: userId
              }
            },
            {
              AND: {
                friendIdTo: friendData.id,
                friendIdFrom: userId
              }
            }
          ]
        }
      })
      .catch(() => {
        console.log('users are not friends')
        throw redirect('/')
      })

    const userFriendId =
      userFriend.friendIdFrom === userId
        ? userFriend.friendIdTo
        : userFriend.friendIdFrom

    const [friendsMarkedHabits, friendsHabits] = await Promise.all([
      prisma.markedHabit.findMany({
        where: {
          userId: userFriendId,
          habit: {
            deleted: false,
            private: false
          }
        },
        include: {
          habit: true
        },
        orderBy: {
          date: 'desc'
        }
      }),
      prisma.habit.findMany({
        where: {
          userId: userFriendId,
          deleted: false,
          private: false
        }
      })
    ])

    return {
      markedHabits: friendsMarkedHabits,
      habits: friendsHabits,
      isLoadingFriendsHabits: true
    }
  }

  const [markedHabits, habits] = await Promise.all([
    prisma.markedHabit.findMany({
      where: {
        userId,
        habit: {
          deleted: false
        }
      },
      include: {
        habit: true
      },
      orderBy: {
        date: 'desc'
      }
    }),
    prisma.habit.findMany({
      where: {
        userId,
        deleted: false
      }
    })
  ])

  return { markedHabits, habits, isLoadingFriendsHabits: false }
}

export const action = async (args: ActionFunctionArgs) => {
  const { userId } = await getUser(args)

  const formData = await args.request.formData()
  if (formData.get('_action') === 'mark-date') {
    await prisma.markedHabit.create({
      data: {
        date: new Date(
          `${formData.get('date')?.toString()}T${format(new Date(), 'HH:mm')}`
        ),
        userId,
        habitId: formData.get('habitId')?.toString()!
      }
    })
    return Object.fromEntries(formData)
  }

  if (formData.get('_action') === 'remove-marked-habit') {
    await prisma.markedHabit.delete({
      where: {
        id: formData.get('markedHabit-id')?.toString()
      }
    })
    return {}
  }

  await prisma.habit.create({
    data: {
      userId,
      name: 'Test',
      colour: '#ffffff'
    }
  })

  return {}
}

export const meta: MetaFunction = () => {
  return [{ title: 'Sorted' }]
}

export default function Index() {
  const { isLoaded, isSignedIn } = useUser()
  const { markedHabits, habits, isLoadingFriendsHabits } =
    useLoaderData<typeof loader>()

  if (!isLoaded || !isSignedIn) {
    return null
  }

  return (
    <div>
      <div className='mt-8'>
        <div className='max-w-md px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6 mb-8'>
          <h2 className='text-lg font-bold tracking-tight mb-4'>Friends</h2>
          <FriendsRow />

          <Calendar
            isLoadingFriendsHabits={isLoadingFriendsHabits}
            markedHabits={markedHabits}
            habits={habits}
            startWeekMonday
          />
        </div>
      </div>
    </div>
  )
}

function ScrollingCalendar() {
  const { markedHabits } = useLoaderData<typeof loader>()
  const today = startOfToday()
  const currentMonth = format(today, 'MMM-yyyy')
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date())
  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth, {
      weekStartsOn: 1
    }),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth), {
      weekStartsOn: 1
    })
  })

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
    <div className='flex gap-8 overflow-x-auto snap-x snap-mandatory mb-20 [-webkit-overflow-scrolling:touch] scroll-smooth'>
      {['December 2023', 'January 2024', 'Febuary 2024', 'March 2024'].map(
        (v, i) => (
          <div
            key={i}
            className='[scroll-snap-align:start] min-w-full min-h-full'>
            <span className='text-xl font-bold ml-2'>{v}</span>
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
                    className={
                      'mx-auto flex h-8 w-8 items-center justify-center rounded-full'
                    }>
                    <time dateTime={format(day, 'yyyy-MM-dd')}>
                      {format(day, 'd')}
                    </time>
                  </button>
                  <div className='flex h-1 w-fit gap-px mx-auto mt-1'>
                    {markedHabits
                      .filter((m) => isSameDay(parseISO(m.date), day))
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
        )
      )}
    </div>
  )
}
