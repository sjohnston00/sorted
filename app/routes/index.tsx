import { useState } from "react";
import { ActionFunction, Form, Link } from "remix";
import Modal from "~/components/modal";

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
  const [modal, setModal] = useState(false);
  const [focusedHabit, setFocusedHabit] = useState<
    { _id: string; name: string; colour: string } | {}
  >({});
  const handleShowModal = () => {
    setModal((prev) => !prev);
  };
  const handleShowHabitModal = (habit: { name: string; colour: string }) => {
    setFocusedHabit(habit);
    handleShowModal();
  };
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
      <ul>
        {mockHabits.map((habit) => (
          <li key={habit.name} onClick={() => handleShowHabitModal(habit)}>
            {habit.name}{" "}
            <div
              className='h-8 cursor-pointer'
              style={{ backgroundColor: habit.colour }}
            />
          </li>
        ))}
      </ul>
      <Modal open={modal} setOpen={setModal}>
        <Form method='post'>
          <div className='form-groug mb-2'>
            <label htmlFor='name' className='block'>
              Name
            </label>
            <input
              className='rounded-sm border-2 border-stone-100 bg-transparent p-2 w-full'
              type='text'
              placeholder='Name'
              defaultValue={focusedHabit.name}
              required
              autoComplete='off'
              id='name'
              name='name'
            />
          </div>
          <div className='form-groug mb-2'>
            <label htmlFor='name' className='block'>
              Colour
            </label>
            <input
              className='rounded-sm border-2 border-stone-100 bg-transparent h-10 p-1 w-full'
              type='color'
              defaultValue={focusedHabit?.colour}
              id='colour'
              name='colour'
              required
            />
            <input
              type='hidden'
              value={focusedHabit?._id}
              id='_id'
              name='_id'
              required
            />
          </div>
          <div className='flex gap-4 justify-center items-center mt-4'>
            <button
              className='btn bg-fuchsia-400 hover:bg-fuchsia-500'
              onClick={handleShowModal}>
              Close
            </button>
            <button
              className='btn bg-neutral-900 hover:bg-neutral-900'
              type='submit'>
              Update
            </button>
          </div>
        </Form>
      </Modal>
    </main>
  );
}
