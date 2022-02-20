import React from "react";
import Habit from "~/models/Habit.server";
import { Link, LoaderFunction, Outlet, useLoaderData } from "remix";

export default function Index() {
  return (
    <Link
      to={"./new"}
      className='text-blue-400 hover:text-blue-500 hover:underline '>
      New
    </Link>
  );
}
