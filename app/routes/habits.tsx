import React from "react"
import { default as DBHabit } from "~/models/Habit.server"
import HabitBox from "~/components/HabitBox"
import {
  Link,
  LoaderFunction,
  MetaFunction,
  Outlet,
  useLoaderData,
} from "remix"
import { requireUserId } from "~/utils/session.server"
import { MongoDocument } from "~/types"
import { Habit as HabitType } from "~/types/habits.server"

export const meta: MetaFunction = () => {
  return {
    title: "Sorted | Habits",
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const habits = await DBHabit.find({ user: userId }).populate("user")
  return habits
}

export default function Index() {
  const data = useLoaderData<MongoDocument<HabitType>[]>()
  return (
    <>
      <h1 className="text-3xl">Habits</h1>
      <ul className="flex flex-wrap py-4 gap-10 justify-center">
        {data.length > 0 ? (
          data.map((habit) => <HabitBox key={habit._id} habit={habit} />)
        ) : (
          <p className="py-2 text-red-500">You do not have any habits.</p>
        )}
      </ul>
      <Outlet />
    </>
  )
}
