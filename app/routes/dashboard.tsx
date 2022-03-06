import mongoose from "mongoose";
import React, { useState } from "react";
import {
  ActionFunction,
  Form,
  Link,
  LoaderFunction,
  useLoaderData
} from "remix";
import { Habit as HabitType } from "types/habits.server";
import CalendarComponent from "~/components/calendar";
import Modal from "~/components/modal";
import Habit from "~/models/Habit.server";
import MarkedHabit from "~/models/MarkedHabit.server";
import { requireUserId } from "~/utils/session.server";

type LoaderData = {
  habits: Array<
    mongoose.Document<unknown, any, HabitType> &
      HabitType & {
        _id: mongoose.Types.ObjectId;
      }
  >;
  dates: any;
};

export const loader: LoaderFunction = async ({
  request
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);
  const habits = await Habit.find({ user: userId }).sort({ name: 1 });
  const dates = await MarkedHabit.find({ user: userId })
    .populate("habit")
    .sort({ date: 1 });
  return {
    habits: habits,
    dates: dates
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

  const newMarkedHabit = new MarkedHabit({
    user: new mongoose.Types.ObjectId(userId),
    habit: new mongoose.Types.ObjectId(habitId),
    date: new Date(markedDate)
  });

  await newMarkedHabit.save();
  return {};
};

export default function Index() {
  const { dates, habits } = useLoaderData<LoaderData>();
  const [value, onChange] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
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
      {/* {habits.length > 0 ? (
          <Form method='post'>
            <label htmlFor='selectedHabit'>Habit</label>
            <select
              name='selectedHabit'
              id='selectedHabit'
              className='block mb-2 bg-slate-50 p-2 cursor-pointer'
              required>
              <option selected disabled hidden>
                Select a habit
              </option>
              {habits.map((habit) => (
                <option key={habit._id.toString()} value={habit._id.toString()}>
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
            <button className='btn block' type='submit'>
              Mark
            </button>
          </Form>
        ) : (
          <p className='text-red-500'>
            You don't have any habits to add.{" "}
            <Link
              to={"/habits/new"}
              className='text-blue-300 hover:text-blue-400'>
              Create One
            </Link>
          </p>
        )} */}

      {showModal && (
        <Modal
          open={showModal}
          setOpen={setShowModal}
          title={value.toDateString()}>
          {habits.length > 0 ? (
            <Form method='post'>
              <label htmlFor='selectedHabit'>Habit</label>
              <select
                name='selectedHabit'
                id='selectedHabit'
                className='block my-2 bg-neutral-600 p-2 rounded-sm cursor-pointer'
                required>
                <option selected disabled hidden>
                  Select a habit
                </option>
                {habits.map((habit) => (
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
                className='btn bg-neutral-700 hover:bg-neutral-900 focus:bg-neutral-900'
                type='submit'>
                Mark
              </button>
            </Form>
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
      )}
    </div>
  );
}
