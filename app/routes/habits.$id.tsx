import React from "react"
import Habit from "~/models/Habit.server"
import {
  ActionFunction,
  Form,
  Link,
  LoaderFunction,
  MetaFunction,
  redirect,
  useLoaderData,
} from "remix"
import MarkedHabit from "~/models/MarkedHabit.server"

export const meta: MetaFunction = ({ data }) => {
  return {
    title: `Sorted | Habits | ${data.name}`,
  }
}

export const loader: LoaderFunction = async ({ params }) => {
  const habit = await Habit.findById(params.id)
  if (!habit) {
    return redirect("/habits", {
      status: 404,
    })
  }
  return habit
}

export const action: ActionFunction = async ({ request, params }) => {
  const { id } = params
  const formData = await request.formData()
  const method = formData.get("method")

  if (typeof method !== "string") {
    return {
      errors: {
        message: "Please submit a valid method",
      },
    }
  }

  if (method === "delete") {
    const deletedHabit = await Habit.deleteOne({ _id: id })
    const deletedMarkedHabits = await MarkedHabit.deleteMany({ habit: id })

    return redirect("/habits")
  }

  if (method === "put") {
    const name = formData.get("name")
    const colour = formData.get("colour")

    if (typeof name !== "string" || typeof colour !== "string") {
      return {
        errors: {
          name: "Please provide a valid name",
          colour: "Please provide a valid colour",
        },
      }
    }
    const updated = await Habit.updateOne(
      { _id: id },
      {
        $set: {
          name: name,
          colour: colour,
        },
      }
    )

    return redirect(`/habits/${id}`)
  }

  return {}
}

export default function Index() {
  const habit = useLoaderData()

  return (
    <div>
      <dl className="font-bold">Name:</dl>
      <dd>{habit.name}</dd>
      <dl className="font-bold">Colour:</dl>
      <div
        className="h-6 w-6 inline-block border-2 border-slate-900"
        style={{ backgroundColor: habit.colour }}
      ></div>
      <Form method="post" className="m-1">
        <div className="mb-2">
          <label htmlFor="name" className="mr-2 block">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Habit name"
            className="input"
            defaultValue={habit.name}
            required
          />
        </div>
        <div className="mb-2">
          <label htmlFor="colour" className="mr-2">
            Colour
          </label>
          <input
            type="color"
            name="colour"
            id="colour"
            defaultValue={habit.colour}
          />
        </div>
        <div className="flex gap-2 text-lg">
          <Link to={"/habits"} className="btn btn-dark hover:no-underline">
            Back
          </Link>
          <button
            type="submit"
            name="method"
            value="put"
            className="btn btn-primary"
          >
            Update
          </button>
          <button
            type="submit"
            name="method"
            value="delete"
            className="btn btn-danger"
          >
            Delete
          </button>
        </div>
      </Form>
    </div>
  )
}
