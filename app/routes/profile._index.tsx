import type { LoaderFunctionArgs } from '@remix-run/node'
import React from 'react'
import { UserProfile, useClerk } from '@clerk/remix'
import Button from '~/components/Button'
import { useFetcher, useLoaderData, useRouteLoaderData } from '@remix-run/react'
import Input from '~/components/Input'
import { loader as searchUsersLoader } from '~/routes/api.users'
import { z } from 'zod'
import Spinner from '~/components/icons/Spinner'
import { clerkClient, getUser } from '~/utils/auth.server'
import { prisma } from '~/db.server'
import { getClerkUsersByIDs, getUsersFriendRequests } from '~/utils'
import { RootLoaderData } from '~/root'

export const loader = async (args: LoaderFunctionArgs) => {
  const user = await getUser(args)

  const { myReceivedFriendRequests, mySentFriendRequests, friendRequests } =
    await getUsersFriendRequests(user)

  const friends = await prisma.userFriends.findMany({
    where: {
      OR: [
        {
          friendIdFrom: user.userId
        },
        {
          friendIdTo: user.userId
        }
      ]
    }
  })

  const userIDs = new Set([
    ...myReceivedFriendRequests.map((f) => f.friendRequestFrom),
    ...mySentFriendRequests.map((f) => f.friendRequestTo),
    ...friends.map((f) => f.friendIdFrom),
    ...friends.map((f) => f.friendIdTo)
  ])

  const users = await getClerkUsersByIDs([...userIDs])

  const featureFlags = await prisma.featureFlag.findMany({
    where: {
      enabled: true
    }
  })

  return {
    friendRequests,
    myReceivedFriendRequests,
    mySentFriendRequests,
    friends: friends.map((f) => ({
      ...f,
      userFrom: users.find((u) => u.id === f.friendIdFrom),
      userTo: users.find((u) => u.id === f.friendIdTo)
    })),
    featureFlags
  }
}

export default function Profile() {
  const { signOut } = useClerk()
  return (
    <div className='max-w-md px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6 my-8'>
      <h1 className='text-2xl tracking-tight font-bold'>Profile</h1>
      <div className='mt-4'>
        <Button
          onClick={() =>
            signOut(() => {
              window.location.pathname = '/'
            })
          }>
          Logout
        </Button>

        <div className='my-8'>
          <Friends />
        </div>
        <div className='my-8'>
          <ReceivedFriendRequests />
        </div>
        <div className='my-8'>
          <SearchUsers />
        </div>
        <div className='my-8'>
          <FeatureFlags />
        </div>
        <UserProfile
          appearance={{
            elements: {
              card: {
                margin: 0,
                marginTop: '2rem'
              }
            }
          }}
        />
      </div>
    </div>
  )
}

function Friends() {
  const { friends } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  const { user } = useClerk()
  return (
    <>
      <h1 className='text-xl font-bold tracking-tight mb-2'>Friends</h1>
      <hr className='border-gray-700' />
      <div className='flex flex-col gap-2 mt-4'>
        {friends.length > 0 ? (
          friends.map((f) => {
            const friend = f.friendIdFrom === user?.id ? f.userTo : f.userFrom
            return (
              <div
                key={f.id}
                className='flex gap-2 items-center justify-between px-2 py-3 rounded-lg transition dark:hover:bg-slate-700'>
                <div className='flex gap-2 items-center'>
                  <img
                    src={friend?.imageUrl}
                    alt='friend request user profile image'
                    className='rounded-full h-10 w-10 md:h-12 md:w-12'
                  />
                  <div className='flex flex-col  text-sm tracking-wide'>
                    <span>{friend?.username}</span>
                    <span className='text-xs text-gray-400'>
                      {friend?.firstName} {friend?.lastName}
                    </span>
                  </div>
                </div>
                <fetcher.Form
                  method='delete'
                  action='/api/friend'
                  className='flex gap-1'>
                  <input
                    type='hidden'
                    name='_action'
                    id='_action'
                    value='removeFriend'
                  />
                  <input
                    type='hidden'
                    name='friendRowId'
                    id='friendRowId'
                    value={f.id}
                  />
                  <Button>Remove</Button>
                </fetcher.Form>
              </div>
            )
          })
        ) : (
          <p className='text-gray-600 text-sm text-center'>
            No friends added yet!
          </p>
        )}
      </div>
    </>
  )
}

function ReceivedFriendRequests() {
  const { myReceivedFriendRequests } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  return (
    <>
      <h1 className='text-xl font-bold tracking-tight mb-2'>Friend Requests</h1>
      <hr className='border-gray-700' />
      <div className='flex flex-col gap-2 mt-4'>
        {myReceivedFriendRequests.length > 0 ? (
          myReceivedFriendRequests.map((f) => (
            <div
              key={f.id}
              className='flex gap-2 items-center justify-between px-2 py-3 rounded-lg transition dark:hover:bg-slate-700'>
              <div className='flex gap-2 items-center'>
                <img
                  src={f.user?.imageUrl}
                  alt='friend request user profile image'
                  className='rounded-full h-10 w-10 md:h-12 md:w-12'
                />
                <div className='flex flex-col  text-sm tracking-wide'>
                  <span>{f.user?.username}</span>
                  <span className='text-xs text-gray-400'>
                    {f.user?.firstName} {f.user?.lastName}
                  </span>
                </div>
              </div>
              <fetcher.Form
                method='put'
                action='/api/friendRequest'
                className='flex gap-1'>
                <input
                  type='hidden'
                  name='_action'
                  id='_action'
                  value='updateFriendRequest'
                />
                <input
                  type='hidden'
                  name='friendRequestId'
                  id='friendRequestId'
                  value={f.id}
                />
                <Button
                  name='value'
                  id='value'
                  value='accept'
                  className='btn-primary'>
                  Accept
                </Button>
                <Button
                  name='value'
                  id='value'
                  value='decline'
                  className='btn-error'>
                  Decline
                </Button>
              </fetcher.Form>
            </div>
          ))
        ) : (
          <p className='text-gray-600 text-sm text-center'>
            No friend requests yet!
          </p>
        )}
      </div>
    </>
  )
}

