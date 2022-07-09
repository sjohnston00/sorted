import React, { useEffect, useState } from "react"
import {
  ActionFunction,
  Link,
  LoaderFunction,
  MetaFunction,
  Outlet,
  redirect,
  useFetcher,
  useLoaderData,
  useMatches,
  useSearchParams,
} from "remix"
import { requireUserId } from "~/utils/session.server"
import { getHabitsForUser } from "~/utils/habits.server"
import {
  getMarkedHabitsForFriend,
  getMarkedHabitsForUser,
} from "~/utils/markedHabits.server"
import useIsMount from "~/utils/hooks/useIsMount"
import CustomCalendar from "~/components/customCalendar"
import { AnimatePresence } from "framer-motion"
import Modal from "~/components/modal"
import { HiPlus } from "react-icons/hi"
import MarkedHabit from "~/models/MarkedHabit.server"
import mongoose from "mongoose"
import { User } from "~/types/user.server"
import { getUserDetails } from "~/utils/user.server"
import Habit from "~/models/Habit.server"
import { Habit as HabitType } from "~/types/habits.server"
import { MongoDocument } from "~/types"
import { MarkedHabit as MarkedHabitType } from "~/types/markedHabit.server"

type LoaderData = {
  markedHabits: MongoDocument<MarkedHabitType>[]
  habits: MongoDocument<HabitType>[]
}

// type ActionData = {
//   errors?: {
//     message?: string
//     habit?: string
//     markedDate?: string
//   }
// }

export const meta: MetaFunction = () => {
  return {
    title: `Sorted | Dashboard`,
  }
}

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData | Response> => {
  const userId = await requireUserId(request)
  const user = await getUserDetails(userId)
  const url = new URL(request.url)
  const friendId = url.searchParams.get("friend")
  let isFriend = false
  if (friendId) {
    isFriend = user?.friends.some((friend) => friend._id === friendId) || false
    if (!isFriend) {
      return redirect("/dashboard")
    }
    const markedHabits = await getMarkedHabitsForFriend(
      friendId,
      new Date(0),
      new Date(2100, 0)
    )
    return {
      markedHabits,
      habits: [],
    }
  }
  const markedHabits = await getMarkedHabitsForUser(
    userId,
    new Date(0),
    new Date(2100, 0)
  )
  const habits = await getHabitsForUser(userId)

  return {
    markedHabits: markedHabits,
    habits: habits,
  }
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  if (data._action === "mark-habit") {
    const { habitId, selectedDate } = data
    if (typeof habitId !== "string" || typeof selectedDate !== "string") {
      return {
        errors: {
          message: "Please provide a valid Habit",
          markedDate: "Please provide a valid Date",
        },
      }
    }

    const habit = await Habit.findById(habitId)
    if (!habit) {
      return {
        errors: {
          message: "Please provide a valid Habit",
        },
      }
    }

    const newMarkedHabit = new MarkedHabit({
      user: new mongoose.Types.ObjectId(userId),
      habit: new mongoose.Types.ObjectId(habitId),
      date: new Date(selectedDate),
      visibility: habit.visibility,
    })

    await newMarkedHabit.save()
    return {}
  }

  if (data._action === "unmark-habit") {
    const markedHabitId = formData.get("markedHabitId")
    console.log(markedHabitId)
    console.log(userId)
    if (typeof markedHabitId !== "string") {
      return {}
    }
    await MarkedHabit.deleteOne({
      _id: markedHabitId,
      user: userId,
    })
    return {}
  }
  return {}
}

