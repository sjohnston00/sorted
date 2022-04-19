import React from "react"
import { Link } from "remix"

export default function Index() {
  return (
    <div className="my-2">
      <Link to={"change-password"} className="btn btn-primary">
        Change Password
      </Link>
    </div>
  )
}
