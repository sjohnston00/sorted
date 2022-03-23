import { useEffect, useState } from "react"
import {
  ActionFunction,
  Form,
  Link,
  LoaderFunction,
  Outlet,
  useCatch,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "remix"
import CalendarComponent from "~/components/calendar"
import Modal from "react-modal"
import { requireUserId } from "~/utils/session.server"
import { getHabitsForUser } from "~/utils/habits.server"
import { getMarkedHabitsForUser } from "~/utils/markedHabits.server"
import MarkedHabit from "~/models/MarkedHabit.server"
import mongoose from "mongoose"
import LoadingIndicator from "~/components/LoadingIndicator"
import useIsMount from "~/utils/hooks/useIsMount"

type LoaderData = {
  habits: any
  dates: any
  userId: string
}

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  const userId = await requireUserId(request)
  const habits = await getHabitsForUser(userId)
  const dates = await getMarkedHabitsForUser(
    userId,
    new Date(0),
    new Date(2100, 0)
  )

  return {
    habits: habits,
    dates: dates,
    userId: userId,
  }
}

export default function Dashboard() {
  const fetcher = useFetcher()
  const isMount = useIsMount()
  const { dates, habits, userId } = useLoaderData<LoaderData>()
  const navigate = useNavigate()
  const [value, onChange] = useState(new Date())
  useEffect(() => {
    if (isMount) {
      //means its th first render
      return
    }
    navigate(`${value.toISOString().split("T")[0]}`)
  }, [value])

  return (
    <div className="flex md:flex-row sm:flex-col gap-2">
      <CalendarComponent
        markedHabits={dates}
        value={value}
        onChange={(newValue) => {
          onChange(newValue)
          return
        }}
      />
      <Outlet />
    </div>
  )
}
export function CatchBoundary() {
  const error = useCatch()
  console.error(error)
  return <p>Something went wrong</p>
}
export function ErrorBoundary({ error }: any) {
  console.error(error)
  return <p>Something went wrong</p>
}
