import React from "react"
import { Link } from "remix"
import { MongoDocument } from "~/types"
import { Habit } from "~/types/habits.server"

type HabitProps = {
  habit: MongoDocument<Habit>
}

export default function Habit({ habit }: HabitProps) {
  return (
    <Link
      className="h-40 w-40 bg-opacity-20 border-4 border-solid rounded-lg flex items-center justify-center font-bold tracking-wide"
      style={{
        backgroundColor: `${habit.colour}20`,
        borderColor: habit.colour,
        color: habit.colour,
      }}
      to={habit._id}
      title={`${habit.name}`}
    >
      {habit.name}
    </Link>
  )
}
