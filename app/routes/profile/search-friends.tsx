import React from "react"
import {
  ActionFunction,
  Form,
  Link,
  LoaderFunction,
  useFetcher,
  useLoaderData,
} from "remix"
import User from "~/models/User.server"
import type { User as UserType } from "~/types/user.server"
import { HiCheck, HiPlus } from "react-icons/hi"
import type { Document, Types } from "mongoose"
import { getUser, getUserId, requireUserId } from "~/utils/session.server"
import { getUserDetails } from "~/utils/user.server"
import { createFriendRequest } from "~/utils/friends.server"

type LoaderData = {
  users?: Array<
    UserType & {
      _id: string
    }
  >
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const user = await getUserDetails(userId)
  const url = new URL(request.url)
  const searchedUsername = url.searchParams.get("username")

  //search for users if the username params is there
  if (typeof searchedUsername === "string") {
    if (searchedUsername.length > 0) {
      const users = await User.find({
        username: new RegExp(searchedUsername, "i"),
      })

      //TODO: sort the users by if they are friends first
      return {
        users: users.filter((user) => !user._id.equals(userId)),
      }
    } else {
      return {}
    }
  }
  return {}
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  if (data._action === "add-friend") {
    //TODO: create a friend request
    const friendRequest = await createFriendRequest(
      userId,
      data.userId.toString()
    )
    return { friendRequest }
  }
  await new Promise((resolve) => setTimeout(resolve, 1500))
  return { data }
}

export default function SearchFriends() {
  const data = useLoaderData<LoaderData>()
  return (
    <div>
      <Form method="get">
        <input type="text" className="input" name="username" id="username" />
        <div className="flex gap-2">
          <Link className="btn btn-dark" to={"/profile"}>
            Back
          </Link>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
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
  //TODO: If the user is already a friend, show a checkmark instead of a plus

  return (
    <div className="flex items-center">
      <p className="py-2">{user.username}</p>
      <fetcher.Form method="post">
        <input type="hidden" name="userId" id="userId" value={user._id} />
        <input type="hidden" name="_action" id="_action" value="add-friend" />

        <button
          style={{ opacity: fetcher.state === "submitting" ? 0.5 : 1 }}
          className={`transition-all p-2 `}
        >
          {false ? <HiCheck /> : <HiPlus />}
        </button>
      </fetcher.Form>
    </div>
  )
}
