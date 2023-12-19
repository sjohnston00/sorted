import React, { useEffect, useRef, useState, Fragment } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  parseISO,
  startOfToday,
  startOfWeek,
  subMonths,
} from "date-fns";
import { classNames } from "~/utils";
import { twMerge } from "tailwind-merge";
import { AutoSizer, List } from "react-virtualized";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import Button from "./Button";
import { AnimatePresence, motion } from "framer-motion";
import { useFetcher, useFetchers } from "@remix-run/react";
import MarkedHabitRow from "./Calendar/MarkedHabitRow";
import HabitButton from "./Calendar/HabitButton";
import { SerializeFrom } from "@remix-run/node";
import { Habit, MarkedHabit } from "@prisma/client";
import { Dialog, Transition } from "@headlessui/react";
import Input, { Textarea } from "./Input";

type ScrollingCalendarProps = {
  indicators?: any[];
  monthsPrevious?: number;
  monthsNext?: number;
  markedHabits: SerializeFrom<(MarkedHabit & { habit: Habit })[]>;
  habits: SerializeFrom<Habit[]>;
  isLoadingFriendsHabits: boolean;
  startWeekMonday?: boolean;
};

export default function ScrollingCalendar({
  indicators,
  monthsPrevious = 5,
  monthsNext = 2,
  habits,
  isLoadingFriendsHabits,
  markedHabits,
  startWeekMonday,
}: ScrollingCalendarProps) {
  const fetchers = useFetchers();
  const [focusedMarkedHabit, setFocusedMarkedHabit] = useState<SerializeFrom<
    MarkedHabit & { habit: Habit }
  > | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const fetcher = useFetcher();

  function closeModal() {
    setIsOpen(false);
  }
  function openModal() {
    setIsOpen(true);
  }

  const today = startOfToday();
  const currentMonth = format(today, "MMM-yyyy");
  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());
  const previousMonths: Date[] = [];
  const [selectedDay, setSelectedDay] = useState(today);
  const calendarRef = useRef<HTMLDivElement>(null);

  for (let index = monthsPrevious; index > 0; index--) {
    previousMonths.push(subMonths(firstDayCurrentMonth, index));
  }

  const nextMonths: Date[] = [];
  for (let index = 0; index < monthsNext; index++) {
    nextMonths.push(addMonths(firstDayCurrentMonth, index + 1));
  }

  const monhts = [...previousMonths, firstDayCurrentMonth, ...nextMonths];

  const selectedDayMarkedHabits = markedHabits.filter((m) =>
    isSameDay(new Date(m.date), selectedDay)
  );

  let colStartClasses = [
    "",
    "col-start-2",
    "col-start-3",
    "col-start-4",
    "col-start-5",
    "col-start-6",
    "col-start-7",
  ];
  return (
    <>
      <div className="md:grid md:grid-cols-2">
        <div className="md:pr-14 mb-8 md:mb-2">
          <div>
            <MonthScrollingButtons
              monthsPrevious={monthsPrevious}
              calendarRef={calendarRef}
            />
            <div
              id="carousel"
              className="flex gap-8 overflow-x-auto snap-x snap-mandatory [-webkit-overflow-scrolling:touch] scroll-smooth"
              ref={calendarRef}
            >
              {monhts.map((month, i) => {
                const days = eachDayOfInterval({
                  start: startOfWeek(month, {
                    weekStartsOn: 1,
                  }),
                  end: endOfWeek(endOfMonth(month), {
                    weekStartsOn: 1,
                  }),
                });
                const monthIndicators = indicators?.filter((m) =>
                  isSameMonth(parseISO(m.date), month)
                );
                return (
                  // TODO: Get `react-virtualized` working
                  // https://github.com/bvaughn/react-virtualized/issues/1632
                  // Maybe try using <Grid/> instead of <List/> for horizontal scrolling as suggested in
                  //
                  // https://stackoverflow.com/questions/46177344/react-virtualized-table-x-scrolling
                  //
                  //
                  // <ReactVirtualizedScrollingCalendar indicators={indicators} monthsNext={monthsNext} monthsPrevious={monthsPrevious}/>
                  <div
                    key={month.getTime()}
                    className="[scroll-snap-align:start] snap-always min-w-full min-h-full"
                  >
                    <span className="text-xl font-bold ml-2">
                      {format(month, "MMMM yyyy")}
                    </span>
                    <div className="grid grid-cols-7 mt-10 text-xs leading-6 text-center text-gray-500">
                      <div>M</div>
                      <div>T</div>
                      <div>W</div>
                      <div>T</div>
                      <div>F</div>
                      <div>S</div>
                      <div>S</div>
                    </div>
                    <div className="grid grid-cols-7 mt-2 text-sm">
                      {days.map((day, dayIdx) => {
                        const dayIndicators = monthIndicators
                          ?.filter((m) => isSameDay(parseISO(m.date), day))
                          .slice(0, 3);
                        return (
                          <div
                            key={day.toString()}
                            className={classNames(
                              dayIdx === 0 && colStartClasses[getDay(day) - 1],
                              "py-1.5"
                            )}
                          >
                            <button
                              type="submit"
                              name="date"
                              value={format(day, "yyyy-MM-dd")}
                              className={twMerge(
                                "mx-auto flex h-8 w-8 items-center justify-center rounded-full",
                                isEqual(day, selectedDay) && "text-white",
                                !isEqual(day, selectedDay) &&
                                  isToday(day) &&
                                  "text-red-500",
                                !isEqual(day, selectedDay) &&
                                  !isToday(day) &&
                                  isSameMonth(day, month) &&
                                  "text-gray-900 dark:text-gray-300",
                                !isEqual(day, selectedDay) &&
                                  !isToday(day) &&
                                  !isSameMonth(day, month) &&
                                  "text-gray-400",
                                isEqual(day, selectedDay) &&
                                  isToday(day) &&
                                  "bg-red-500",
                                isEqual(day, selectedDay) &&
                                  !isToday(day) &&
                                  "bg-gray-900",
                                !isEqual(day, selectedDay) &&
                                  "hover:bg-gray-200 dark:hover:bg-gray-700",
                                (isEqual(day, selectedDay) || isToday(day)) &&
                                  "font-semibold"
                              )}
                              onClick={() => {
                                setSelectedDay(day);
                              }}
                            >
                              <time dateTime={format(day, "yyyy-MM-dd")}>
                                {format(day, "d")}
                              </time>
                            </button>
                            <div className="flex h-1 w-fit gap-px mx-auto mt-1">
                              {dayIndicators?.map((m) => (
                                <div
                                  key={`calendar-${m.id}`}
                                  className="w-1 h-1 rounded-full"
                                  style={{
                                    backgroundColor: m.habit.colour,
                                  }}
                                ></div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="p-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-200">
          <div className="min-h-[10rem]">
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
                        f.formData?.get("_action")?.toString() === "mark-date"
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
                              <TrashIcon className="h-4 w-4" />
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

type MonthScrollingButtonsProps = {
  monthsPrevious: number;
  calendarRef: React.RefObject<HTMLDivElement>;
};

function MonthScrollingButtons({
  monthsPrevious,
  calendarRef,
}: MonthScrollingButtonsProps) {
  // Scroll by 1 page in the given direction (-1 or +1).
  // This uses the width of the carousel minus the padding and gap between items.
  // Use behavior: 'smooth' and the browser will animate the scrolling.
  //Initial render should scroll to the current month, every other button press should use the scrollBy
  const scroll = (dir: number, behavior: ScrollBehavior = "smooth") => {
    if (typeof window === "undefined") return;
    if (!calendarRef.current) return;

    const style = window.getComputedStyle(calendarRef.current);
    const left =
      dir *
      (calendarRef.current.clientWidth -
        parseInt(style.paddingLeft, 10) -
        parseInt(style.paddingRight, 10) +
        parseInt(style.columnGap, 10));
    calendarRef.current.scrollBy({
      left,
      behavior,
    });
  };

  const instantScroll = (
    page: number,
    behavior: ScrollBehavior = "instant"
  ) => {
    if (typeof window === "undefined") return;
    if (!calendarRef.current) return;

    const style = window.getComputedStyle(calendarRef.current);
    const left =
      page *
      (calendarRef.current.clientWidth -
        parseInt(style.paddingLeft, 10) -
        parseInt(style.paddingRight, 10) +
        parseInt(style.columnGap, 10));
    calendarRef.current.scrollTo({
      left,
      behavior,
    });
  };

  const [isPrevDisabled, setPrevDisabled] = useState(true);
  const [isNextDisabled, setNextDisabled] = useState(false);

  // Use the scroll position to determine if we are at the start or end of the carousel.
  // This controls whether the previous and next buttons are enabled.
  useEffect(() => {
    if (typeof window === "undefined") return;
    //On initial render, scroll to the currentMonth
    instantScroll(monthsPrevious);

    const update = () => {
      if (!calendarRef.current) return;
      setPrevDisabled(calendarRef.current.scrollLeft <= 0);
      setNextDisabled(
        calendarRef.current.scrollLeft >=
          calendarRef.current.scrollWidth - calendarRef.current.clientWidth
      );
    };

    update();

    // Use the scrollend event if supported for better perf, with fallback to regular scroll.
    if ("onscrollend" in document) {
      calendarRef.current?.addEventListener("scrollend", update);
      return () =>
        calendarRef.current?.removeEventListener("scrollend", update);
    } else {
      calendarRef.current?.addEventListener("scroll", update);
      return () => calendarRef.current?.removeEventListener("scroll", update);
    }
  }, []);

  return (
    <div className="flex gap-2 justify-end">
      {/* TODO: Show a back to today button if the current scrolled position isnt the current month */}
      <Button
        className="btn-ghost"
        aria-label="Previous Page"
        disabled={isPrevDisabled}
        onClick={() => scroll(-1)}
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </Button>
      <Button
        className="btn-ghost"
        aria-label="Next Page"
        disabled={isNextDisabled}
        onClick={() => scroll(1)}
      >
        <ChevronRightIcon className="w-5 h-5" />
      </Button>
    </div>
  );
}

// function ReactVirtualizedScrollingCalendar({
//   indicators,
//   monthsNext = 5,
//   monthsPrevious = 2,
// }: ScrollingCalendarProps) {
//   //   const { markedHabits } = useLoaderData<typeof loader>();
//   const today = startOfToday();
//   const currentMonth = format(today, "MMM-yyyy");
//   const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());
//   const previousMonths: Date[] = [];
//   const [selectedDay, setSelectedDay] = useState(today);

//   for (let index = monthsPrevious; index > 0; index--) {
//     previousMonths.push(subMonths(firstDayCurrentMonth, index));
//   }

//   const nextMonths: Date[] = [];
//   for (let index = 0; index < monthsNext; index++) {
//     nextMonths.push(addMonths(firstDayCurrentMonth, index + 1));
//   }

//   const monhts = [...previousMonths, firstDayCurrentMonth, ...nextMonths];

//   let colStartClasses = [
//     "",
//     "col-start-2",
//     "col-start-3",
//     "col-start-4",
//     "col-start-5",
//     "col-start-6",
//     "col-start-7",
//   ];
//   return (
//     <AutoSizer>
//       {({ height, width }) => (
//         <List
//           height={height}
//           rowCount={monhts.length}
//           width={width}
//           rowHeight={300}
//           className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-4 mb-20 [-webkit-overflow-scrolling:touch] scroll-smooth"
//           rowRenderer={({ key, index, style }) => {
//             const month = monhts[index];
//             const days = eachDayOfInterval({
//               start: startOfWeek(month, {
//                 weekStartsOn: 1,
//               }),
//               end: endOfWeek(endOfMonth(month), {
//                 weekStartsOn: 1,
//               }),
//             });
//             return (
//               <div key={key} style={style}>
//                 <div className="[scroll-snap-align:start] snap-always min-w-full min-h-full">
//                   <span className="text-xl font-bold ml-2">
//                     {format(month, "MMMM yyyy")}
//                   </span>
//                   <div className="grid grid-cols-7 mt-10 text-xs leading-6 text-center text-gray-500">
//                     <div>M</div>
//                     <div>T</div>
//                     <div>W</div>
//                     <div>T</div>
//                     <div>F</div>
//                     <div>S</div>
//                     <div>S</div>
//                   </div>
//                   <div className="grid grid-cols-7 mt-2 text-sm">
//                     {days.map((day, dayIdx) => (
//                       <div
//                         key={day.toString()}
//                         className={classNames(
//                           dayIdx === 0 && colStartClasses[getDay(day) - 1],
//                           "py-1.5"
//                         )}
//                       >
//                         <button
//                           type="submit"
//                           name="date"
//                           value={format(day, "yyyy-MM-dd")}
//                           className={twMerge(
//                             "mx-auto flex h-8 w-8 items-center justify-center rounded-full",
//                             isEqual(day, selectedDay) && "text-white",
//                             !isEqual(day, selectedDay) &&
//                               isToday(day) &&
//                               "text-red-500",
//                             !isEqual(day, selectedDay) &&
//                               !isToday(day) &&
//                               isSameMonth(day, firstDayCurrentMonth) &&
//                               "text-gray-900 dark:text-gray-300",
//                             !isEqual(day, selectedDay) &&
//                               !isToday(day) &&
//                               !isSameMonth(day, firstDayCurrentMonth) &&
//                               "text-gray-400",
//                             isEqual(day, selectedDay) &&
//                               isToday(day) &&
//                               "bg-red-500",
//                             isEqual(day, selectedDay) &&
//                               !isToday(day) &&
//                               "bg-gray-900",
//                             !isEqual(day, selectedDay) &&
//                               "hover:bg-gray-200 dark:hover:bg-gray-700",
//                             (isEqual(day, selectedDay) || isToday(day)) &&
//                               "font-semibold"
//                           )}
//                           onClick={() => {
//                             setSelectedDay(day);
//                           }}
//                         >
//                           <time dateTime={format(day, "yyyy-MM-dd")}>
//                             {format(day, "d")}
//                           </time>
//                         </button>
//                         <div className="flex h-1 w-fit gap-px mx-auto mt-1">
//                           {indicators
//                             ?.filter((m) => isSameDay(parseISO(m.date), day))
//                             .slice(0, 3)
//                             .map((m) => (
//                               <div
//                                 key={`calendar-${m.id}`}
//                                 className="w-1 h-1 rounded-full"
//                                 style={{
//                                   backgroundColor: m.habit.colour,
//                                 }}
//                               ></div>
//                             ))}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             );
//           }}
//         />
//       )}
//     </AutoSizer>
//   );
// }
