import React, { Fragment } from 'react'
import { useUser } from '@clerk/remix'
import { Dialog, Transition } from '@headlessui/react'
import {
  ActionArgs,
  type LoaderArgs,
  type V2_MetaFunction
} from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { useState } from 'react'
import Calendar from '~/components/Calendar'
import { prisma } from '~/db.server'
import { getUser } from '~/utils/auth'

export const loader = async (args: LoaderArgs) => {
  const { userId } = await getUser(args)

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
        createdAt: 'desc'
      }
    }),
    prisma.habit.findMany({
      where: {
        userId,
        deleted: false
      }
    })
  ])

  return { markedHabits, habits }
}

export const action = async (args: ActionArgs) => {
  const { userId } = await getUser(args)

  const formData = await args.request.formData()
  if (formData.get('_action') === 'mark-date') {
    await prisma.markedHabit.create({
      data: {
        date: new Date(formData.get('date')?.toString()!),
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

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Sorted' }]
}

export default function Index() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { markedHabits, habits } = useLoaderData<typeof loader>()

  if (!isLoaded || !isSignedIn) {
    return null
  }

  return (
    <div>
      <div className='pt-16'>
        <div className='max-w-md px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6 mb-8'>
          <div className='my-4 flex'>
            <Link
              to={'/habits'}
              className='rounded-2xl border border-sky-400 text-sky-400 py-2 px-4'>
              Habits
            </Link>
          </div>
          <Calendar markedHabits={markedHabits} habits={habits} />
        </div>
      </div>
      {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
    </div>
  )
}
