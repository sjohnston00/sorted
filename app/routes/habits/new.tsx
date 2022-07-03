import React, { useState } from "react"
import {
  ActionFunction,
  Form,
  Link,
  MetaFunction,
  redirect,
  useActionData,
  useTransition,
} from "remix"
import Habit from "~/models/Habit.server"
import { requireUserId } from "~/utils/session.server"
import mongoose from "mongoose"
import LoadingIndicator from "~/components/LoadingIndicator"
import { Habit as HabitType } from "~/types/habits.server"
import BackButton from "~/components/BackButton"

export const meta: MetaFunction = () => {
  return {
    title: `Sorted | Habits | New`,
  }
}

type ActionData = {
  errors: {
    message?: string
  }
}

export const action: ActionFunction = async ({
  request,
}): Promise<ActionData | Response> => {
  const userId = await requireUserId(request)
  const formData = await request.formData()
  const name = formData.get("name")
  const colour = formData.get("colour")
  const visibility = formData.get("visibility")
  const note = formData.get("note")

  if (typeof name !== "string") {
    return {
      errors: {
        message: "Please provide a valid name",
      },
    }
  }
  if (typeof colour !== "string") {
    return {
      errors: {
        message: "Please provide a valid colour",
      },
    }
  }

  await Habit.create({
    name: name,
    colour: colour,
    user: new mongoose.Types.ObjectId(userId),
    visibility: visibility ? "private" : "public",
    note: note,
  })
  return redirect("/habits")
}

export default function Index() {
  const actionData = useActionData<ActionData>()
  const transition = useTransition()
  const isLoading =
    transition.state === "loading" || transition.state === "submitting"

  const [habit, setHabit] = useState<Pick<HabitType, "name" | "colour">>({
    name: "...",
    colour: "#ffffff",
  })

  const habitBox =
    typeof window !== "undefined" ? document.getElementById("habit-new") : null

  const handleColourChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setHabit({ ...habit, colour: `${e.target.value}` })
    // if (!habitBox) return
    // habitBox.style.backgroundColor = `${e.target.value}20`
    // habitBox.style.color = `${e.target.value}`
    // habitBox.style.borderColor = `${e.target.value}`
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!habitBox) return
    habitBox.textContent = e.target.value || "..."
  }

  const handleRandomColour = () => {
    const randomColour = Math.floor(Math.random() * 16777215).toString(16)
    setHabit({ ...habit, colour: `#${randomColour}` })
  }

  return (
    <>
      <BackButton to="/Habits">Habits</BackButton>
      <h1 className="text-3xl tracking-wide font-medium">New Habit</h1>
      <Form method="post" className="mt-2">
        <div
          className="mx-auto p-1 h-40 w-40 bg-opacity-20 border-4 border-solid rounded-lg flex items-center justify-center font-bold tracking-wide"
          style={{
            backgroundColor: `${habit.colour}20`,
            borderColor: habit.colour,
            color: habit.colour,
          }}
          id="habit-new"
        >
          {habit.name}
        </div>
        <small className="block text-danger">
          {actionData?.errors.message}&nbsp;
        </small>
        <div className="mb-2">
          <label htmlFor="name" className="mr-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            className="input"
            placeholder="e.g Drink 2L Water..."
            onChange={handleTextChange}
            required
          />
        </div>
        <div className="mb-2">
          <label htmlFor="colour" className="mr-2">
            Colour
          </label>
          <input
            type="color"
            className="input p-0 w-1/2"
            name="colour"
            id="colour"
            value={habit.colour}
            onChange={handleColourChange}
          />
        </div>
        <button onClick={handleRandomColour} type={"button"}>
          Random
        </button>
        <div className="mb-2">
          <label htmlFor="note" className="mr-2">
            Note (Optional)
          </label>
          <textarea
            className="input"
            name="note"
            id="note"
            maxLength={500}
            placeholder="Note for your habit"
          />
        </div>
        <div className="mb-2">
          <label htmlFor="visibility">
            <input type="checkbox" name="visibility" id="visibility" />
            Private Habit
          </label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary">
            {isLoading ? (
              <span className="flex gap-2">
                Creating...{" "}
                <LoadingIndicator className="spinner static h-6 w-6" />
              </span>
            ) : (
              "Create"
            )}
          </button>
          <Link to={"/habits"} className="btn btn-dark hover:no-underline">
            Back
          </Link>
        </div>
      </Form>
    </>
  )
}
