import React from "react"
import { Form, LoaderFunction, useLoaderData } from "remix"
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
          <div key={user._id}>
            <p>{user.username}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
