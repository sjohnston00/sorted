import { useState } from "react";
import { ActionFunction, Form, Link } from "remix";

const mockHabits = [
  {
    _id: "sldkfjsf203dfkj234",
    name: "Habit 1",
    colour: "#4512AB"
  },
  {
    _id: "sldkfjsf203dfkj235",
    name: "Habit 2",
    colour: "#a512AB"
  },
  {
    _id: "sldkfjsf203dfkj236",
    name: "Habit 3",
    colour: "#9512AB"
  },
  {
    _id: "sldkfjsf203dfkj237",
    name: "Habit 4",
    colour: "#a912AB"
  },
  {
    _id: "sldkfjsf203dfkj238",
    name: "Habit 5",
    colour: "#aaa5FF"
  }
];

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const _id = formData.get("_id");
  const habitName = formData.get("name");
  const colour = formData.get("colour");

  return {
    _id,
    habitName,
    colour
  };
};

export default function Index() {
  return (
    <main className='container mx-2'>
      <h1 className='text-2xl'>
        Welcome to <span className='text-3xl italic'>"Sorted"</span>
      </h1>
      <Link
        to={"/habits"}
        className='text-blue-400 hover:text-blue-500 hover:underline'>
        My Habits
      </Link>
      <br />
    </main>
  );
}
