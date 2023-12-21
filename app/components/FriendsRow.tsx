import React from 'react'
import {
  Link,
  useLoaderData,
  useRouteLoaderData,
  useSearchParams
} from '@remix-run/react'
import { RootLoaderData } from '~/root'
import { useUser } from '@clerk/remix'
import { IndexLoaderData } from '~/routes/_index'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { twMerge } from 'tailwind-merge'

export default function FriendsRow() {
  const { user, isLoaded, isSignedIn } = useUser()
  const loggedInUser = useRouteLoaderData<RootLoaderData>('root')
  const [searchParams, setSearchParams] = useSearchParams()
  const { isLoadingFriendsHabits } = useLoaderData<IndexLoaderData>()
  const buttonClassName =
    'h-24 w-16 flex flex-col justify-end gap-1 items-center'

  return (
    <div className='mb-8 flex items-end gap-4'>
      {isLoadingFriendsHabits ? (
        <Link
          to={'/'}
          className={twMerge(buttonClassName, 'text-base-content')}
          preventScrollReset
          replace>
          <div className='bg-base-200 flex justify-center items-center h-16 rounded-full w-full'>
            <ArrowLeftIcon className='w-5 h-5' />
          </div>
          <div className='text-xs'>Back</div>
        </Link>
      ) : null}
      {loggedInUser?.friends && loggedInUser.friends.length > 0
        ? loggedInUser.friends.map((f) => {
            const friend = f.friendIdFrom === user?.id ? f.userTo : f.userFrom
            const searchParamSameFriend =
              searchParams.get('friend') === friend?.username
            return (
              <button
                className={buttonClassName}
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
                    searchParamSameFriend ? 'duration-200 animate-blink ' : ''
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
