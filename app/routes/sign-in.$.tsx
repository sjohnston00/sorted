import { SignIn } from '@clerk/remix'

export default function SignInPage() {
  return (
    <div className='flex justify-center items-center'>
      <SignIn routing={'path'} path={'/sign-in'} />
    </div>
  )
}
