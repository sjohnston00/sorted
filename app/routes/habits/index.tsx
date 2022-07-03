import React from "react"
import { Link, LoaderFunction, useLoaderData } from "remix"
import { requireUserId } from "~/utils/session.server"
import { default as DBHabit } from "~/models/Habit.server"
import { Habit as HabitType } from "~/types/habits.server"
import { MongoDocument } from "~/types"
import HabitBox from "~/components/HabitBox"

type LoaderData = {
  habits: MongoDocument<HabitType>[]
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const habits = await DBHabit.find({ user: userId }).populate("user")
  return { habits }
}

export default function Index() {
  const { habits } = useLoaderData<LoaderData>()

  return (
    <>
      <h1 className="flex items-start gap-2 text-3xl tracking-wide font-medium">
        Habits <span className="text-sm text-neutral-400">{habits.length}</span>
      </h1>
      <ul className="flex flex-wrap py-4 gap-10">
        {habits.length > 0 ? (
          habits.map((habit) => <HabitBox key={habit._id} habit={habit} />)
        ) : (
          <p className="text-neutral-400 text-sm font-light">
            You are currently not tracking any habits
          </p>
        )}
      </ul>
      <Link to={"new"} className="btn btn-primary">
        New
      </Link>
    </>
  )
}
