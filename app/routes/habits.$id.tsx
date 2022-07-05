import React, { useState } from "react"
import Habit from "~/models/Habit.server"
import { Habit as HabitType } from "~/types/habits.server"
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
import HabitBox from "~/components/HabitBox"
import { MongoDocument } from "~/types"
import BackButton from "~/components/BackButton"
import { IoIosShuffle } from "react-icons/io"
import ShuffleColourButton from "~/components/ShuffleColourButton"

type LoaderData = {
  habit: MongoDocument<HabitType>
}

export const meta: MetaFunction = ({ data }) => {
  return {
    title: `Sorted | Habits | ${data.habit.name}`,
  }
}

export const loader: LoaderFunction = async ({ params }) => {
  const habit = await Habit.findById(params.id)
  if (!habit) {
    return redirect("/habits", {
      status: 404,
    })
  }
  return { habit }
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
    await Promise.all([
      Habit.deleteOne({ _id: id }),
      MarkedHabit.deleteMany({ habit: id }),
    ])

    return redirect("/habits")
  }

  if (method === "put") {
    const name = formData.get("name")
    const colour = formData.get("colour")
    const visibility = formData.get("visibility")
    const note = formData.get("note")

    if (typeof name !== "string" || typeof colour !== "string") {
      return {
        errors: {
          name: "Please provide a valid name",
          colour: "Please provide a valid colour",
        },
      }
    }
    await Habit.updateOne(
      { _id: id },
      {
        $set: {
          name: name,
          colour: colour,
          visibility: visibility ? "private" : "public",
          note: note,
        },
      }
    )

    await MarkedHabit.updateMany(
      { habit: id },
      {
        $set: {
          visibility: visibility ? "private" : "public",
        },
      }
    )

    return redirect(`/habits/${id}`)
  }

  return {}
}

export default function Index() {
  const { habit } = useLoaderData<LoaderData>()
  const habitBox =
    typeof window !== "undefined"
      ? document.querySelector(`#habit-${habit._id}`)
      : null

  const [habitStyle, setHabitStyle] = useState<
    Pick<HabitType, "name" | "colour">
  >({
    name: habit.name,
    colour: habit.colour,
  })

  const handleColourChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    // if (!habitBox) return
    // habitBox.style.backgroundColor = `${e.target.value}20`
    // habitBox.style.color = `${e.target.value}`
    // habitBox.style.borderColor = `${e.target.value}`
    setHabitStyle({ ...habitStyle, colour: `${e.target.value}` })
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    // if (!habitBox) return
    // habitBox.textContent = e.target.value
    setHabitStyle({ ...habitStyle, name: e.target.value || "..." })
  }

  const handleRandomColour = () => {
    const randomColour = Math.floor(Math.random() * 16777215).toString(16)
    setHabitStyle({ ...habitStyle, colour: `#${randomColour}` })
  }

  return (
    <div className="pt-4">
      {/* <HabitBox habit={habit} /> */}
      <BackButton to="/habits">Habits</BackButton>
      <h1 className="text-3xl tracking-wide font-medium mb-2">Update Habit</h1>
      <div
        className="p-1 h-40 w-40 bg-opacity-20 border-4 border-solid rounded-lg flex items-center justify-center font-bold tracking-wide"
        style={{
          backgroundColor: `${habitStyle.colour}20`,
          borderColor: habitStyle.colour,
          color: habitStyle.colour,
        }}
        title={habitStyle.name}
      >
        {habitStyle.name}
      </div>
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
            onChange={handleTextChange}
            required
          />
        </div>
        <div className="mb-2">
          <label htmlFor="colour" className="mr-2">
            Colour
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              className="input p-0"
              name="colour"
              id="colour"
              value={habitStyle.colour}
              onChange={handleColourChange}
            />
            <ShuffleColourButton handleRandomColour={handleRandomColour} />
          </div>
        </div>

        <div className="mb-2">
          <label htmlFor="note" className="mr-2">
            Note (Optional)
          </label>
          <textarea
            className="input"
            name="note"
            id="note"
            maxLength={500}
            defaultValue={habit.note}
            placeholder="Note for your habit"
          />
        </div>
        <div className="mb-2">
          <label htmlFor="visibility">
            <input
              type="checkbox"
              name="visibility"
              id="visibility"
              defaultChecked={habit.visibility === "private"}
            />
            Private Habit
          </label>
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
