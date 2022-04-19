import React from "react"
import {
  ActionFunction,
  Form,
  LoaderFunction,
  Outlet,
  useActionData,
  useLoaderData,
  useMatches,
} from "remix"
import { User } from "~/types/user.server"
import { getUserDetails, updateUserPassword } from "~/utils/server/user.server"
import type { Document, Types } from "mongoose"
import { requireUserId } from "~/utils/session.server"
import { HiUserCircle } from "react-icons/hi"
import { isValidPassword } from "~/utils/register.server"

type LoaderData = {
  user: Document<unknown, any, User> &
    User & {
      _id: Types.ObjectId
      createdAt: string
      updatedAt: string
    }
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const userDetails = await getUserDetails(userId)
  return {
    user: userDetails,
  }
}

export default function Profile() {
  const [{ data }] = useMatches()
  const { user } = useLoaderData<LoaderData>()

  return (
    <div className="flex flex-col">
      <div className="flex gap-2 items-center my-2 font-semibold">
        <img
          src={data?.gravatarUrl}
          className="rounded-full"
          width={48}
          height={48}
        />
        <div className="flex gap-1 flex-col">
          <h2 className="text-2xl tracking-wide">{user?.username}</h2>
          <small className="text-sm text-muted tracking-wide">
            {user?.email}
          </small>
        </div>
      </div>
      <small className="text-sm text-muted">
        Last Updated: {new Date(user.updatedAt).toLocaleString()}
      </small>
      <Outlet />
    </div>
  )
}
