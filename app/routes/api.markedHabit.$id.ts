import { ActionArgs } from '@remix-run/node'
import { format, set } from 'date-fns'
import { prisma } from '~/db.server'
import { getUser } from '~/utils/auth'

export const action = async (args: ActionArgs) => {
  const { params, request } = args
  const { userId } = await getUser(args)
  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  const markedHabit = await prisma.markedHabit.findUnique({
    where: {
      id: params.id
    },
    select: {
      createdAt: true,
      userId: true
    }
  })

  if (!markedHabit) {
    throw new Response('Marked Habit Not Found', {
      status: 404
    })
  }

  if (markedHabit.userId !== userId) {
    throw new Response('Unathorized', {
      status: 401
    })
  }

  const newCreatedAt = new Date(
    `${format(markedHabit.createdAt, 'yyyy-MM-dd')}T${
      data.newMarkedHabitTime
    }:00.000` //no Z on the end to make sure the it respects the time zone
  )

  await prisma.markedHabit.update({
    data: {
      createdAt: newCreatedAt
    },
    where: {
      id: params.id
    }
  })
  return { userId, data, params }
}