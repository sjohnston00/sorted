import React from "react"
import { HiHeart, HiSearch } from "react-icons/hi"
import { ActionFunction, Form, Link } from "remix"

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  return {
    data,
  }
}

export default function Index() {
  return (
    <div className="flex gap-2 my-2">
      <Link to={"change-password"} className="btn btn-primary">
        Change Password
      </Link>
      <Link to={"friends"} className="btn btn-primary flex items-center gap-2">
        My Friends <HiHeart />
      </Link>
      <Link
        to={"search-friends"}
        className="btn btn-primary flex items-center gap-2"
      >
        Search Friends <HiSearch />
      </Link>
      <Link to={"delete-account"} className="btn btn-danger ">
        Delete Account
      </Link>
    </div>
  )
}
