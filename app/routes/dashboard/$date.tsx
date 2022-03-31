import React, { useEffect, useLayoutEffect } from "react"
import { HiOutlineX, HiPlus } from "react-icons/hi"
import {
  ActionFunction,
  Form,
  Link,
  LoaderFunction,
  MetaFunction,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
  useTransition,
} from "remix"
// import Modal from "react-modal"
import Modal from "~/components/modal"
import { requireUserId } from "~/utils/session.server"
import { getMarkedHabitsForUser } from "~/utils/markedHabits.server"
import { getHabitsForUser } from "~/utils/habits.server"
import MarkedHabit from "~/models/MarkedHabit.server"
import mongoose from "mongoose"
import LoadingIndicator from "~/components/LoadingIndicator"
import { MarkedHabitWithHabit } from "~/types/markedHabit.server"
import { Habit } from "~/types/habits.server"

type LoaderData = {
  habits: Array<Habit>
  markedHabits: Array<MarkedHabitWithHabit>
}

type ActionData = {
  errors?: {
    message?: string
    habit?: string
    markedDate?: string
  }
}

export const meta: MetaFunction = ({ data }) => {
  const date = new Date(data.loaderDate)
  return {
    title: `Sorted | Dashboard | ${date.toLocaleDateString()}`,
  }
}

export const loader: LoaderFunction = async ({
  request,
  params,
}): Promise<LoaderData> => {
  const userId = await requireUserId(request)
  if (typeof params.date !== "string") {
    throw redirect("/dashboard")
  }
  const date = new Date(params.date)
  const nextDate = new Date(new Date().setDate(date.getDate() + 1))
  nextDate.setHours(0, 0, 0, 0)
  const markedHabits = await getMarkedHabitsForUser(userId, date, nextDate)
  const habits = await getHabitsForUser(userId)

  return {
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

  if (request.method === "DELETE") {
    const markedHabitId = formData.get("markedHabitId")
    if (typeof markedHabitId !== "string") {
      return {}
    }
    await MarkedHabit.deleteOne({
      _id: markedHabitId,
      user: userId,
    })
    return {}
  }
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

  const newMarkedHabit = new MarkedHabit({
    user: new mongoose.Types.ObjectId(userId),
    habit: new mongoose.Types.ObjectId(habitId),
    date: new Date(markedDate),
  })

  await newMarkedHabit.save()
  return {}
}

export default function DashboardDate() {
  const { habits, markedHabits } = useLoaderData<LoaderData>()
  const actionData = useActionData<ActionData>()
  const params = useParams()
  const date = new Date(params.date || "")
  const navigate = useNavigate()
  const transition = useTransition()
  const handleClose = () => navigate("..")
  const isLoading =
    transition.state === "loading" || transition.state === "submitting"

  const closeModal = () => {
    navigate("..")
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.style.overflow = "hidden"
    }

    return () => {
      if (typeof window !== "undefined") {
        document.body.style.overflow = "auto"
      }
    }
  }, [])

  return (
    // <Modal
    //   isOpen={true}
    //   onRequestClose={closeModal}
    //   closeTimeoutMS={500}
    //   contentLabel={date.toDateString()}
    //   style={{
    //     overlay: {
    //       backgroundColor: undefined,
    //     },
    //     content: {
    //       backgroundColor: undefined,
    //       inset: undefined,
    //     },
    //   }}
    // >
    <Modal handleClose={handleClose}>
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
              {markedHabits.map((markedHabit) => (
                <div className="flex gap-2 items-center">
                  <Link
                    key={markedHabit.habit._id}
                    to={`/habits/${markedHabit.habit._id}`}
                    title={`${markedHabit.habit.name} - Colour: ${markedHabit.habit.colour}`}
                  >
                    {markedHabit.habit.name}
                    <div
                      className="h-6 w-6 ml-2 inline-block border-2 border-slate-900 align-middle"
                      style={{ backgroundColor: markedHabit.habit.colour }}
                    ></div>
                  </Link>
                  <Form method="delete" className="flex items-center">
                    <input
                      type={"hidden"}
                      name="markedHabitId"
                      id="markedHabitId"
                      value={markedHabit._id}
                    />
                    <button type="submit" className="p-1">
                      <HiOutlineX className="hover:scale-125 transition-all opacity-70 hover:opacity-100" />
                    </button>
                  </Form>
                </div>
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
            <p className="py-2 text-red-500">
              You don't have any habits to add.{" "}
            </p>
            <Link
              to={"/habits/new"}
              className="btn btn-primary inline-flex gap-2 items-center"
            >
              Create One <HiPlus />
            </Link>
          </>
        )}
      </div>
    </Modal>
  )
}
