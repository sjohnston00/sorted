import { useUser } from '@clerk/remix'
import {
  ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction
} from '@remix-run/node'
import {
  useLoaderData,
  useRouteLoaderData,
  useSearchParams
} from '@remix-run/react'
import { format } from 'date-fns'
import Calendar from '~/components/Calendar'
import LinkButton from '~/components/LinkButton'
import { prisma } from '~/db.server'
import { RootLoaderData } from '~/root'
import { getUser } from '~/utils/auth.server'

export const loader = async (args: LoaderFunctionArgs) => {
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
          {loggedInUser?.friends && loggedInUser.friends.length > 0 ? (
            <div className='h-12 w-full mb-8'>
              {loggedInUser.friends.map((f) => {
                const friend =
                  f.friendIdFrom === user?.id ? f.userTo : f.userFrom
                const searchParamSameFriend =
                  searchParams.get('friend') === friend?.username
                return (
                  <button
                    className={`h-full w-12 rounded-full outline outline-2 outline-offset-2 !duration-2000 ${
                      searchParamSameFriend
                        ? 'outline-white animate-spin'
                        : 'outline-transparent'
                    }`}
                    key={f.id}
                    onClick={() => {
                      setSearchParams(
                        (prevParams) => {
                          if (searchParamSameFriend) {
                            prevParams.delete('friend')
                          } else {
                            prevParams.set('friend', friend?.username!)
                          }
                          return prevParams
                        },
                        {
                          replace: true,
                          preventScrollReset: true
                        }
                      )
                    }}>
                    <img
                      src={friend?.imageUrl}
                      alt='user profile image'
                      className='rounded-full'
                    />
                  </button>
                )
              })}
            </div>
          ) : null}
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
