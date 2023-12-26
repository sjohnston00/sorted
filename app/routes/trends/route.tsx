import { LockClosedIcon } from '@heroicons/react/24/outline'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from 'date-fns'
import React from 'react'
import { z } from 'zod'
import { prisma } from '~/db.server'
import { getUser } from '~/utils/auth.server'
import { FEATURE_FLAGS } from '~/utils/constants'
import { getFeatureFlagEnabledWithDefaultValue } from '~/utils/featureFlags'
import { UserFeatureFlagQueries } from '~/utils/queries.server'

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await getUser(args)

  const url = new URL(args.request.url)
  const urlSearchSchema = z.object({
    tab: z
      .literal('week')
      .or(z.literal('month'))
      .or(z.literal('all-time'))
      .optional()
      .default('month')
  })

  const { tab } = urlSearchSchema.parse(Object.fromEntries(url.searchParams))

  const userFeatureFlags = await UserFeatureFlagQueries.getUsersFeatureFlags(
    userId
  )
  const showPrivateHabits = getFeatureFlagEnabledWithDefaultValue({
    featureFlagId: FEATURE_FLAGS.VIEW_PRIVATE_HABITS_BY_DEFAULT,
    flags: userFeatureFlags,
    defaultValue: false
  })

  let beginDate: Date | undefined
  let endDate: Date | undefined

  if (tab === 'month') {
    beginDate = startOfMonth(new Date())
    endDate = endOfMonth(new Date())
  }

  if (tab === 'week') {
    beginDate = startOfWeek(new Date())
    endDate = endOfWeek(new Date())
  }

  //get most the markedHabit within the current month

  const markedHabits = await prisma.markedHabit.findMany({
    select: {
      habitId: true
    },
    where: {
      userId,
      date: {
        gte: beginDate,
        lte: endDate
      },
      habit: {
        private: showPrivateHabits ? undefined : false,
        deleted: false
      }
    },
    orderBy: {
      date: 'asc'
    }
  })

  const markedHabitCountByHabit: { habitId: string; amount: number }[] = []
  markedHabits.forEach((markedHabit) => {
    const habitId = markedHabit.habitId
    const index = markedHabitCountByHabit.findIndex(
      (habit) => habit.habitId === habitId
    )
    if (index === -1) {
      markedHabitCountByHabit.push({
        habitId,
        amount: 1
      })
    } else {
      markedHabitCountByHabit[index].amount += 1
    }
  })

  //sort the markedHabit by amount desc
  markedHabitCountByHabit.sort((a, b) => b.amount - a.amount)

  const habits = await prisma.habit.findMany({
    where: {
      id: {
        in: markedHabitCountByHabit.map((habit) => habit.habitId)
      }
    }
  })

  const mostTrackedHabitAmount = markedHabitCountByHabit.reduce((a, b) =>
    a.amount > b.amount ? a : b
  )

  const mostTrackedHabit = {
    ...mostTrackedHabitAmount,
    habit: habits.find((habit) => habit.id === mostTrackedHabitAmount.habitId)
  }

  return {
    markedHabits,
    markedHabitCountByHabit,
    habits,
    mostTrackedHabit,
    tab
  }
}

type LoaderData = typeof loader

export default function Route() {
  const { habits, markedHabitCountByHabit, mostTrackedHabit, tab } =
    useLoaderData<LoaderData>()
  return (
    <div className='mt-8 px-4 mx-auto md:max-w-4xl prose mb-8 lg:prose-xl'>
      <h1>Trends</h1>
      <div role='tablist' className='not-prose tabs tabs-boxed'>
        <Link
          to={{
            search: '?tab=week'
          }}
          role='tab'
          className={`tab ${tab === 'week' ? 'tab-active' : ''}`}>
          Week
        </Link>
        <Link
          to={{
            search: '?tab=month'
          }}
          role='tab'
          className={`tab ${tab === 'month' ? 'tab-active' : ''}`}>
          Month
        </Link>
        <Link
          to={{
            search: '?tab=all-time'
          }}
          role='tab'
          className={`tab ${tab === 'all-time' ? 'tab-active' : ''}`}>
          All Time
        </Link>
      </div>
      <div className='flex flex-col lg:items-start lg:flex-row lg:gap-8 gap-4'>
        <div className='card bg-base-200 mt-8 not-prose shadow-xl flex-1'>
          <div className='card-body'>
            <h2 className='card-title text-center'>Most Tracked</h2>
            <div
              style={{
                borderColor: mostTrackedHabit.habit?.colour || 'transparent'
              }}
              className='h-40 w-40 border-[1rem] mx-auto my-4 rounded-full bg-transparent flex flex-col items-center justify-center'>
              <span className='text-xl font-bold'>
                {mostTrackedHabit.amount}
              </span>
              <span className='text-xs font-semibold'>times</span>
            </div>
            <span className='block text-center '>
              {mostTrackedHabit.habit?.private ? (
                <LockClosedIcon className='text-gray-400 w-4 h-4' />
              ) : null}{' '}
              {mostTrackedHabit.habit?.name}
            </span>
          </div>
        </div>
        <div className='card bg-base-200 mt-8 not-prose shadow-xl flex-1'>
          <div className='card-body'>
            <div className='overflow-x-auto'>
              <table className='table'>
                {/* head */}
                <thead>
                  <tr>
                    <th>Name</th>
                    <th className='text-end'>Marked</th>
                  </tr>
                </thead>
                <tbody>
                  {markedHabitCountByHabit.map((mh) => {
                    const habit = habits.find((h) => h.id === mh.habitId)
                    const amount = mh.amount
                    return (
                      <tr key={mh.habitId}>
                        <td className='flex items-center gap-2'>
                          <div
                            className='w-6 h-6 rounded-full'
                            style={{ backgroundColor: habit?.colour }}></div>
                          {habit?.private ? (
                            <LockClosedIcon className='text-gray-400 w-4 h-4' />
                          ) : null}{' '}
                          {habit?.name}
                        </td>
                        <td className='text-end'>{amount}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
