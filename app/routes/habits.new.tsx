import { ActionArgs, LoaderArgs, redirect } from "@remix-run/node"
import { Form, useNavigation } from "@remix-run/react"
import { prisma } from "~/db.server"
import { getUser } from "~/utils/auth"

export const loader = async (args: LoaderArgs) => {
  await getUser(args)
  return {}
}
export const action = async (args: ActionArgs) => {
  const { userId } = await getUser(args)
  const formData = await args.request.formData()
  const { name, colour } = Object.fromEntries(formData)

  await prisma.habit.create({
    data: {
      name: name.toString()!,
      colour: colour.toString()!,
      userId,
    },
  })

  throw redirect("/")
}

export default function NewHabit() {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"
  const isLoading = navigation.state === "loading"
  return (
    <div className="max-w-md mx-auto">
      <Form method="post">
        <input
          className="block my-2 p-2 border border-gray-400"
          type="text"
          name="name"
          id="name"
          placeholder="name"
          minLength={3}
          maxLength={255}
          required
        />
        <input
          className="block my-2 p-1 border border-gray-400"
          type="color"
          name="colour"
          id="colour"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-400 text-gray-100 font-semibold uppercase tracking-wide rounded shadow active:scale-95 active:opacity-80 disabled:opacity-80 disabled:cursor-not-allowed transition"
          disabled={isSubmitting || isLoading}>
          Create
        </button>
      </Form>
    </div>
  )
}
