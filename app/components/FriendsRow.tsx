import React from 'react'
import { useRouteLoaderData, useSearchParams } from '@remix-run/react'
import { RootLoaderData } from '~/root'
import { useUser } from '@clerk/remix'

export default function FriendsRow() {
  const { user, isLoaded, isSignedIn } = useUser()
  const loggedInUser = useRouteLoaderData<RootLoaderData>('root')
  const [searchParams, setSearchParams] = useSearchParams()

  return (
    <div className='mb-8 flex gap-2'>
      {loggedInUser?.friends && loggedInUser.friends.length > 0
        ? loggedInUser.friends.map((f) => {
            const friend = f.friendIdFrom === user?.id ? f.userTo : f.userFrom
            const searchParamSameFriend =
              searchParams.get('friend') === friend?.username
            return (
              <button
                className={`h-24 w-16 flex flex-col justify-end gap-1 items-center`}
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
                  // src={''}
                  alt='user profile image'
                  className={`box-content relative rounded-full w-full ${
                    searchParamSameFriend ? 'profile-image' : ''
                  }`}
                />
                <span
                  className={`text-xs w-full overflow-ellipsis font-medium text-gray-400 ${
                    searchParamSameFriend ? 'animate-pulse' : ''
                  }`}>
                  {friend?.username}
                </span>
              </button>
            )
          })
        : null}
    </div>
  )
}
