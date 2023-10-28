import React from 'react'
import { UserProfile, useClerk } from '@clerk/remix'
import Button from '~/components/Button'
import { useFetcher } from '@remix-run/react'
import Input from '~/components/Input'
import { loader as searchUsersLoader } from '~/routes/api.users'
import { z } from 'zod'
import Spinner from '~/components/icons/Spinner'

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
          <SearchUsers />{' '}
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
                <div
                  key={u.id}
                  className='flex gap-2 items-center justify-between px-2 py-3 rounded-lg transition dark:hover:bg-slate-700'>
                  <div className='flex gap-2 justify-between text-gray-300 items-center'>
                    <img
                      src={u.imageUrl}
                      alt='user profile image'
                      className='rounded-full h-10 w-10 md:h-12 md:w-12'
                    />
                    <div className='flex flex-col text-sm tracking-wide'>
                      <span>{u.username}</span>
                      <span className='text-xs text-gray-400'>
                        {u.firstName} {u.lastName}
                      </span>
                    </div>
                  </div>
                  {/* TODO: if the user already has this friend */}
                  {user?.id !== u.id ? (
                    <Button
                      onClick={() => {
                        alert('TODO: Function not yet implemented')
                      }}>
                      Add friend
                    </Button>
                  ) : null}
                </div>
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