export default function Dashboard() {
  const [{ data }] = useMatches()
  const { user } = data
  const { markedHabits, habits } = useLoaderData<LoaderData>()
  const [searchParams] = useSearchParams()
  const friendId = searchParams.get("friend")
  const [modalOpen, setModalOpen] = useState(false)
  const isMount = useIsMount()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedDateMarkedHabits, setSelectedDateMarkedHabits] = useState<
    MongoDocument<MarkedHabitType>[]
  >([])
  const handleClose = () => {
    setModalOpen(false)
  }

  useEffect(() => {
    if (isMount) return
    setModalOpen(true)
    const nextDate = new Date(
      new Date(selectedDate).setDate(selectedDate.getDate() + 1)
    )
    const selectedMarkedHabits = markedHabits.filter((markedHabit) => {
      const markedHabitDate = new Date(markedHabit.date)
      return markedHabitDate >= selectedDate && markedHabitDate < nextDate
    })
    setSelectedDateMarkedHabits(selectedMarkedHabits)
  }, [selectedDate, markedHabits])

  return (
    <>
      <div className="flex gap-2 p-2 overflow-auto">
        {/* If the user is looking at anther users habits, then give a button to go back */}
        {friendId ? (
          <Link
            to={`/dashboard`}
            className="flex flex-col gap-1 dark:text-neutral-50 text-neutral-800 hover:dark:text-neutral-50 hover:text-neutral-800 hover:no-underline"
          >
            <img
              className="rounded-full outline outline-green-400 outline-offset-1"
              src={user?.gravatarURL}
              width={48}
              height={48}
            />
            {user.username}
          </Link>
        ) : null}
        {user.friends.map((friend: User & { _id: string }) => (
          <Link
            to={`/dashboard?friend=${friend._id}`}
            key={`friend=${friend._id}`}
            className="flex flex-col gap-1 dark:text-neutral-50 text-neutral-800 hover:dark:text-neutral-50 hover:text-neutral-800 hover:no-underline"
          >
            <img
              src={friend.gravatarURL}
              className="rounded-full outline outline-green-400 outline-offset-1"
              width={48}
              height={48}
            />
            {friend.username}
          </Link>
        ))}
      </div>
      <CustomCalendar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        markedHabits={markedHabits}
      />
      <Outlet />
      <AnimatePresence
        exitBeforeEnter
        initial={false}
        onExitComplete={() => null}
      >
        {modalOpen && (
          <Modal handleClose={handleClose}>
            <div className="modal-body">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-medium tracking-wide">
                  {selectedDate.toDateString()}
                </h2>
                <button
                  className="p-2 rounded-sm hover:scale-110 hover:opacity-100 opacity-70 transition-all text-xl"
                  onClick={handleClose}
                  title="Close"
                >
                  &times;
                </button>
              </div>
              {habits.length || 0 > 0 ? (
                <>
                  <div className="flex flex-col gap-2">
                    {selectedDateMarkedHabits.length > 0 ? (
                      <>
                        <h2>Marked</h2>
                        {selectedDateMarkedHabits.map((markedHabit) => (
                          <ModalMarkedHabit
                            key={markedHabit._id}
                            markedHabit={markedHabit}
                          />
                        ))}
                      </>
                    ) : null}
                  </div>
                  <h2 className="text-2xl font-medium tracking-wide">
                    My Habits
                  </h2>
                  {habits.map((habit, index) => (
                    <ModalHabit
                      key={`${habit._id}-modal-habit-${index}`}
                      selectedDate={selectedDate}
                      habit={habit}
                    />
                  ))}
                  {/* <Form method="post">
                    <small className="block text-danger p-2">
                      {actionData && actionData.errors?.message}&nbsp;
                    </small>
                    <select
                      name="selectedHabit"
                      id="selectedHabit"
                      className="block mb-2 bg-neutral-600 p-2 rounded-sm cursor-pointer text-neutral-50"
                      required
                    >
                      <option defaultValue={undefined} disabled hidden>
                        Select a habit
                      </option>
                      {habits.map((habit) => (
                        <option key={habit._id} value={habit._id}>
                          {habit.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type={"hidden"}
                      name="selectedDate"
                      id="selectedDate"
                      value={selectedDate.toISOString()}
                    />
                    <button
                      className="btn flex gap-1 text-neutral-50 transition-all bg-neutral-600 hover:bg-neutral-700 focus:bg-neutral-700"
                      type="submit"
                      disabled={transitionIsSubmitting}
                    >
                      Mark
                      {transitionIsSubmitting ? (
                        <LoadingIndicator className="spinner static h-6 w-6" />
                      ) : null}
                    </button>
                  </Form> */}
                </>
              ) : (
                <>
                  <p className="py-2 text-red-500">
                    You do not have any habits to add
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
        )}
      </AnimatePresence>
    </>
  )
}
function ModalMarkedHabit({
  markedHabit,
}: {
  markedHabit: MongoDocument<MarkedHabitType>
}) {
  const fetcher = useFetcher()
  return (
    <fetcher.Form
      method="post"
      onClick={(e) => {
        confirm(
          `Are you sure you want to remove ${markedHabit.habit.name} for this day?`
        )
          ? true
          : e.preventDefault()
      }}
      className="flex items-center"
    >
      <button
        className={`p-1 h-40 w-40 bg-opacity-20 border-4 border-solid rounded-lg flex items-center justify-center font-bold tracking-wide ${
          fetcher.submission?.formData.get("markedHabitId") === markedHabit._id
            ? "opacity-30"
            : ""
        } transition-all`}
        style={{
          backgroundColor: `${markedHabit.habit.colour}20`,
          borderColor: markedHabit.habit.colour,
          color: markedHabit.habit.colour,
        }}
      >
        {markedHabit.habit.name}
        <input
          type={"hidden"}
          name="markedHabitId"
          id="markedHabitId"
          value={markedHabit._id}
        />
        <input
          type={"hidden"}
          name="_action"
          id="_action"
          value={"unmark-habit"}
        />
        {/* <button type="submit" className="p-1">
          <HiOutlineX className="hover:scale-125 transition-all opacity-70 hover:opacity-100" />
        </button> */}
      </button>
    </fetcher.Form>
  )
}

type ModalHabitProps = {
  habit: MongoDocument<HabitType>
  selectedDate: Date
}

function ModalHabit({ habit, selectedDate }: ModalHabitProps) {
  const fetcher = useFetcher()
  return (
    <fetcher.Form method="post" className="flex items-center">
      <button
        className={`p-1 h-40 w-40 bg-opacity-20 border-4 border-solid rounded-lg flex items-center justify-center font-bold tracking-wide ${
          fetcher.submission?.formData.get("habitId") === habit._id
            ? "opacity-30"
            : ""
        } transition-all`}
        style={{
          backgroundColor: `${habit.colour}20`,
          borderColor: habit.colour,
          color: habit.colour,
        }}
      >
        {habit.name}
        <input type={"hidden"} name="habitId" id="habitId" value={habit._id} />
        <input
          type={"hidden"}
          name="selectedDate"
          id="selectedDate"
          value={selectedDate.toISOString()}
        />
        <input type="hidden" name="_action" id="_action" value="mark-habit" />
        {/* <button type="submit" className="p-1">
      <HiOutlineX className="hover:scale-125 transition-all opacity-70 hover:opacity-100" />
    </button> */}
      </button>
    </fetcher.Form>
  )
}
