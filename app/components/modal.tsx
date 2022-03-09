import React, { useEffect } from "react";
import { Form, useFetcher } from "remix";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  title?: string;
};

export default function Modal({ open, setOpen, children, title }: Props) {
  const handleShowModal = () => {
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        handleShowModal();
      }
    });
  }, []);

  //TODO: Add an on click handler to the modal overlay, so a user can click outside the modal to close it
  return (
    <div className={`modal ${open ? "show" : ""}`}>
      <div className='modal-body'>
        <div className='flex justify-between items-center'>
          <h2 className='text-2xl font-bold -tracking-wide mb-2'>{title}</h2>
          <button
            className='text-2xl hover:scale-125 opacity-60 hover:opacity-100 transition-all p-2'
            onClick={handleShowModal}
            aria-label='close button'>
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
