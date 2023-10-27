import React from 'react'
import { UserButton, UserProfile, useClerk } from '@clerk/remix'
import Button from '~/components/Button'

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
