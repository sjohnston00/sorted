import React from "react"
import { HiHeart, HiSearch } from "react-icons/hi"
import { ActionFunction, Link, useFetcher, useMatches } from "remix"
import { User } from "~/types/user.server"
import { requireUserId } from "~/utils/session.server"
import { updateUserVisibility } from "~/utils/user.server"
import LoadingIndicator from "~/components/LoadingIndicator"
import { MongoDocument } from "~/types"

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
  const user: MongoDocument<User> = data.user
  const imageSize = 144
  return (
    <>
      <div className="flex justify-around pt-4 mb-4">
        <div className="flex items-center flex-col gap-4">
          <img
            src={user.gravatarURL}
            className="rounded-full"
            alt="users profile image"
            width={imageSize}
            height={imageSize}
          />
          <span className="text-lg tracking-wide text-neutral-200">
            {user.username}
          </span>
        </div>
        <div className="self-center py-8 border-l-2 border-l-neutral-600 flex flex-col gap-1 justify-center items-center pl-6">
          <h2 className="text-3xl font-medium tracking-wide">Joined</h2>
          <span className="font-light text-neutral-400">
            {new Date(user.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
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
  user: MongoDocument<User>
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
