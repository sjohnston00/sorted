import {
  ActionFunctionArgs,
  json,
  type LoaderFunctionArgs
} from '@remix-run/node'
import { z } from 'zod'
import { prisma } from '~/db.server'
import { clerkClient, getUser, isLoggedIn } from '~/utils/auth.server'

export const action = async (args: ActionFunctionArgs) => {
  const userLoggedIn = await isLoggedIn(args)
  if (!userLoggedIn) {
    return json(
      {
        error: 'Not logged in'
      },
      401
    )
  }

  const user = await getUser(args)

  const formData = await args.request.formData()
  const data = z
    .object({
      friendIdTo: z.string()
    })
    .parse(Object.fromEntries(formData))

  //TODO: check userId exists with clerkClient
  await prisma.userFriendRequest.create({
    data: {
      friendRequestFrom: user.userId,
      friendRequestTo: data.friendIdTo,
      status: 'PENDING'
    }
  })

  return {
    message: 'Friend Request Sent'
  }
}
