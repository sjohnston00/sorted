import { LoaderArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
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

export default function Habit() {
  const { habit } = useLoaderData<typeof loader>()
  return (
    <div className="grid grid-cols-4 gap-4">
      <button
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
    </div>
  )
}
