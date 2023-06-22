import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/remix'
import React from 'react'

export default function Navbar() {
  return (
    <nav className='flex p-4 items-center justify-end'>
      <SignedIn>
        <UserButton showName />
      </SignedIn>
      <SignedOut>
        <SignInButton mode='redirect' redirectUrl='/' />
      </SignedOut>
    </nav>
  )
}
