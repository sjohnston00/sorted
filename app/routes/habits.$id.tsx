import React from "react";
import Habit from "~/models/Habit.server";
import {
  ActionFunction,
  Form,
  Link,
  LoaderFunction,
  redirect,
  useLoaderData
} from "remix";
import MarkedHabit from "~/models/MarkedHabit.server";

export const loader: LoaderFunction = async ({ params }) => {
  const habit = await Habit.findById(params.id);
  if (!habit) {
    return redirect("/habits", {
      status: 404
    });
  }
  return habit;
};

export const action: ActionFunction = async ({ request, params }) => {
  const { id } = params;
  if (request.method === "DELETE") {
    const deletedHabit = await Habit.deleteOne({ _id: id });
    const deletedMarkedHabits = await MarkedHabit.deleteMany({ habit: id });

    return redirect("/habits");
  }

  if (request.method === "PUT") {
    const formData = await request.formData();
    const name = formData.get("name");
    const colour = formData.get("colour");

    if (typeof name !== "string" || typeof colour !== "string") {
      return {
        errors: {
          name: "Please provide a valid name",
          colour: "Please provide a valid colour"
        }
      };
    }
    const updated = await Habit.updateOne(
      { _id: id },
      {
        $set: {
          name: name,
          colour: colour
        }
      }
    );

    return redirect(`/habits/${id}`);
  }

  return {};
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
      <Form method='delete'>
        <button
          type='submit'
          className='btn mb-2 bg-red-600 hover:bg-red-700 shadow-sm text-white'>
          Delete
        </button>
      </Form>
      <Form method='put' className='m-1'>
        <div className='mb-2'>
          <label htmlFor='name' className='mr-2 block'>
            Name
          </label>
          <input
            type='text'
            name='name'
            id='name'
            className='p-2 bg-slate-50'
            defaultValue={habit.name}
            required
          />
        </div>
        <div className='mb-2'>
          <label htmlFor='colour' className='mr-2'>
            Colour
          </label>
          <input
            type='color'
            name='colour'
            id='colour'
            defaultValue={habit.colour}
          />
        </div>
        <button
          type='submit'
          className='bg-teal-300 hover:bg-teal-400 border-2 border-slate-500 p-2 rounded-sm '>
          Update
        </button>
      </Form>
      <Link
        to={"/habits"}
        className='text-blue-400 hover:text-blue-500 hover:underline'>
        Back
      </Link>
    </div>
  );
}
