import React from "react"
import { ActionFunction, Form, Link } from "remix"
import { declineAllFriendRequestForUser } from "~/utils/friendRequests.server"
import { deleteHabitsForUser } from "~/utils/habits.server"
import { deleteMarkedHabitsForUser } from "~/utils/markedHabits.server"
import { logout, requireUserId } from "~/utils/session.server"
import { deleteUser, updateAllUsersFriendList } from "~/utils/user.server"

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)

  await Promise.all([
    //Delete habits for user
    deleteHabitsForUser(userId),
    //Delete marked habits for user
    deleteMarkedHabitsForUser(userId),
    // //Delete friendRequests for user
    declineAllFriendRequestForUser(userId),
    // //Remove friend Id from all users who this user as a friend
    updateAllUsersFriendList(userId),
    // //Delete the user from DB
    deleteUser(userId),
  ])

  return logout(request)
}

export default function Index() {
  return (
    <>
      <Form method="post">
        <div className="flex flex-col mb-2">
          <label>Are you sure you want to delete your account?</label>
          <small>
            This will also delete all your data associated with your account
          </small>
        </div>
        <div className="flex gap-2">
          <Link to="/profile" className="btn btn-dark">
            No
          </Link>
          <button type="submit" className="btn btn-danger">
            Yes
          </button>
        </div>
      </Form>
    </>
  )
}
