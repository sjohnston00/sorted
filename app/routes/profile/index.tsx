import React from "react"
import { HiHeart, HiSearch } from "react-icons/hi"
import { ActionFunction, Form, Link, useFetcher, useMatches } from "remix"
import { User } from "~/types/user.server"
import { Document, Types } from "mongoose"
import { requireUserId } from "~/utils/session.server"
import { updateUserVisibility } from "~/utils/user.server"
import LoadingIndicator from "~/components/LoadingIndicator"

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const userId = await requireUserId(request)
  const data = Object.fromEntries(formData)

  if (data._action === "update-visibility") {
    await updateUserVisibility(
      userId,
      data.visibility === "true" ? "public" : "private"
    )
  }

  return { data }
}

export default function Index() {
  const [{ data }] = useMatches()
  const user = data.user
  return (
    <>
      <UserProfileVisibility user={user} />
      <div className="flex gap-2 my-2">
        <Link to={"change-password"} className="btn btn-primary">
          Change Password
        </Link>
        <Link
          to={"friends"}
          className="btn btn-primary flex items-center gap-2"
        >
          My Friends <HiHeart />
        </Link>
        <Link
          to={"search-friends"}
          className="btn btn-primary flex items-center gap-2"
        >
          Search Friends <HiSearch />
        </Link>
        <form action="/logout" method="post" className="inline">
          <button className="btn btn-danger">Logout</button>
        </form>
        <Link to={"delete-account"} className="btn btn-danger ">
          Delete Account
        </Link>
      </div>
    </>
  )
}

type UserProfileVisibilityProps = {
  user: User & {
    _id: Types.ObjectId
    createdAt: string
    updatedAt: string
  }
}

export function UserProfileVisibility({ user }: UserProfileVisibilityProps) {
  const fetcher = useFetcher()
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    fetcher.submit(
      {
        visibility: String(e.target.checked),
        _action: "update-visibility",
      },
      {
        action: `${window.location.href}?index`,
        method: "put",
        encType: "application/x-www-form-urlencoded",
      }
    )
  }
  return (
    <fetcher.Form method="put">
      <label htmlFor="profile-visibility" className="block">
        Public Profile{" "}
        {fetcher.state === "submitting" ? (
          <LoadingIndicator className="spinner h-6 w-6" />
        ) : null}
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
