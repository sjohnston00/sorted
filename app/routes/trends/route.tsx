import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { endOfMonth, startOfMonth } from 'date-fns'
import React from 'react'
import { prisma } from '~/db.server'
import { getUser } from '~/utils/auth.server'

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await getUser(args)

  //get startOfcurrentMonth with date-fns
  const startOfCurrentMonth = startOfMonth(new Date())
  const endOfCurrentMonth = endOfMonth(new Date())

  //get most the markedHabit within the current month
  const markedHabits = await prisma.markedHabit.findMany({
    select: {
      habitId: true
    },
    where: {
      userId,
      date: {
        gte: startOfCurrentMonth,
        lte: endOfCurrentMonth
      },
      habit: {
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

  const habits = await prisma.habit.findMany({
    where: {
      id: {
        in: markedHabitCountByHabit.map((habit) => habit.habitId)
      }
    }
  })

  return { markedHabits, markedHabitCountByHabit, habits }
}

type LoaderData = typeof loader

export default function Route() {
  const { habits, markedHabitCountByHabit } = useLoaderData<LoaderData>()
  return (
    <div className='mt-8 px-4 mx-auto md:max-w-4xl prose mb-8 lg:prose-xl'>
      <h1 className=''>Trends</h1>
      <p>
        This page shows which habits have been marked the most for this month
      </p>
      {habits.map((h) => {
        const amount =
          markedHabitCountByHabit.find((habit) => habit.habitId === h.id)
            ?.amount || 0
        return (
          <div className='grid grid-cols-2' key={h.id}>
            <span>
              {amount} <span className='text-xs'>days</span>
            </span>

            <span className='flex items-center gap-2'>
              <div
                className='w-6 h-6 rounded-full'
                style={{ backgroundColor: h.colour }}></div>
              {h.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
