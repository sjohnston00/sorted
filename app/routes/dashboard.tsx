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
import {
  MarkedHabitWithHabit,
  MarkedHabitWithId
} from "~/types/markedHabit.server";
import CustomCalendar from "~/components/customCalendar";
import { AnimatePresence, motion, Variants } from "framer-motion";
import Modal from "~/components/modal";
import LoadingIndicator from "~/components/LoadingIndicator";
import { HiOutlineX, HiPlus } from "react-icons/hi";
import { Habit, HabitWithId } from "~/types/habits.server";
import MarkedHabit from "~/models/MarkedHabit.server";
import mongoose from "mongoose";

type LoaderData = {
  markedHabits: Array<MarkedHabitWithHabit>;
  habits: Array<HabitWithId>;
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
  const markedHabits = await getMarkedHabitsForUser(
    userId,
    new Date(0),
    new Date(2100, 0)
  );
  const habits = await getHabitsForUser(userId);

  return {
    markedHabits: markedHabits,
    habits: habits
  };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  if (request.method === "DELETE") {
    const markedHabitId = formData.get("markedHabitId");
    console.log(markedHabitId);
    console.log(userId);
    if (typeof markedHabitId !== "string") {
      return {};
    }
    await MarkedHabit.deleteOne({
      _id: markedHabitId,
      user: userId
    });
    return {};
  }
  const habitId = formData.get("selectedHabit");
  const selectedDate = formData.get("selectedDate");
  if (typeof habitId !== "string" || typeof selectedDate !== "string") {
    return {
      errors: {
        message: "Please provide a valid Habit",
        markedDate: "Please provide a valid Date"
      }
    };
  }

  const newMarkedHabit = new MarkedHabit({
    user: new mongoose.Types.ObjectId(userId),
    habit: new mongoose.Types.ObjectId(habitId),
    date: new Date(selectedDate)
  });

  await newMarkedHabit.save();
  return {};
};

export default function Dashboard() {
  const { markedHabits, habits } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const [modalOpen, setModalOpen] = useState(false);
  const isMount = useIsMount();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateMarkedHabits, setSelectedDateMarkedHabits] = useState<
    Array<MarkedHabitWithHabit>
  >([]);
  const transition = useTransition();
  const transitionIsSubmitting = transition.submission?.method === "POST";
  const handleClose = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    if (isMount) return;
    setModalOpen(true);
    const nextDate = new Date(
      new Date(selectedDate).setDate(selectedDate.getDate() + 1)
    );
    const selectedMarkedHabits = markedHabits.filter((markedHabit) => {
      const markedHabitDate = new Date(markedHabit.date);
      return markedHabitDate >= selectedDate && markedHabitDate < nextDate;
    });
    setSelectedDateMarkedHabits(selectedMarkedHabits);
  }, [selectedDate, markedHabits]);

  return (
    <>
      <CustomCalendar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        markedHabits={markedHabits}
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
              {habits.length || 0 > 0 ? (
                <>
                  <div className='flex flex-col gap-2'>
                    {selectedDateMarkedHabits.map((markedHabit) => (
                      <ModalMarkedHabit markedHabit={markedHabit} />
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
                      {habits.map((habit) => (
                        <option key={habit._id} value={habit._id}>
                          {habit.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type={"hidden"}
                      name='selectedDate'
                      id='selectedDate'
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
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
function ModalMarkedHabit({
  markedHabit
}: {
  markedHabit: MarkedHabitWithHabit;
}) {
  const fetcher = useFetcher();
  return (
    <div
      className={`flex gap-2 items-center ${
        fetcher.submission?.formData.get("markedHabitId") === markedHabit._id
          ? "opacity-30"
          : ""
      } transition-all`}>
      <Link
        className='flex items-center text-reset'
        key={markedHabit.habit._id}
        to={`/habits/${markedHabit.habit._id}`}
        title={`${markedHabit.habit.name} - Colour: ${markedHabit.habit.colour}`}>
        {markedHabit.habit.name}
        <div
          className='h-6 w-6 ml-2 inline-block shadow-sm rounded-full align-middle'
          style={{
            backgroundColor: markedHabit.habit.colour
          }}></div>
      </Link>
      <fetcher.Form method='delete' className='flex items-center'>
        <input
          type={"hidden"}
          name='markedHabitId'
          id='markedHabitId'
          value={markedHabit._id}
        />
        <button type='submit' className='p-1'>
          <HiOutlineX className='hover:scale-125 transition-all opacity-70 hover:opacity-100' />
        </button>
      </fetcher.Form>
    </div>
  );
}
