import { Dialog } from "@headlessui/react"
import { AnimatePresence, motion } from "framer-motion"
import React, { useState } from "react"
import {
  ActionFunction,
  Form,
  json,
  useActionData,
  useTransition,
  useSearchParams,
  LoaderFunction,
  redirect,
  Link,
  MetaFunction,
} from "remix"
import Modal from "~/components/Modal2"
import { createUserSession, getUserId, loginUser } from "~/utils/session.server"
import { AuthActionData } from "../types/actions"

export const meta: MetaFunction = () => {
  return {
    title: "Sorted | Login",
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request)
  if (userId) {
    return redirect("/habits")
  }
  return null
}

export const action: ActionFunction = async ({
  request,
}): Promise<AuthActionData | Response> => {
  const formData = await request.formData()
  const username = formData.get("username")?.toString()
  const password = formData.get("password")?.toString()
  const redirectTo = formData.get("redirectTo")?.toString() || "/habits"

  if (!username || !password || !redirectTo) {
    return {
      errors: {
        message: "Please provide a username and password",
      },
    }
  }

  const user = await loginUser(username, password)

  if (user?.errors) {
    return json(user, 400)
  }

  return createUserSession(user._id, redirectTo)
}

export default function Login() {
  const [searchParams] = useSearchParams()
  const actionData = useActionData<AuthActionData>()
  const transition = useTransition()
  const [open, setOpen] = useState(false)

  const submitting = transition.state === "submitting"
  return (
    <>
      <h1 className="text-4xl">Login</h1>
      <Form method="post" className="auth-form">
        <small data-testid="error-message" className="my-1 block text-red-400">
          {actionData?.errors.message || String.fromCharCode(160)}
        </small>
        <div className="mb-1">
          <label htmlFor="username">
            Username <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="username"
            id="username"
            autoComplete="username"
            minLength={3}
            maxLength={20}
            className="input"
            required
          />
        </div>
        <div className="mb-1">
          <label htmlFor="password">
            Password <span className="text-red-600">*</span>
          </label>
          <input
            type="password"
            name="password"
            id="password"
            autoComplete="password"
            minLength={8}
            maxLength={64}
            className="input"
            required
          />
        </div>
        <input
          type="hidden"
          name="redirectTo"
          value={searchParams.get("redirectTo") ?? undefined}
        />
        <div className="flex items-center gap-2 my-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            data-testid="login-button"
          >
            {submitting ? "Loging in... " : "Login"}
          </button>
          <Link to={"/register"}>Don&apos;t have an account? Create one</Link>
        </div>
      </Form>
    </>
  )
}

function AddFavorite({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col h-full">
        <div className="px-3 pb-4 shadow-sm bg-[#28282a] pt-3">
          <div className="relative text-center">
            <span className="font-medium text-neutral-50">Contacts</span>
            <div className="absolute inset-y-0 right-0">
              <button
                className="mr-1 text-blue-500 focus:outline-none"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ul className="px-3 text-left">
            <li className="py-2 border-b border-gray-100 ">Sam Johston</li>
          </ul>

          <p className="pt-4 pb-10 font-medium text-center ">Contacts</p>
        </div>
      </div>
    </Modal>
  )
}
