import { useEffect, useState } from "react";
import {
  ActionFunction,
  Form,
  Link,
  LoaderFunction,
  MetaFunction,
  Outlet,
  ScrollRestoration,
  useActionData,
  useCatch,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigate,
  useOutlet,
  useTransition
} from "remix";
import CalendarComponent from "~/components/calendar";
import { requireUserId } from "~/utils/session.server";
import { getHabitsForUser } from "~/utils/habits.server";
import { getMarkedHabitsForUser } from "~/utils/markedHabits.server";
import useIsMount from "~/utils/hooks/useIsMount";
import { MarkedHabitWithHabit } from "~/types/markedHabit.server";
import CustomCalendar from "~/components/customCalendar";
import { AnimatePresence, motion } from "framer-motion";
import Modal from "~/components/modal";
import LoadingIndicator from "~/components/LoadingIndicator";
import { HiOutlineX, HiPlus } from "react-icons/hi";
import { Habit, HabitWithId } from "~/types/habits.server";

type LoaderData = {
  dates: Array<MarkedHabitWithHabit>;
};

type ActionData = {
  errors?: {
    message?: string;
    habit?: string;
    markedDate?: string;
  };
};

type FetcherData = {
  habits: Array<HabitWithId>;
  markedHabits: Array<MarkedHabitWithHabit>;
};

export const meta: MetaFunction = () => {
  return {
    title: `Sorted | Dashboard`
  };
};

export const loader: LoaderFunction = async ({
  request
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);
  const dates = await getMarkedHabitsForUser(
    userId,
    new Date(0),
    new Date(2100, 0)
  );

  return {
    dates: dates
  };
};

export const action: ActionFunction = async ({ request }) => {
  //await 3 seconds
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return {};
};

export default function Dashboard() {
  const { dates } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const [modalOpen, setModalOpen] = useState(false);
  const isMount = useIsMount();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const fetcher = useFetcher<FetcherData>();
  const transition = useTransition();
  const fetcherIsLoading = fetcher.state === "loading";
  const transitionIsSubmitting = transition.state === "submitting";
  const handleClose = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    if (isMount) return;
    setModalOpen(true);
    // fetcher.load(`/dashboard/${selectedDate.toISOString().split("T")[0]}`);
    fetcher.load(`/dashboard/${selectedDate.getTime()}`);
  }, [selectedDate]);

  return (
    <>
      <CustomCalendar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        markedHabits={dates}
      />
      <Outlet />
      <AnimatePresence
        exitBeforeEnter
        initial={false}
        onExitComplete={() => null}>
        {modalOpen && (
          <Modal handleClose={handleClose}>
            <div className='modal-body'>
              <div className='flex justify-between items-center'>
                <h2 className='text-2xl'>{selectedDate.toDateString()}</h2>
                <button
                  className='p-2 rounded-sm hover:scale-110 hover:opacity-100 opacity-70 transition-all text-xl'
                  onClick={handleClose}
                  title='Close'>
                  &times;
                </button>
              </div>
              {fetcherIsLoading ? (
                <LoadingIndicator className='spinner static h-6 w-6' />
              ) : (
                <>
                  {fetcher.data?.habits.length || 0 > 0 ? (
                    <>
                      <div className='flex flex-col gap-2'>
                        {fetcher.data?.markedHabits.map((markedHabit) => (
                          <div className='flex gap-2 items-center'>
                            <Link
                              key={markedHabit.habit._id}
                              to={`/habits/${markedHabit.habit._id}`}
                              title={`${markedHabit.habit.name} - Colour: ${markedHabit.habit.colour}`}>
                              {markedHabit.habit.name}
                              <div
                                className='h-6 w-6 ml-2 inline-block border-2 border-slate-900 align-middle'
                                style={{
                                  backgroundColor: markedHabit.habit.colour
                                }}></div>
                            </Link>
                            <Form method='delete' className='flex items-center'>
                              <input
                                type={"hidden"}
                                name='markedHabitId'
                                id='markedHabitId'
                                value={markedHabit._id}
                              />
                              <button type='submit' className='p-1'>
                                <HiOutlineX className='hover:scale-125 transition-all opacity-70 hover:opacity-100' />
                              </button>
                            </Form>
                          </div>
                        ))}
                      </div>
                      <Form method='post'>
                        <small className='block text-danger p-2'>
                          {actionData && actionData.errors?.message}&nbsp;
                        </small>
                        <select
                          name='selectedHabit'
                          id='selectedHabit'
                          className='block mb-2 bg-neutral-600 p-2 rounded-sm cursor-pointer text-neutral-50'
                          required>
                          <option defaultValue={undefined} disabled hidden>
                            Select a habit
                          </option>
                          {fetcher.data?.habits.map((habit) => (
                            <option key={habit._id} value={habit._id}>
                              {habit.name}
                            </option>
                          ))}
                        </select>

                        <input
                          type={"hidden"}
                          name='markedDate'
                          id='markedDate'
                          value={selectedDate.toISOString()}
                        />
                        <button
                          className='btn flex gap-1 text-neutral-50 transition-all bg-neutral-600 hover:bg-neutral-700 focus:bg-neutral-700'
                          type='submit'
                          disabled={transitionIsSubmitting}>
                          Mark
                          {transitionIsSubmitting ? (
                            <LoadingIndicator className='spinner static h-6 w-6' />
                          ) : null}
                        </button>
                      </Form>
                    </>
                  ) : (
                    <>
                      <p className='py-2 text-red-500'>
                        You don't have any habits to add.{" "}
                      </p>
                      <Link
                        to={"/habits/new"}
                        className='btn btn-primary inline-flex gap-2 items-center'>
                        Create One <HiPlus />
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>
      {/* </div>
      <button onClick={() => onChange(new Date())} className="btn btn-primary">
        Today
      </button> */}
    </>
  );
}