function isErrorObj(data: unknown): data is { error: string } {
  const schema = z.object({
    error: z.string()
  })

  return schema.safeParse(data).success
}

function SearchUsers() {
  const fetcher = useFetcher<typeof searchUsersLoader>()
  const { user } = useClerk()
  const isLoading = fetcher.state === 'loading'

  if (isErrorObj(fetcher.data)) {
    return (
      <>
        <fetcher.Form method='get' action='/api/users'>
          <Input label='Search users' name='search' id='search' />
        </fetcher.Form>
        <div className='mt-4'>
          <p className='text-sm text-red-400'>Error: {fetcher.data.error}</p>
        </div>
      </>
    )
  }

  return (
    <>
      <fetcher.Form
        method='get'
        action='/api/users'
        onChange={(e) => {
          fetcher.submit(e.currentTarget)
        }}>
        <Input
          label={
            <div className='flex gap-1 items-center'>
              Search users {isLoading ? <Spinner /> : null}
            </div>
          }
          placeholder='Username, Email or Name'
          name='search'
          id='search'
        />
      </fetcher.Form>
      <div className='mt-4'>
        {fetcher.data ? (
          fetcher.data.users.length > 0 ? (
            <div className='flex flex-col gap-1'>
              {fetcher.data?.users.map((u) => (
                <UserRow key={u.id} user={u} />
              ))}
            </div>
          ) : (
            <p className='text-gray-400 text-center text-sm'>No users found</p>
          )
        ) : null}
      </div>
    </>
  )
}

type UserRowProps = {
  children?: React.ReactNode
  user: Record<string, any>
}

function UserRow({ children, user }: UserRowProps) {
  const { user: loggedInUser } = useClerk()
  const fetcher = useFetcher()
  //TODO: if loggedInUser has this user has a friend then don't show the add friend button
  const {
    friendRequests,
    myReceivedFriendRequests,
    friends,
    mySentFriendRequests
  } = useLoaderData<typeof loader>()

  const areUsersFriends = friends.some(
    (f) =>
      (f.friendIdFrom === loggedInUser?.id && f.friendIdTo === user.id) ||
      (f.friendIdFrom === user?.id && f.friendIdTo === loggedInUser?.id)
  )
  const hasPendingRequest = friendRequests.some(
    (f) =>
      f.friendRequestFrom === loggedInUser?.id &&
      f.friendRequestTo === user.id &&
      f.status === 'PENDING'
  )
  const hasReceivedFriendRequest = myReceivedFriendRequests.some(
    (f) => f.friendRequestFrom === user.id
  )
  return (
    <div className='flex gap-2 items-center justify-between px-2 py-3 rounded-lg transition dark:hover:bg-slate-700'>
      <div className='flex gap-2 justify-between text-gray-300 items-center'>
        <img
          src={user.imageUrl}
          alt='user profile image'
          className='rounded-full h-10 w-10 md:h-12 md:w-12'
        />
        <div className='flex flex-col text-sm tracking-wide'>
          <span>{user.username}</span>
          <span className='text-xs text-gray-400'>
            {user.firstName} {user.lastName}
          </span>
        </div>
      </div>

      {/* TODO: remove if the user already has this friend */}
      {hasPendingRequest ? <span>Pending request</span> : null}
      {hasReceivedFriendRequest ? <span>Reply to request</span> : null}
      {!areUsersFriends &&
      !hasReceivedFriendRequest &&
      !hasPendingRequest &&
      loggedInUser?.id !== user.id ? (
        <fetcher.Form method='post' action='/api/friendRequest'>
          <input
            type='hidden'
            name='friendIdTo'
            id='friendIdTo'
            value={user.id}
          />
          <Button type='submit'>Add friend</Button>
        </fetcher.Form>
      ) : null}
    </div>
  )
}

function FeatureFlags() {
  const { featureFlags } = useLoaderData<typeof loader>()

  return (
    <>
      <h1 className='text-xl font-bold tracking-tight mb-2'>Feature Flags</h1>
      <hr className='border-gray-700' />
      {featureFlags.map((f) => (
        <FeatureFlagRow key={f.id} featureFlag={f} />
      ))}
    </>
  )
}

type FeatureFlagRowProps = {
  featureFlag: any
}

function FeatureFlagRow({ featureFlag }: FeatureFlagRowProps) {
  const loggedInUser = useRouteLoaderData<RootLoaderData>('root')
  const fetcher = useFetcher()
  //TODO: update the userFeatureFlag in the DB everytime the user switches flag
  return (
    <fetcher.Form method='post'>
      <div className='form-control'>
        <label className='label cursor-pointer'>
          <span className='label-text'>{featureFlag.name}</span>

          <input
            type='checkbox'
            className='toggle'
            defaultChecked={loggedInUser?.userFeatureFlags.some(
              (uf) => uf.featureFlagId === featureFlag.id && uf.enabled
            )}
          />
        </label>
        <span className='text-sm text-gray-500'>{featureFlag.description}</span>
      </div>
    </fetcher.Form>
  )
}
