import React from "react"
import {
  ActionFunction,
  Form,
  LoaderFunction,
  Outlet,
  useActionData,
  useFetcher,
  useLoaderData,
  useMatches,
} from "remix"
import { User } from "~/types/user.server"
import {
  getUserDetails,
  updateUserPassword,
  updateUserVisibility,
} from "~/utils/user.server"
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
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const userId = await requireUserId(request)
  const data = Object.fromEntries(formData)

  updateUserVisibility(
    userId,
    data.visibility === "true" ? "public" : "private"
  )

  return { data }
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
      <small className="text-sm text-muted">
        Friends: {user.friends.length}
      </small>
      <UserProfileVisibility user={user} />
      <form action="/logout" method="post" className="inline">
        <button className="btn btn-danger">Logout</button>
      </form>
      <Outlet />
    </div>
  )
}

type UserProfileVisibilityProps = {
  user: Document<unknown, any, User> &
    User & {
      _id: Types.ObjectId
      createdAt: string
      updatedAt: string
    }
}

export function UserProfileVisibility({ user }: UserProfileVisibilityProps) {
  const fetcher = useFetcher()
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    console.log("input onChange", e)
    fetcher.submit(
      {
        visibility: String(e.target.checked),
      },
      {
        action: window.location.href,
        method: "put",
        encType: "application/x-www-form-urlencoded",
      }
    )
  }
  return (
    <fetcher.Form method="put">
      <label htmlFor="profile-visibility" className="block">
        Public Profile {fetcher.state === "submitting" ? "updating..." : ""}
      </label>
      <input
        type="checkbox"
        defaultChecked={user.visibility === "public"}
        onChange={handleFormChange}
        name="profile-visibility"
        id="profile-visibility"
      />
    </fetcher.Form>
  )
}
