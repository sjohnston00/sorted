import { Link } from "remix";

export default function Index() {
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
    </main>
  );
}
