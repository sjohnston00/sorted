import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/remix'

export default function Navbar() {
  return (
    <nav className='flex p-4 items-center justify-between min-h-[4rem]'>
      <span className='text-2xl font-bold lowercase tracking-wide'>
        _Sorted
      </span>

      <SignedIn>
        <UserButton showName />
      </SignedIn>
      <SignedOut>
        <SignInButton mode='redirect' redirectUrl='/' />
      </SignedOut>
    </nav>
  )
}
