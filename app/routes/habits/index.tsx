import React from "react"
import { Link } from "remix"

export default function Index() {
  return (
    <Link to={"./new"} className="btn btn-primary">
      New
    </Link>
  )
}
