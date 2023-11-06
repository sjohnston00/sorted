import { useUser } from '@clerk/remix'
import {
  ActionFunctionArgs,
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {
  useLoaderData,
  useRouteLoaderData,
  useSearchParams
} from '@remix-run/react'
import { format } from 'date-fns'
import { z } from 'zod'
import Calendar from '~/components/Calendar'
import FriendsRow from '~/components/FriendsRow'
import LinkButton from '~/components/LinkButton'
import { prisma } from '~/db.server'
import { RootLoaderData } from '~/root'
import { getClerkUser, getClerkUsersByIDs } from '~/utils'
import { getUser } from '~/utils/auth.server'

export const loader = async (args: LoaderFunctionArgs) => {
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

    //we know the users are friends so get the requests friends marked habits
    const friendsMarkedHabits = await prisma.markedHabit.findMany({
      where: {
        userId: userFriend.id,
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
    })

    return {
      markedHabits: friendsMarkedHabits,
      habits: []
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

  return { markedHabits, habits }
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
  const { user, isLoaded, isSignedIn } = useUser()
  const loggedInUser = useRouteLoaderData<RootLoaderData>('root')

  const { markedHabits, habits } = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()

  if (!isLoaded || !isSignedIn) {
    return null
  }

  return (
    <div>
      <div className='mt-8'>
        <div className='max-w-md px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6 mb-8'>
          {/* <div className='my-4 flex'>
            <LinkButton to={'/habits'}>Habits</LinkButton>
          </div> */}
          <h2 className='text-lg font-bold tracking-tight mb-4'>Friends</h2>
          <FriendsRow />
          <Calendar
            markedHabits={markedHabits}
            habits={habits}
            startWeekMonday
          />
        </div>
      </div>
    </div>
  )
}
