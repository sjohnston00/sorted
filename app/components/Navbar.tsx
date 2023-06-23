import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/remix"

export default function Navbar() {
  return (
    <nav className="flex p-4 items-center justify-end min-h-[4rem]">
      <SignedIn>
        <UserButton showName />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="redirect" redirectUrl="/" />
      </SignedOut>
    </nav>
  )
}
