import React from "react"
import { ActionFunction, Link } from "remix"

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  return {
    data: Object.fromEntries(formData),
  }
}

export default function Index() {
  return (
    <div className="my-2">
      <Link to={"change-password"} className="btn btn-primary">
        Change Password
      </Link>
    </div>
  )
}
