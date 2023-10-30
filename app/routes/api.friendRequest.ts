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
  console.log({ method: args.request.method })

  if (
    args.request.method === 'PUT' &&
    formData.get('_action')?.toString() === 'updateFriendRequest'
  ) {
    console.log('updateFriendRequest')

    const { friendRequestId, value } = z
      .object({
        friendRequestId: z.string(),
        _action: z.string(),
        value: z.literal('accept').or(z.literal('decline'))
      })
      .parse(Object.fromEntries(formData))

    const friendRequestToUpdate = await prisma.userFriendRequest.findUnique({
      where: {
        id: friendRequestId
      }
    })

    if (!friendRequestToUpdate) {
      return json(
        {
          message: 'Friend Request not found'
        },
        400
      )
    }

    if (value === 'accept') {
      await prisma.userFriendRequest.update({
        where: {
          id: friendRequestId
        },
        data: {
          status: 'ACCEPTED'
        }
      })

      await prisma.userFriends.create({
        data: {
          friendIdFrom: friendRequestToUpdate.friendRequestFrom,
          friendIdTo: user.userId
        }
      })
    } else {
      await prisma.userFriendRequest.update({
        where: {
          id: friendRequestId
        },
        data: {
          status: 'DECLINED'
        }
      })
    }

    return {
      message: 'Friend requested updated'
    }
  }

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
