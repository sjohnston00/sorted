import React from "react"
import { ActionFunction, Form, Link, useActionData } from "remix"
import { isValidPassword } from "~/utils/register.server"
import { updateUserPassword } from "~/utils/server/user.server"
import { requireUserId } from "~/utils/session.server"
type ActionData = {
  errors?: {
    message?: string
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

export default function Index() {
  const actionData = useActionData<ActionData>()
  return (
    <>
      <hr className="my-2" />
      <h2 className="text-2xl">Change Password</h2>
      <Form method="post" className="mt-2">
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
        <small className="text-danger block">
          {actionData?.errors?.message}&nbsp;
        </small>

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
