import { createClerkClient } from '@clerk/remix/api.server'
import { getAuth } from '@clerk/remix/ssr.server'
import { DataFunctionArgs, redirect } from '@remix-run/node'

export async function getUser(
  args: DataFunctionArgs,
  redirectTo: string = '/sign-in'
) {
  const auth = await getAuth(args)
  if (!auth.userId) {
    throw redirect(redirectTo)
  }

  return auth
}

export async function isLoggedIn(args: DataFunctionArgs) {
  const auth = await getAuth(args)
  return !!auth.userId
}

export const clerkClient = createClerkClient({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY
})
