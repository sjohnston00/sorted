import React from "react"
import {
  ActionFunction,
  Form,
  Link,
  LoaderFunction,
  useLoaderData,
  useNavigate,
} from "remix"
import Modal from "react-modal"
import { requireUserId } from "~/utils/session.server"
import { getMarkedHabitsForUser } from "~/utils/markedHabits.server"
import { getHabitsForUser } from "~/utils/habits.server"
import MarkedHabit from "~/models/MarkedHabit.server"
import mongoose from "mongoose"

type LoaderData = {
  loaderDate: string
  habits: Array<any>
  markedHabits: Array<any>
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

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request)
  const formData = await request.formData()
  const habitId = formData.get("selectedHabit")
  const markedDate = formData.get("markedDate")

  if (typeof habitId !== "string" || typeof markedDate !== "string") {
    return {
      errors: {
        habitId: "Please provide a valid Habit",
        markedDate: "Please provide a valid Date",
      },
    }
  }

  if (request.method === "DELETE") {
    //TODO: Delete the marked habit from the date
    await MarkedHabit.deleteOne({
      date: { $lt: new Date(markedDate) },
      habit: habitId,
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
  const date = new Date(loaderDate)

  const navigate = useNavigate()

  const closeModal = () => {
    navigate("..")
  }

  return (
    <Modal
      isOpen={true}
      onRequestClose={closeModal}
      closeTimeoutMS={500}
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
      <div className="flex justify-end">
        <button
          className="p-2 rounded-sm hover:scale-110 hover:opacity-100 opacity-70 transition-all text-xl text-neutral-50"
          onClick={closeModal}
          title="Close"
        >
          &times;
        </button>
      </div>
      {habits.length > 0 ? (
        <>
          {markedHabits.map(({ habit }: any) => (
            <p key={habit._id} className="hover:underline cursor-pointer mb-2">
              <Link to={`/habits/${habit._id}`} title={`${habit.name}`}>
                {habit.name}
              </Link>
              <div
                className="h-6 w-6 ml-2 inline-block border-2 border-slate-900 align-middle"
                style={{ backgroundColor: habit.colour }}
                title={`Colour: ${habit.colour}`}
              ></div>
            </p>
          ))}
          <Form method="post">
            <select
              name="selectedHabit"
              id="selectedHabit"
              className="block my-2 bg-neutral-600 p-2 rounded-sm cursor-pointer text-neutral-50"
              required
            >
              <option selected disabled hidden>
                Select a habit
              </option>
              {habits.map((habit: any) => (
                <option key={habit._id.toString()} value={habit._id.toString()}>
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
              Mark
            </button>
          </Form>
        </>
      ) : (
        <>
          <p className="text-red-500">
            You don't have any habits to add.{" "}
            <Link
              to={"/habits/new"}
              className="text-blue-300 hover:text-blue-400"
            >
              Create One
            </Link>
          </p>
        </>
      )}
    </Modal>
  )
}
