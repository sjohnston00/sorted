import React from "react";
import Habit from "~/models/Habit.server";
import { Link, LoaderFunction, redirect, useLoaderData } from "remix";

export const loader: LoaderFunction = async ({ params }) => {
  const habit = await Habit.findById(params.id);
  if (!habit) {
    return redirect("/habits", {
      status: 404
    });
  }
  return habit;
};

export default function Index() {
  const habit = useLoaderData();

  return (
    <div>
      <dl className='font-bold'>Name:</dl>
      <dd>{habit.name}</dd>
      <dl className='font-bold'>Colour:</dl>
      <div
        className='h-6 w-6 inline-block border-2 border-slate-900'
        style={{ backgroundColor: habit.colour }}></div>
      <br />
      <Link
        to={"/habits"}
        className='text-blue-400 hover:text-blue-500 hover:underline'>
        Back
      </Link>
    </div>
  );
}
