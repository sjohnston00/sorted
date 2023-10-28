import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { z } from 'zod'
import { clerkClient, getUser, isLoggedIn } from '~/utils/auth.server'

export const loader = async (args: LoaderFunctionArgs) => {
  const userLoggedIn = await isLoggedIn(args)
  if (!userLoggedIn) {
    return json(
      {
        error: 'Not logged in'
      },
      401
    )
  }

  const url = new URL(args.request.url)
  const query = z
    .object({
      search: z.string().optional()
    })
    .parse(Object.fromEntries(url.searchParams))

  const users = await clerkClient.users.getUserList({
    limit: 10,
    query: query.search
  })

  return {
    users: users.map((u) => ({
      id: u.id,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      imageUrl: u.imageUrl,
      hasImage: u.hasImage,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName
    }))
  }
}
