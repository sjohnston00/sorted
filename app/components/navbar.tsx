import React from "react";
import { Link, useMatches } from "remix";

export default function Navbar() {
  const [{ data }] = useMatches();

  return (
    <nav className='bg-slate-800 nav'>
      <ul className='flex sm:flex-col md:flex-col lg:flex-col p-2'>
        <li>
          <Link to={"/"}>Home</Link>
        </li>
        <li>
          <Link to={"/habits"}>Habits</Link>
        </li>
        <li>
          <Link to={"/dashboard"}>Dashboard</Link>
        </li>

        {data.user ? (
          <li>
            <span>{data.user.username}</span>
            <form action='/logout' method='post' className='inline'>
              <button className='btn ml-2 text-black'>Logout</button>
            </form>
          </li>
        ) : (
          <>
            <li>
              <Link to={"/login"}>Login</Link>
            </li>
            <li>
              <Link to={"/register"}>Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
