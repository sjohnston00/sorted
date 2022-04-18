import React from "react";
import { Link, LoaderFunction, useLoaderData, useMatches } from "remix";

export default function Navbar() {
  const [{ data }] = useMatches();

  return (
    <nav className='nav'>
      <ul className='flex items-center justify-between flex-row py-2 gap-2 container m-auto'>
        <div className='flex gap-2'>
          <li>
            <Link to={"/habits"}>Habits</Link>
          </li>
          <li>
            <Link to={"/dashboard"}>Dashboard</Link>
          </li>
        </div>
        <div className='flex gap-2 '>
          {data?.user ? (
            <li className='flex gap-2 items-center'>
              <img src={data?.gravatarUrl} width={24} height={24} />
              <Link to={"/profile"}>{data?.user?.username}</Link>
              <form action='/logout' method='post' className='inline'>
                <button className='btn btn-primary ml-2'>Logout</button>
              </form>
            </li>
          ) : (
            <>
              <li>
                <Link to={"/login"}>Login</Link>
              </li>
              <li>
                <Link
                  to={"/register"}
                  className='btn btn-primary hover:no-underline'>
                  Register
                </Link>
              </li>
            </>
          )}
        </div>
      </ul>
    </nav>
  );
}
