import React from 'react'
import { SignUp } from '@clerk/remix'

export default function SignUpPage() {
  return (
    <div>
      <h1>Sign Up route</h1>
      <SignUp routing={'path'} path={'/sign-up'} />
    </div>
  )
}
