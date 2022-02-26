import { useState } from "react";
import { Link } from "remix";
import Modal from "~/components/modal";

export default function Index() {
  const [modal, setModal] = useState(true);
  const handleShowModal = () => {
    setModal((prev) => !prev);
  };
  return (
    <main>
      <h1 className='text-2xl'>
        Welcome to <span className='text-3xl italic'>"Sorted"</span>
      </h1>
      <Link
        to={"/habits"}
        className='text-blue-400 hover:text-blue-500 hover:underline'>
        My Habits
      </Link>
      <button onClick={handleShowModal}>Toggle Modal</button>
      <Modal open={modal} setOpen={setModal} />
    </main>
  );
}
