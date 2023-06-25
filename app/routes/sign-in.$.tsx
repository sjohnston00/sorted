import { SignIn } from '@clerk/remix'

export default function SignInPage() {
  return (
    <div className='flex justify-center items-center my-4'>
      <SignIn routing={'path'} path={'/sign-in'} />
    </div>
  )
}
