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
