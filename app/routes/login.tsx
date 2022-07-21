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
      <button onClick={() => setOpen(true)}>Open Modal</button>
      <AnimatePresence>
        {open && <AddFavorite onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  )
}

const TRANSITIONS = {
  DURATION: 0.5,
  EASE: [0.32, 0.72, 0, 1],
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

function Modal({
  onClose,
  children,
}: {
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <Dialog static className="fixed inset-0 z-10" onClose={onClose} open={true}>
      <div className="flex flex-col justify-center h-full px-1 pt-4 text-center sm:block sm:p-0">
        <Dialog.Overlay
          as={motion.div}
          variants={{
            open: {
              opacity: 1,
              transition: {
                ease: TRANSITIONS.EASE,
                duration: TRANSITIONS.DURATION,
              },
            },
            closed: {
              opacity: 0,
              transition: {
                ease: TRANSITIONS.EASE,
                duration: TRANSITIONS.DURATION,
              },
            },
          }}
          initial="closed"
          animate="open"
          exit="closed"
          onAnimationStart={(variant: string) => {
            if (variant === "open") {
              set(document.documentElement, {
                background: "black",
                height: "100vh",
              })
              set(document.body, { position: "fixed", inset: "0" })
              set(document.querySelector("header"), { position: "absolute" })
              set(document.querySelector("#__app"), {
                borderRadius: "8px",
                overflow: "hidden",
                transform:
                  "scale(0.93) translateY(calc(env(safe-area-inset-top) + 8px))",
                transformOrigin: "top",
                transitionProperty: "transform",
                transitionDuration: `${TRANSITIONS.DURATION}s`,
                transitionTimingFunction: `cubic-bezier(${TRANSITIONS.EASE.join(
                  ","
                )})`,
              })
            } else {
              reset(document.querySelector("#__app"), "transform")
            }
          }}
          onAnimationComplete={(variant: string) => {
            if (variant === "closed") {
              reset(document.documentElement)
              reset(document.body)
              reset(document.querySelector("header"))
              reset(document.querySelector("#__app"))
            }
          }}
          className="fixed inset-0 bg-black/40"
        />

        <motion.div
          initial={{ y: "100%" }}
          animate={{
            y: 0,
            transition: { duration: 0.4, ease: [0.36, 0.66, 0.04, 1] },
          }}
          exit={{
            y: "100%",
            transition: { duration: 0.3, ease: [0.36, 0.66, 0.04, 1] },
          }}
          className="z-0 flex flex-col w-full h-full bg-[#1c1c1e] rounded-t-lg shadow-xl mt-40"
        >
          {children}
        </motion.div>
      </div>
    </Dialog>
  )
}

const cache = new Map()

function set(el: any, styles?: any) {
  const originalStyles: { [a: string]: any } = {}

  Object.entries(styles).forEach(([key, value]) => {
    originalStyles[key] = el.style[key]
    el.style[key] = value
  })

  cache.set(el, originalStyles)
}

function reset(el: any, prop?: any) {
  const originalStyles = cache.get(el)

  if (prop) {
    el.style[prop] = originalStyles[prop]
  } else {
    Object.entries(originalStyles).forEach(([key, value]) => {
      el.style[key] = value
    })
  }
}
