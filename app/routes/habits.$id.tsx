import { ActionArgs, LoaderArgs, redirect } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { prisma } from "~/db.server"
import { getUser } from "~/utils/auth"

export const loader = async (args: LoaderArgs) => {
  const { userId } = await getUser(args)
  const { id } = args.params

  const habit = await prisma.habit.findUnique({
    where: {
      id,
    },
  })

  if (!habit) {
    throw new Response("Not Found", {
      status: 404,
    })
  }

  if (habit.userId !== userId) {
    throw new Response("Not Authorized", {
      status: 401,
    })
  }
  return { habit }
}

export const action = async (args: ActionArgs) => {
  const { userId } = await getUser(args)
  const { id } = args.params

  const habit = await prisma.habit.findUnique({
    where: {
      id,
    },
  })

  if (!habit) {
    throw new Response("Not Found", {
      status: 404,
    })
  }

  if (habit.userId !== userId) {
    throw new Response("Not Authorized", {
      status: 401,
    })
  }
  //Validation passed
  //TODO: decide wether we want to keep the marked habits on the calendar, which will mean we only need to set an enabled flag to false
  // or delete all the marked habits before deleting the actual habit as it would cause a DB foreign key issue
  // this could also be a decission a user makes when deleting the actual habit, like a checkbox

  // method 1:
  // await prisma.habit.update({
  //   data: {
  //     enabled: false
  //   },
  //   where: {
  //     id
  //   }
  // })

  // method 2:
  await prisma.markedHabit.deleteMany({
    where: {
      habitId: id,
    },
  })
  await prisma.habit.delete({
    where: {
      id: id,
    },
  })

  throw redirect("/habits")
}

export default function Habit() {
  const { habit } = useLoaderData<typeof loader>()
  return (
    <div className="grid grid-cols-4 gap-4">
      <button
        type="button"
        className="py-4 px-2 rounded shadow text-center border-2 font-semibold text-lg tracking-wide disabled:opacity-30 disabled:cursor-not-allowed active:opacity-70 active:scale-90 transition"
        style={
          {
            color: habit.colour,
            borderColor: habit.colour,
            backgroundColor: `${habit.colour}20`,
            "--tw-shadow-color": habit.colour,
          } as React.CSSProperties
        }>
        {habit.name}
      </button>
      <Form method="post">
        <button
          type="submit"
          className="py-4 px-2 rounded shadow text-center disabled:opacity-30 disabled:cursor-not-allowed active:opacity-70 active:scale-90 transition bg-red-600 text-white">
          delete
        </button>
      </Form>
    </div>
  )
}
