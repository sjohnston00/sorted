import React from "react"
import { ActionFunction, LoaderFunction, Outlet, useLoaderData } from "remix"
import { User } from "~/types/user.server"
import { getUserDetails, updateUserVisibility } from "~/utils/user.server"
import { requireUserId } from "~/utils/session.server"
import { MongoDocument } from "~/types"

type LoaderData = {
  user: MongoDocument<User>
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const userDetails = await getUserDetails(userId)
  return {
    user: userDetails,
  }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const userId = await requireUserId(request)
  const data = Object.fromEntries(formData)

  if (data._action === "update-visibility") {
    await updateUserVisibility(
      userId,
      data.visibility === "public" ? "public" : "private"
    )
  }
  return {}
}

export default function Profile() {
  const { user } = useLoaderData<LoaderData>()

  return (
    // <div className="flex flex-col">
    //   <div className="flex gap-2 items-center my-2 font-semibold">
    //     <img
    //       src={user.gravatarURL}
    //       className="rounded-full"
    //       width={48}
    //       height={48}
    //     />
    //     <div className="flex gap-1 flex-col">
    //       <h2 className="text-2xl tracking-wide">{user.username}</h2>
    //       <small className="text-sm text-muted tracking-wide">
    //         {user?.email}
    //       </small>
    //     </div>
    //   </div>
    //   <small className="text-sm text-muted">
    //     Last Updated: {new Date(user.updatedAt).toLocaleString()}
    //   </small>
    //   <small className="text-sm text-muted">
    //     Friends: {user.friends.length}
    //   </small>
    //   <Outlet />
    // </div>
    <Outlet />
  )
}
