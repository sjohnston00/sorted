import React from "react"
import Habit from "~/models/Habit.server"
import { Link, LoaderFunction, Outlet, useLoaderData } from "remix"

export default function Index() {
  return (
    <Link to={"./new"} className="btn btn-primary">
      New
    </Link>
  )
}
