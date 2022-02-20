import React from "react";
import Habit from "~/models/Habit.server";
import { Link, LoaderFunction, Outlet, redirect, useLoaderData } from "remix";
import { requireUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const habits = await Habit.find({ user: userId }).populate("user");
  return habits;
};

export default function Index() {
  const data = useLoaderData();
  return (
    <>
      <h1 className='text-3xl'>Habits</h1>
      <ul>
        {data.length > 0 ? (
          data.map((habit: any) => (
            <li key={habit._id} className='hover:underline cursor-pointer mb-2'>
              <Link to={habit._id} title={`${habit.name}`}>
                {habit.name}
              </Link>
              <div
                className='h-6 w-6 ml-2 inline-block border-2 border-slate-900 align-middle'
                style={{ backgroundColor: habit.colour }}
                title={`Colour: ${habit.colour}`}></div>
            </li>
          ))
        ) : (
          <p className='text-red-500'>
            You don't have any habits.{" "}
            <Link
              to={"/habits/new"}
              className='text-blue-300 hover:text-blue-400'>
              Create One
            </Link>
          </p>
        )}
      </ul>
      <Outlet />
    </>
  );
}
