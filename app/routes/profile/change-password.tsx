import React from "react"
import { ActionFunction, Form, Link, useActionData } from "remix"
import { isValidPassword } from "~/utils/register.server"
import {
  getUserDetails,
  isCorrectPassword,
  updateUserPassword,
} from "~/utils/server/user.server"
import { requireUserId } from "~/utils/session.server"
type ActionData = {
  message?: string
  success?: boolean
}

export const action: ActionFunction = async ({
  request,
}): Promise<ActionData> => {
  const userId = await requireUserId(request)
  const formData = await request.formData()
  const newPassword = formData.get("new-password")
  const currentPassword = formData.get("current-password")
  if (typeof newPassword !== "string" || typeof currentPassword !== "string") {
    return {
      message: "Please provide a valid Current and New Password",
    }
  }

  if (currentPassword === newPassword) {
    return {
      message: "New password cannot be the same as the current password",
    }
  }

  const user = await getUserDetails(userId)
  const _isCorrectPassword = await isCorrectPassword(
    currentPassword,
    user?.password || ""
  )
  if (!_isCorrectPassword) {
    return {
      message: "Current password you entered is incorrect. Please try again.",
    }
  }
  const validPassword = isValidPassword(newPassword)
  if (!validPassword) {
    return {
      message:
        "Please provide a new password that is at least 8 characters long, 1 uppercase, 1 number and 1 special character",
    }
  }

  await updateUserPassword(userId, newPassword)

  return {
    message: "Password was updated successfully",
    success: true,
  }
}

export default function Index() {
  const actionData = useActionData<ActionData>()
  return (
    <>
      <hr className="my-2" />
      <h2 className="text-2xl">Change Password</h2>
      <Form method="post" className="mt-2">
        <small
          className={`${
            actionData?.success ? "text-emerald-600" : "text-danger"
          } text-sm block`}
        >
          {actionData?.message}&nbsp;
        </small>
        <label htmlFor="current-password">Current Password</label>
        <input
          type={"password"}
          className="input"
          name="current-password"
          id="current-password"
          autoComplete="password"
          placeholder="Current Password"
          minLength={6}
          maxLength={64}
          required
        />
        <label htmlFor="new-password">New Password</label>
        <input
          type={"password"}
          className="input"
          name="new-password"
          id="new-password"
          autoComplete="new-password"
          placeholder="New Password"
          minLength={6}
          maxLength={64}
          required
        />

        <div className="flex gap-2">
          <Link to=".." className="mt-2 btn btn-dark">
            Back
          </Link>
          <button type="submit" className="mt-2 btn btn-primary">
            Confirm
          </button>
        </div>
      </Form>
    </>
  )
}
