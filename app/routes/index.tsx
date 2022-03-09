import { useState } from "react";
import { ActionFunction, Form, Link } from "remix";
import Modal from "react-modal";

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
      <button className='btn' onClick={handleShowModal}>
        Open modal
      </button>
      <Modal
        isOpen={modal}
        onRequestClose={handleShowModal}
        contentLabel={"Hello"}
        style={{
          content: {
            left: 0,
            right: 0,
            bottom: 0
          },
          overlay: {
            backgroundColor: "#00000015"
          }
        }}>
        <button
          className='p-2 border-2 border-neutral-900 rounded-md'
          onClick={handleShowModal}>
          &times;
        </button>
        <div className='text-neutral-900'>
          <p>This is a paragraph</p>
          <p>This is a paragraph</p>
          <p>This is a paragraph</p>
          <p>This is a paragraph</p>
        </div>
      </Modal>
    </main>
  );
}
