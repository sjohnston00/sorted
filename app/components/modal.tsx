import React from "react";
import { Form } from "remix";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Modal({ open, setOpen }: Props) {
  const handleShowModal = () => {
    setOpen((prev) => !prev);
  };
  const handleUpdateHabit = () => {
    alert("Function not implemented");
  };
  return (
    <div className={`modal ${open ? "show" : ""}`}>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold -tracking-wide mb-2'>Edit Habit</h2>
        <button
          className='text-2xl hover:scale-125 opacity-60 hover:opacity-100 transition-all p-2'
          onClick={handleShowModal}
          aria-label='close button'>
          &times;
        </button>
      </div>
      <Form method='post'>
        <div className='form-groug mb-2'>
          <label htmlFor='name' className='block'>
            Name
          </label>
          <input
            className='rounded-sm border-2 border-stone-100 bg-transparent p-2 w-full'
            type='text'
            placeholder='Name'
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
            placeholder='Name'
            id='name'
            name='name'
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
    </div>
  );
}
