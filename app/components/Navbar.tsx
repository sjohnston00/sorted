import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/remix'

export default function Navbar() {
  return (
    <nav className='flex p-4 items-center justify-between min-h-[4rem] bg-gray-800 text-white'>
      <span className='text-2xl font-bold lowercase tracking-wide font-mono'>
        _Sorted
      </span>

      <SignedIn>
        <UserButton
          showName
          appearance={{
            elements: {
              userButtonOuterIdentifier: {
                color: 'white'
              }
            }
          }}
        />
      </SignedIn>
      <SignedOut>
        <SignInButton mode='redirect' redirectUrl='/' />
      </SignedOut>
    </nav>
  )
}
