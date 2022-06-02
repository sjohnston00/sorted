import React from "react"
import { HiHeart, HiSearch } from "react-icons/hi"
import { ActionFunction, Form, Link } from "remix"

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  if (data._action === "delete-account") {
    console.log("delete account")
    return {}
  }

  return {
    data,
  }
}

export default function Index() {
  return (
    <>
      <Form method="post">
        <label>Are you sure you want to delete your account?</label>
        <small>
          This will also delete all your data associated with your account
        </small>
        <div className="flex gap-2">
          <Link to="/profile" className="btn btn-dark">
            No
          </Link>
          <button
            type="submit"
            name="_action"
            id="_action"
            value="delete-account"
            className="btn btn-danger"
          >
            Yes
          </button>
        </div>
      </Form>
    </>
  )
}
