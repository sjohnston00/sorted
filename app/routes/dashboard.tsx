import { useEffect, useState } from "react"
import {
  LoaderFunction,
  MetaFunction,
  Outlet,
  useCatch,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigate,
  useOutlet,
} from "remix"
import CalendarComponent from "~/components/calendar"
import { requireUserId } from "~/utils/session.server"
import { getHabitsForUser } from "~/utils/habits.server"
import { getMarkedHabitsForUser } from "~/utils/markedHabits.server"
import useIsMount from "~/utils/hooks/useIsMount"
import { MarkedHabitWithHabit } from "~/types/markedHabit.server"
import CustomCalendar from "~/components/customCalendar"
import { AnimatePresence, motion } from "framer-motion"

type LoaderData = {
  dates: Array<MarkedHabitWithHabit>
}

export const meta: MetaFunction = () => {
  return {
    title: `Sorted | Dashboard`,
  }
}

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  const userId = await requireUserId(request)
  const dates = await getMarkedHabitsForUser(
    userId,
    new Date(0),
    new Date(2100, 0)
  )

  return {
    dates: dates,
  }
}

export default function Dashboard() {
  const { dates } = useLoaderData<LoaderData>()
  const outlet = useOutlet()

  return (
    <>
      <CustomCalendar markedHabits={dates} />
      <AnimatePresence key={useLocation().key} exitBeforeEnter initial={true}>
        {outlet}
      </AnimatePresence>
      {/* </div>
      <button onClick={() => onChange(new Date())} className="btn btn-primary">
        Today
      </button> */}
    </>
  )
}
