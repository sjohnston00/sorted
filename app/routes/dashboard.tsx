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
  const minDate = new Date().toISOString().split("T")[0];
  const [value, onChange] = useState(new Date());
  return (
    <div className='flex md:flex-row sm:flex-col gap-2'>
      <CalendarComponent
        markedHabits={dates}
        value={value}
        onChange={onChange}
      />
      <div className='left flex-1'>
        <h1 className='text-4xl mb-2'>Dashboard</h1>
        {habits.length > 0 ? (
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
            {/* <label htmlFor='markedDate'>Date</label> */}
            {/* <input
              type='date'
              name='markedDate'
              id='markedDate'
              className='block mb-2 bg-slate-50 p-2 cursor-pointer'
              min={minDate}
              defaultValue={minDate}
              required
            /> */}
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
        )}
      </div>
      {/* <div className='right flex-1'>
        <h1 className='text-4xl mb-2'>Marked Dates</h1>
        {dates &&
          dates.map((markedDate: any) => (
            <>
              <p key={markedDate._id}>
                {new Date(markedDate.date).toLocaleDateString()} -{" "}
                {markedDate.habit.name}
              </p>
              <div
                className='h-6 w-6 ml-2 inline-block border-2 border-slate-900 align-middle'
                style={{ backgroundColor: markedDate.habit.colour }}
                title={`Colour: ${markedDate.habit.colour}`}></div>
            </>
          ))}
      </div> */}
    </div>
  );
}
