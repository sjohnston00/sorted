import { Dialog, Transition } from "@headlessui/react";
import { Habit, MarkedHabit } from "@prisma/client";
import { SerializeFrom } from "@remix-run/node";
import { useFetcher, useFetchers, useSearchParams } from "@remix-run/react";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  parseISO,
  startOfToday,
  startOfWeek,
} from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Fragment, useState } from "react";
import { FORM_ACTIONS } from "~/utils/constants";
import Button from "../Button";
import Input, { Textarea } from "../Input";
import Chevron from "../icons/Chevron";
import Trash from "../icons/Trash";
import CalendarDays from "./CalendarDays";
import CalendarWeekHeader from "./CalendarWeekHeader";
import HabitButton from "./HabitButton";
import MarkedHabitRow from "./MarkedHabitRow";

type CalendarProps = {
  markedHabits: SerializeFrom<(MarkedHabit & { habit: Habit })[]>;
  habits: SerializeFrom<Habit[]>;
  isLoadingFriendsHabits: boolean;
  startWeekMonday?: boolean;
};

export default function Calendar({
  markedHabits,
  habits,
  startWeekMonday,
  isLoadingFriendsHabits,
}: CalendarProps) {
  const fetchers = useFetchers();
  const [searchParams, setSearchParams] = useSearchParams();

  let colStartClasses = [
    "",
    "col-start-2",
    "col-start-3",
    "col-start-4",
    "col-start-5",
    "col-start-6",
    "col-start-7",
  ];

  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"));
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());
  const [focusedMarkedHabit, setFocusedMarkedHabit] = useState<SerializeFrom<
    MarkedHabit & { habit: Habit }
  > | null>(null);
  // const [_markedHabits, set_markedHabits] = useState(markedHabits)

  const days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth, {
      weekStartsOn: startWeekMonday ? 1 : 0,
    }),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth), {
      weekStartsOn: startWeekMonday ? 1 : 0,
    }),
  });

  function previousMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  const selectedDayMarkedHabits = markedHabits.filter((m) =>
    isSameDay(new Date(m.date), selectedDay)
  );

  const monthIndicators = markedHabits.filter((m) =>
    isSameMonth(parseISO(m.date), currentMonth)
  );

  const [isOpen, setIsOpen] = useState(false);
  const fetcher = useFetcher();

  function closeModal() {
    setIsOpen(false);
  }
  function openModal() {
    setIsOpen(true);
  }
  return (
    <>
      <div className="md:grid md:grid-cols-2">
        <div className="md:pr-14 mb-8 md:mb-2">
          <div className="flex items-center">
            <h2 className="flex-auto font-semibold dark:text-gray-50 text-gray-900">
              {format(firstDayCurrentMonth, "MMMM yyyy")}
              <button
                onClick={() => {
                  setSearchParams(
                    (prevParams) => {
                      prevParams.set("d", format(today, "yyyy-MM-dd"));
                      return prevParams;
                    },
                    {
                      replace: true,
                      preventScrollReset: true,
                    }
                  );
                  setSelectedDay(today);
                  setCurrentMonth(format(today, "MMM-yyyy"));
                }}
                className={`ml-4 font-medium py-1 px-3 transition bg-sky-500 text-sm rounded-md shadow text-white active:scale-90 active:opacity-80 ${
                  !isToday(selectedDay) ||
                  !isSameMonth(firstDayCurrentMonth, selectedDay)
                    ? "opacity-100 scale-100"
                    : "scale-0 opacity-0"
                }`}
              >
                Today
              </button>
            </h2>

            <button
              type="button"
              onClick={previousMonth}
              className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Previous month</span>
              <Chevron direction="left" />
            </button>
            <button
              onClick={nextMonth}
              type="button"
              className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Next month</span>
              <Chevron direction="right" />
            </button>
          </div>
          <CalendarWeekHeader />
          <CalendarDays
            days={days}
            month={firstDayCurrentMonth}
            monthIndicators={monthIndicators}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
          />
        </div>
        <div className="p-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-200">
          <div className="min-h-40">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Marked Habits</h2>
              <span className="text-sm text-gray-400">
                {format(selectedDay, "dd/MM/yyyy")}
              </span>
            </div>
            <AnimatePresence initial={false}>
              {selectedDayMarkedHabits.length > 0 ? (
                <motion.div className="flex flex-col my-4">
                  {fetchers
                    .filter(
                      (f) =>
                        f.formData?.get("_action")?.toString() ===
                        FORM_ACTIONS.MARK_DATE
                    )
                    .map(
                      (
                        f //OPTIMISTIC UI for marked habits
                      ) => (
                        <div
                          className={`flex gap-2 py-2 group justify-between items-center transition rounded-xl px-4 hover:bg-gray-50 opacity-70`}
                          key={f.formData?.get("habitId")?.toString()}
                        >
                          <div className="flex gap-4 items-center">
                            <div
                              className="h-10 w-10 rounded-full shadow-sm"
                              style={{
                                backgroundColor: f.formData
                                  ?.get("habitColour")
                                  ?.toString(),
                              }}
                            ></div>
                            <div>
                              <p>{f.formData?.get("habitName")?.toString()}</p>
                              <p className="text-xs text-gray-500">
                                HH:mm
                                {/* {format(parseISO(markedHabit.createdAt), 'HH:mm')} */}
                              </p>
                            </div>
                          </div>
                          <div>
                            <button
                              type="submit"
                              className="py-2 pl-6 pr-2 text-red-300 md:opacity-0  hover:text-red-400  group-hover:opacity-100 transition"
                              disabled
                            >
                              <Trash />
                            </button>
                          </div>
                        </div>
                      )
                    )}
                  {selectedDayMarkedHabits.map((s) => (
                    <MarkedHabitRow
                      isLoadingFriendsHabits={isLoadingFriendsHabits}
                      key={s.id}
                      markedHabit={s}
                      closeModal={closeModal}
                      openModal={openModal}
                      setFocusedMarkedHabit={setFocusedMarkedHabit}
                    />
                  ))}
                </motion.div>
              ) : (
                <p className="text-gray-300 mt-4 block text-center">
                  No habits marked yet
                </p>
              )}
            </AnimatePresence>
          </div>

          <hr />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 place-items-center mt-4">
            {isLoadingFriendsHabits ? (
              <span className="col-span-3 text-gray-400">
                You are curretly viewing a friends habits
              </span>
            ) : (
              habits.map((h) => (
                <HabitButton habit={h} selectedDay={selectedDay} key={h.id} />
              ))
            )}
          </div>
        </div>
      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-box p-6 bg-base-100 align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6"
                  >
                    Edit Marked Habit
                  </Dialog.Title>
                  <fetcher.Form
                    method="put"
                    action={`/api/markedHabit/${focusedMarkedHabit?.id}`}
                  >
                    <input
                      type="hidden"
                      name="_action"
                      value="updateMarkedHabitTime"
                    />

                    <input
                      type="hidden"
                      name="markedHabitId"
                      value={focusedMarkedHabit?.id}
                    />
                    <Input
                      type="time"
                      label="Time"
                      divClassName="mt-2"
                      className="appearance-none"
                      name="newMarkedHabitTime"
                      id="newMarkedHabitTime"
                      defaultValue={
                        focusedMarkedHabit
                          ? format(parseISO(focusedMarkedHabit.date), "HH:mm")
                          : undefined
                      }
                    />
                    <Textarea
                      divClassName="mt-4"
                      label="Note"
                      placeholder="Optional.."
                      name="markedHabitNote"
                      id="markedHabitNote"
                      defaultValue={focusedMarkedHabit?.note!}
                    />

                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        type="button"
                        className="btn-error"
                        onClick={closeModal}
                      >
                        Cancel
                      </Button>

                      <Button
                        type="submit"
                        className="btn-primary"
                        onClick={closeModal}
                      >
                        Confirm
                      </Button>
                    </div>
                  </fetcher.Form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
