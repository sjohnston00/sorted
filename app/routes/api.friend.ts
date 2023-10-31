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
  if (
    args.request.method === 'DELETE' &&
    formData.get('_action')?.toString() === 'removeFriend'
  ) {
    console.log('removeFriend')

    const { friendRowId } = z
      .object({
        friendRowId: z.string(),
        _action: z.string()
      })
      .parse(Object.fromEntries(formData))

    const friendRowToUpdate = await prisma.userFriends.findUnique({
      where: {
        id: friendRowId
      }
    })

    if (!friendRowToUpdate) {
      return json(
        {
          message: 'Friend Row not found'
        },
        400
      )
    }

    await prisma.userFriends.delete({
      where: {
        id: friendRowId
      }
    })

    return {
      message: 'Friends updated'
    }
  }

  return {
    error: 'TODO: action not implemented'
  }
}
