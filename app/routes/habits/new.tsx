import React from "react";
import { LoaderFunction, ActionFunction, Form, Link, redirect } from "remix";
import Habit from "~/models/Habit.server";
import { requireUserId } from "~/utils/session.server";
import mongoose, { ObjectId } from "mongoose";

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const name = formData.get("name");
  const colour = formData.get("colour");

  const newHabit = new Habit({
    name: name,
    colour: colour,
    user: new mongoose.Types.ObjectId(userId)
  });

  await newHabit.save();
  return redirect("/habits");
};

export default function Index() {
  return (
    <Form method='post' className='m-1'>
      <div className='mb-2'>
        <label htmlFor='name' className='mr-2'>
          Name
        </label>
        <input type='text' name='name' id='name' className='p-2' required />
      </div>
      <div className='mb-2'>
        <label htmlFor='colour' className='mr-2'>
          Colour
        </label>
        <input type='color' name='colour' id='colour' />
      </div>
      <button
        type='submit'
        className='bg-green-300 hover:bg-green-400 border-2 border-slate-500 p-2 rounded-sm '>
        Create
      </button>
      <Link
        to={"/habits"}
        className='text-blue-400 hover:text-blue-500 hover:underline ml-2'>
        Back
      </Link>
    </Form>
  );
}
