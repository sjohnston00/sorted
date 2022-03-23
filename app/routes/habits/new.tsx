import {
  ActionFunction,
  Form,
  Link,
  redirect,
  useActionData,
  useTransition,
} from "remix"
import Habit from "~/models/Habit.server"
import { requireUserId } from "~/utils/session.server"
import mongoose from "mongoose"
import LoadingIndicator from "~/components/LoadingIndicator"

type ActionData = {
  errors: {
    message?: string
    name?: string
    colour?: string
  }
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const formData = await request.formData()
  const name = formData.get("name")
  const colour = formData.get("colour")

  if (typeof name !== "string") {
    return {
      errors: {
        name: "Please provide a valid name",
      },
    }
  }
  if (typeof colour !== "string") {
    return {
      errors: {
        colour: "Please provide a valid colour",
      },
    }
  }

  await Habit.create({
    name: name,
    colour: colour,
    user: new mongoose.Types.ObjectId(userId),
  })
  return redirect("/habits")
}

export default function Index() {
  const actionData = useActionData<ActionData>()
  const transition = useTransition()
  const isLoading =
    transition.state === "loading" || transition.state === "submitting"

  return (
    <Form method="post" className="m-1">
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
          required
        />
        <small className="block text-danger">
          {actionData?.errors.name}&nbsp;
        </small>
      </div>
      <div className="mb-2">
        <label htmlFor="colour" className="mr-2">
          Colour
        </label>
        <input type="color" className="input p-0" name="colour" id="colour" />
        <small className="block text-danger">
          {actionData?.errors.colour}&nbsp;
        </small>
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
  )
}
