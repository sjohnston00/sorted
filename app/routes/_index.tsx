import type { V2_MetaFunction } from '@remix-run/node'
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/remix'

export const meta: V2_MetaFunction = () => {
  return [{ title: 'Remix App with Clerk' }]
}

export default function Index() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <h1>Welcome to Remix</h1>
      <ul>
        <li>
          <SignedIn>
            <p>You are signed in!</p>
            <UserButton showName />
          </SignedIn>
          <SignedOut>
            <SignInButton mode='modal' />
          </SignedOut>
        </li>
        {/* <li>
          <Link to={'/sign-up'}>Sign Up</Link>
        </li>
        <li>
          <Link to={'/sign-in'}>Sign In</Link>
        </li> */}
      </ul>
    </div>
  )
}
