import React from "react"
import {
  ActionFunction,
  Form,
  LoaderFunction,
  useActionData,
  useLoaderData,
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

type ActionData = {
  errors?: {
    message?: string
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const userDetails = await getUserDetails(userId)
  return {
    user: userDetails,
  }
}

export const action: ActionFunction = async ({
  request,
}): Promise<ActionData> => {
  const userId = await requireUserId(request)
  const formData = await request.formData()
  const newPassword = formData.get("new-password")
  if (typeof newPassword !== "string") {
    return {
      errors: {
        message: "Please provide a valid New Password",
      },
    }
  }

  const validPassword = isValidPassword(newPassword)
  if (!validPassword) {
    return {
      errors: {
        message:
          "Please provide a new password that is at least 8 characters long, 1 uppercase, 1 number and 1 special character",
      },
    }
  }

  await updateUserPassword(userId, newPassword)

  return {}
}

export default function Profile() {
  const { user } = useLoaderData<LoaderData>()
  const actionData = useActionData<ActionData>()
  return (
    <div className="flex flex-col">
      <div className="flex gap-2 items-center my-2 font-semibold">
        <HiUserCircle size={24} />
        <h2 className="text-2xl tracking-wide">{user?.username}</h2>
      </div>
      <small className="text-sm text-muted">
        Last Updated: {new Date(user.updatedAt).toString()}
      </small>
      <hr className="my-2" />
      <h3 className="text-xl">Change Password</h3>
      <Form method="post" className="mt-2">
        <label htmlFor="new-password">New Password</label>
        <input
          type={"password"}
          className="input"
          name="new-password"
          id="new-password"
          autoComplete="new-password"
          minLength={6}
          maxLength={64}
          required
        />
        <small className="text-danger block">
          {actionData?.errors?.message}&nbsp;
        </small>
        <button type="submit" className="mt-2 btn btn-primary">
          Confirm
        </button>
      </Form>
    </div>
  )
}
