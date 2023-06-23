import { useUser } from "@clerk/remix"
import {
  ActionArgs,
  type LoaderArgs,
  type V2_MetaFunction,
} from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  parseISO,
  startOfToday,
} from "date-fns"
import { useState } from "react"
import Chevron from "~/components/icons/Chevron"
import { prisma } from "~/db.server"
import { getUser } from "~/utils/auth"

export const loader = async (args: LoaderArgs) => {
  const { userId } = await getUser(args)

  const [markedHabits, habits] = await Promise.all([
    prisma.markedHabit.findMany({
      where: {
        userId,
      },
      include: {
        habit: true,
      },
    }),
    prisma.habit.findMany({
      where: {
        userId,
      },
    }),
  ])

  return { markedHabits, habits }
}

export const action = async (args: ActionArgs) => {
  const { userId } = await getUser(args)

  const formData = await args.request.formData()
  if (formData.get("_action") === "mark-date") {
    await prisma.markedHabit.create({
      data: {
        date: new Date(formData.get("date")?.toString()!),
        userId,
        habitId: formData.get("habitId")?.toString()!,
      },
    })
    return Object.fromEntries(formData)
  }

  await prisma.habit.create({
    data: {
      userId,
      name: "Test",
      colour: "#ffffff",
    },
  })

  return {}
}

export const meta: V2_MetaFunction = () => {
  return [{ title: "Remix App with Clerk" }]
}

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}

export default function Index() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { markedHabits, habits } = useLoaderData<typeof loader>()

  if (!isLoaded || !isSignedIn) {
    return null
  }

  let colStartClasses = [
    "",
    "col-start-2",
    "col-start-3",
    "col-start-4",
    "col-start-5",
    "col-start-6",
    "col-start-7",
  ]

  let today = startOfToday()
  let [selectedDay, setSelectedDay] = useState(today)
  let [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"))
  let firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date())

  let days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  })

  function previousMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  function nextMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 })
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"))
  }

  const selectedDayMarkedHabits = markedHabits.filter((m) =>
    isSameDay(new Date(m.date), selectedDay)
  )

  return (
    <div>
      <h1>Sorted</h1>
      <div className="pt-16">
        <div className="max-w-md px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6">
          <div className="md:grid md:grid-cols-2 md:divide-x md:divide-gray-200">
            <div className="md:pr-14">
              <div className="flex items-center">
                <h2 className="flex-auto font-semibold text-gray-900">
                  {format(firstDayCurrentMonth, "MMMM yyyy")}
                </h2>
                <button
                  type="button"
                  onClick={previousMonth}
                  className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Previous month</span>
                  <Chevron direction="left" />
                </button>
                <button
                  onClick={nextMonth}
                  type="button"
                  className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Next month</span>
                  <Chevron direction="right" />
                </button>
              </div>
              <div className="grid grid-cols-7 mt-10 text-xs leading-6 text-center text-gray-500">
                <div>S</div>
                <div>M</div>
                <div>T</div>
                <div>W</div>
                <div>T</div>
                <div>F</div>
                <div>S</div>
              </div>
              <div className="grid grid-cols-7 mt-2 text-sm">
                {days.map((day, dayIdx) => (
                  <div
                    key={day.toString()}
                    className={classNames(
                      dayIdx === 0 && colStartClasses[getDay(day)],
                      "py-1.5"
                    )}>
                    <button
                      type="submit"
                      name="date"
                      value={format(day, "yyyy-MM-dd")}
                      onClick={() => setSelectedDay(day)}
                      className={classNames(
                        isEqual(day, selectedDay) && "text-white",
                        !isEqual(day, selectedDay) &&
                          isToday(day) &&
                          "text-red-500",
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          isSameMonth(day, firstDayCurrentMonth) &&
                          "text-gray-900",
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          !isSameMonth(day, firstDayCurrentMonth) &&
                          "text-gray-400",
                        isEqual(day, selectedDay) &&
                          isToday(day) &&
                          "bg-red-500",
                        isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          "bg-gray-900",
                        !isEqual(day, selectedDay) && "hover:bg-gray-200",
                        (isEqual(day, selectedDay) || isToday(day)) &&
                          "font-semibold",
                        "mx-auto flex h-8 w-8 items-center justify-center rounded-full"
                      )}>
                      <time dateTime={format(day, "yyyy-MM-dd")}>
                        {format(day, "d")}
                      </time>
                    </button>
                    <div className="w-1 h-1 mx-auto mt-1">
                      {markedHabits.some((m) =>
                        isSameDay(parseISO(m.date), day)
                      ) && (
                        <div className="w-1 h-1 rounded-full bg-sky-500"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 ">
              <div className="min-h-[5rem]">
                {selectedDayMarkedHabits.length > 0 ? (
                  selectedDayMarkedHabits.map((s) => (
                    <div key={s.id} className="flex gap-2 items-center">
                      <span>{s.habit.name}</span>
                      <div
                        className="h-3 w-3 rounded-full shadow-sm"
                        style={{ backgroundColor: s.habit.colour }}></div>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400 block text-center">
                    No habits marked for this day
                  </span>
                )}
              </div>

              <hr />
              <div className="grid grid-cols-3 place-items-center mt-4">
                {habits.map((h) => (
                  <Form method="post" key={h.id}>
                    <input type="hidden" name="_action" value="mark-date" />
                    <input
                      type="hidden"
                      name="date"
                      value={format(selectedDay, "yyyy-MM-dd")}
                    />
                    <button
                      className="py-4 px-2 rounded shadow border-2 font-semibold text-lg tracking-wide uppercase"
                      style={
                        {
                          color: h.colour,
                          borderColor: h.colour,
                          backgroundColor: `${h.colour}20`,
                          "--tw-shadow-color": h.colour,
                        } as React.CSSProperties
                      }
                      type="submit"
                      name="habitId"
                      value={h.id}>
                      {h.name}
                    </button>
                  </Form>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
    </div>
  )
}
