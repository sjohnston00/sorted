import React from "react"
import { LoaderFunction } from "remix"
import { requireUserId } from "~/utils/session.server"

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request)

  //TODO: get the users details
  return {}
}

export default function Profile() {
  return <div>Profile</div>
}
