import React from 'react'
import { SignUp } from '@clerk/remix'

export default function SignUpPage() {
  return (
    <div className='flex justify-center items-center my-4'>
      <SignUp routing={'path'} path={'/sign-up'} />
    </div>
  )
}
