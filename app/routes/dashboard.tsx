import React from "react";
import { ActionFunction, Form, LoaderFunction, useLoaderData } from "remix";
import { Habit as HabitType } from "types/habits.server";
import Habit from "~/models/Habit.server";
import { requireUserId } from "~/utils/session.server";

type LoaderData = {
  habits: Array<HabitType>;
  dates: any;
};

export const loader: LoaderFunction = async ({
  request
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);
  const habits = await Habit.find({ user: userId });
  return {
    habits: habits,
    dates: [
      {
        date: "2021-12-12",
        habit: "Test",
        user: "123,12312312312"
      }
    ]
  };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const habitId = formData.get("selectedHabit");
  const markedDate = formData.get("markedDate");
  return {
    habitId,
    markedDate
  };
};

export default function Index() {
  const { dates, habits } = useLoaderData<LoaderData>();
  const minDate = new Date().toISOString().split("T")[0];
  return (
    <div className='flex md:flex-row sm:flex-col gap-2'>
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
                <option key={habit._id} value={habit._id}>
                  {habit.name}
                </option>
              ))}
            </select>
            <label htmlFor='markedDate'>Date</label>
            <input
              type='date'
              name='markedDate'
              id='markedDate'
              className='block mb-2 bg-slate-50 p-2 cursor-pointer'
              min={minDate}
              defaultValue={minDate}
              required
            />
            <button className='btn block' type='submit'>
              Mark
            </button>
          </Form>
        ) : (
          <p className='text-red-500'>You don't have any habits to add</p>
        )}
      </div>
      <div className='right flex-1'>
        {dates &&
          dates.map((markedDate: any) => (
            <p key={markedDate._id}>
              {new Date(markedDate.date).toLocaleDateString()} -{" "}
              {markedDate.habit}
            </p>
          ))}
      </div>
    </div>
  );
}
