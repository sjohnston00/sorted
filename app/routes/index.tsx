import { useState } from "react"
import { ActionFunction, Form, Link } from "remix"

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const _id = formData.get("_id")
  const habitName = formData.get("name")
  const colour = formData.get("colour")

  return {
    _id,
    habitName,
    colour,
  }
}

export default function Index() {
  return (
    <main className="container mx-2">
      <h1 className="text-2xl">
        Welcome to <span className="text-3xl italic">"Sorted"</span>
      </h1>
      <Link
        to={"/habits"}
        className="text-blue-400 hover:text-blue-500 hover:underline"
      >
        My Habits
      </Link>
      <br />
    </main>
  )
}
