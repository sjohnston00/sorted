import React from "react"
import {
  ActionFunction,
  Form,
  Link,
  LoaderFunction,
  useActionData,
  useLoaderData,
  useNavigate,
  useTransition,
} from "remix"
import Modal from "react-modal"
import { requireUserId } from "~/utils/session.server"
import { getMarkedHabitsForUser } from "~/utils/markedHabits.server"
import { getHabitsForUser } from "~/utils/habits.server"
import MarkedHabit from "~/models/MarkedHabit.server"
import mongoose from "mongoose"
import LoadingIndicator from "~/components/LoadingIndicator"

type LoaderData = {
  loaderDate: string
  habits: Array<any>
  markedHabits: Array<any>
}

type ActionData = {
  errors?: {
    message?: string
    habit?: string
    markedDate?: string
  }
}

export const loader: LoaderFunction = async ({
  request,
  params,
}): Promise<LoaderData> => {
  const userId = await requireUserId(request)
  const date = new Date(params.date || "")
  const nextDate = new Date(new Date().setDate(date.getDate() + 1))
  nextDate.setHours(0, 0, 0, 0)
  const markedHabits = await getMarkedHabitsForUser(userId, date, nextDate)
  const habits = await getHabitsForUser(userId)

  return {
    loaderDate: date.toISOString(),
    habits: habits,
    markedHabits: markedHabits,
  }
}

export const action: ActionFunction = async ({
  request,
  params,
}): Promise<ActionData> => {
  const userId = await requireUserId(request)
  const formData = await request.formData()
  const habitId = formData.get("selectedHabit")
  const markedDate = formData.get("markedDate")

  if (typeof habitId !== "string" || typeof markedDate !== "string") {
    return {
      errors: {
        message: "Please provide a valid Habit",
        markedDate: "Please provide a valid Date",
      },
    }
  }

  if (request.method === "DELETE") {
    //TODO: Delete the marked habit from the date
    const markedHabit = formData.get("markedHabit")
    // await MarkedHabit.deleteOne({
    //   date: { $lt: new Date(markedDate) },
    //   habit: habitId,
    // })
    await MarkedHabit.deleteOne({
      _id: markedHabit,
    })
    return {}
  }

  //TODO: check it isn't that same habits being added to the same day
  // const sameMarkedHabit = await MarkedHabit.findOne({
  //   date: { $lt: new Date(markedDate) },
  //   habit: habitId,
  // })

  // if (sameMarkedHabit) {
  //   return {
  //     errors: {
  //       message: "You cannot mark the same habit for the same day",
  //     },
  //   }
  // }

  const newMarkedHabit = new MarkedHabit({
    user: new mongoose.Types.ObjectId(userId),
    habit: new mongoose.Types.ObjectId(habitId),
    date: new Date(markedDate),
  })

  await newMarkedHabit.save()
  return {}
}

export default function DashboardDate() {
  const { loaderDate, habits, markedHabits } = useLoaderData<LoaderData>()
  const actionData = useActionData<ActionData>()
  const date = new Date(loaderDate)
  const navigate = useNavigate()
  const transition = useTransition()
  const isLoading =
    transition.state === "loading" || transition.state === "submitting"

  const closeModal = () => {
    navigate("..")
  }

  return (
    <Modal
      isOpen={true}
      onRequestClose={closeModal}
      closeTimeoutMS={500}
      contentLabel={date.toDateString()}
      style={{
        overlay: {
          backgroundColor: undefined,
        },
        content: {
          backgroundColor: undefined,
          inset: undefined,
        },
      }}
    >
      <div className="modal-body">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl">{date.toDateString()}</h2>
          <button
            className="p-2 rounded-sm hover:scale-110 hover:opacity-100 opacity-70 transition-all text-xl"
            onClick={closeModal}
            title="Close"
          >
            &times;
          </button>
        </div>
        {habits.length > 0 ? (
          <>
            <div className="flex flex-col gap-2">
              {markedHabits.map(({ habit }: any) => (
                <Link
                  key={habit._id}
                  to={`/habits/${habit._id}`}
                  title={`${habit.name} - Colour: ${habit.colour}`}
                >
                  {habit.name}
                  <div
                    className="h-6 w-6 ml-2 inline-block border-2 border-slate-900 align-middle"
                    style={{ backgroundColor: habit.colour }}
                  ></div>
                </Link>
              ))}
            </div>
            <Form method="post">
              <small className="block text-danger p-2">
                {actionData && actionData.errors?.message}&nbsp;
              </small>
              <select
                name="selectedHabit"
                id="selectedHabit"
                className="block mb-2 bg-neutral-600 p-2 rounded-sm cursor-pointer text-neutral-50"
                required
              >
                <option selected disabled hidden>
                  Select a habit
                </option>
                {habits.map((habit: any) => (
                  <option
                    key={habit._id.toString()}
                    value={habit._id.toString()}
                  >
                    {habit.name}
                  </option>
                ))}
              </select>

              <input
                type={"hidden"}
                name="markedDate"
                id="markedDate"
                value={date.toISOString()}
              />
              <button
                className="btn text-neutral-50 bg-neutral-600 hover:bg-neutral-700 focus:bg-neutral-700"
                type="submit"
              >
                {isLoading ? (
                  <span className="flex gap-2">
                    Marking...{" "}
                    <LoadingIndicator className="spinner static h-6 w-6" />
                  </span>
                ) : (
                  "Mark"
                )}
              </button>
            </Form>
          </>
        ) : (
          <>
            <p className="text-red-500">You don't have any habits to add. </p>
            <Link to={"/habits/new"}>Create One</Link>
          </>
        )}
      </div>
    </Modal>
  )
}
