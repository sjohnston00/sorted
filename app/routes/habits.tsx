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
        {data.map((habit: any) => (
          <li
            key={habit._id}
            className='opacity-70 hover:opacity-100 cursor-pointer'>
            <Link to={habit._id}>
              {habit.name} - {habit.user.username}
            </Link>
            <div
              className='h-6 w-6 inline-block border-2 border-slate-900'
              style={{ backgroundColor: habit.colour }}></div>
          </li>
        ))}
      </ul>
      <Outlet />
    </>
  );
}
