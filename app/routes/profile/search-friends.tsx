import React from "react"
import {
  ActionFunction,
  Form,
  LoaderFunction,
  useFetcher,
  useLoaderData,
} from "remix"
import User from "~/models/User.server"
import type { User as UserType } from "~/types/user.server"
import type { Document, Types } from "mongoose"

type LoaderData = {
  users?: Array<
    UserType & {
      _id: string
    }
  >
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const searchedUsername = url.searchParams.get("username")

  //search for users if the username params is there
  if (typeof searchedUsername === "string") {
    if (searchedUsername.length > 0) {
      const users = await User.find({
        username: new RegExp(searchedUsername, "i"),
      })
      return {
        users,
      }
    } else {
      return {}
    }
  }
  return {}
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  await new Promise((resolve) => setTimeout(resolve, 3000))
  return { data }
}

export default function SearchFriends() {
  const data = useLoaderData<LoaderData>()
  return (
    <div>
      <Form method="get">
        <input type="text" className="input" name="username" id="username" />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </Form>
      <hr />
      <div>
        {data?.users?.map((user) => (
          <UserRow user={user} key={user._id} />
        ))}
      </div>
    </div>
  )
}

type UserRowProps = {
  user: UserType & { _id: string }
}

function UserRow({ user }: UserRowProps) {
  const fetcher = useFetcher()
  return (
    <div>
      <p>{user.username}</p>
      <fetcher.Form method="post">
        <input type="hidden" name="userId" id="userId" value={user._id} />
        <input type="hidden" name="_action" id="_action" value="add-friend" />
        <button
          style={{ opacity: fetcher.state === "submitting" ? 0.7 : 1 }}
          className="transition-all"
        >
          x
        </button>
      </fetcher.Form>
    </div>
  )
}
