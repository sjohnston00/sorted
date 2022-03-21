import { useEffect, useState } from "react";
import {
  ActionFunction,
  Form,
  Link,
  LoaderFunction,
  useCatch,
  useFetcher,
  useLoaderData
} from "remix";
import CalendarComponent from "~/components/calendar";
import Modal from "react-modal";
import { requireUserId } from "~/utils/session.server";
import { getHabitsForUser } from "~/utils/habits.server";
import { getMarkedHabitsForUser } from "~/utils/markedHabits.server";
import MarkedHabit from "~/models/MarkedHabit.server";
import mongoose from "mongoose";

type LoaderData = {
  habits: any;
  dates: any;
  userId: string;
};

export const loader: LoaderFunction = async ({
  request
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);
  const habits = await getHabitsForUser(userId);
  const dates = await getMarkedHabitsForUser(userId);

  return {
    habits: habits,
    dates: dates,
    userId: userId
  };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const habitId = formData.get("selectedHabit");
  const markedDate = formData.get("markedDate");

  if (typeof habitId !== "string" || typeof markedDate !== "string") {
    return {
      errors: {
        habitId: "Please provide a valid Habit",
        markedDate: "Please provide a valid Date"
      }
    };
  }

  if (request.method === "DELETE") {
    //TODO: Delete the marked habit from the date
    await MarkedHabit.deleteOne({
      date: { $lt: new Date(markedDate) },
      habit: habitId
    });
    return {};
  }

  //TODO: check it isn't that same habits being added to the same day
  const sameMarkedHabit = await MarkedHabit.findOne({
    date: { $lt: new Date(markedDate) },
    habit: habitId
  });

  if (sameMarkedHabit) {
    return {
      errors: {
        message: "You cannot mark the same habit for the same day"
      }
    };
  }

  const newMarkedHabit = new MarkedHabit({
    user: new mongoose.Types.ObjectId(userId),
    habit: new mongoose.Types.ObjectId(habitId),
    date: new Date(markedDate)
  });

  await newMarkedHabit.save();
  return {};
};

export default function Dashboard() {
  const fetcher = useFetcher();
  const { dates, habits, userId } = useLoaderData<LoaderData>();
  const [value, onChange] = useState(new Date());
  const [selectedDateHabits, setSelectedDateHabits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    const searchDate = value.toISOString().split("T")[0];
    fetcher.load(`/api/markedHabits/${userId}/${searchDate}`);

    return () => {
      setSelectedDateHabits([]);
    };
  }, [fetcher, userId, value]);

  const closeModal = () => setShowModal(false);

  return (
    <div className='flex md:flex-row sm:flex-col gap-2'>
      <CalendarComponent
        markedHabits={dates}
        value={value}
        onChange={(newValue) => {
          setShowModal(true);
          onChange(newValue);
          return;
        }}
      />
      <Modal
        isOpen={showModal}
        onRequestClose={closeModal}
        contentLabel={value.toDateString()}
        closeTimeoutMS={500}
        style={{
          overlay: {
            backgroundColor: undefined
          },
          content: {
            backgroundColor: undefined,
            inset: undefined
          }
        }}>
        <div className='flex justify-end'>
          <button
            className='p-2 rounded-sm hover:scale-110 hover:opacity-100 opacity-70 transition-all text-xl text-neutral-50'
            onClick={closeModal}
            title='Close'>
            &times;
          </button>
        </div>
        {habits.length > 0 ? (
          <>
            {fetcher.data ? (
              fetcher.data.map(({ habit }: any) => (
                <p
                  key={habit._id}
                  className='hover:underline cursor-pointer mb-2'>
                  <Link to={`/habits/${habit._id}`} title={`${habit.name}`}>
                    {habit.name}
                  </Link>
                  <div
                    className='h-6 w-6 ml-2 inline-block border-2 border-slate-900 align-middle'
                    style={{ backgroundColor: habit.colour }}
                    title={`Colour: ${habit.colour}`}></div>
                </p>
              ))
            ) : (
              <p>&nbsp;</p>
            )}
            <Form method='post'>
              <select
                name='selectedHabit'
                id='selectedHabit'
                className='block my-2 bg-neutral-600 p-2 rounded-sm cursor-pointer text-neutral-50'
                required>
                <option selected disabled hidden>
                  Select a habit
                </option>
                {habits.map((habit: any) => (
                  <option
                    key={habit._id.toString()}
                    value={habit._id.toString()}>
                    {habit.name}
                  </option>
                ))}
              </select>
              <input
                type={"hidden"}
                name='markedDate'
                id='markedDate'
                value={value.toISOString()}
              />
              <button
                className='btn text-neutral-50 bg-neutral-600 hover:bg-neutral-700 focus:bg-neutral-700'
                type='submit'>
                Mark
              </button>
            </Form>
          </>
        ) : (
          <p className='text-red-500'>
            You don't have any habits to add.{" "}
            <Link
              to={"/habits/new"}
              className='text-blue-300 hover:text-blue-400'>
              Create One
            </Link>
          </p>
        )}
      </Modal>
    </div>
  );
}
export function CatchBoundary() {
  const error = useCatch();
  console.error(error);
  return <p>Something went wrong</p>;
}
export function ErrorBoundary({ error }: any) {
  console.error(error);
  return <p>Something went wrong</p>;
}
