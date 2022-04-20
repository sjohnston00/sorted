import React from "react"
import { Link, LoaderFunction, NavLink, useLoaderData, useMatches } from "remix"

export default function Navbar() {
  const [{ data }] = useMatches()

  const a = { textDecoration: "underline" }
  return (
    <nav className="nav">
      <ul className="flex items-center justify-between flex-row py-2 gap-2 container m-auto">
        <div className="flex gap-2 items-center">
          <li>
            <img src="/icons/icon.png" height={24} width={24} />
          </li>
          <li>
            <NavLink
              to="habits"
              className={({ isActive }) => (isActive ? "underline" : "")}
            >
              Habits
            </NavLink>
          </li>
          <li>
            <NavLink to={"/dashboard"}>Dashboard</NavLink>
          </li>
        </div>
        <div className="flex gap-2 items-center">
          {data?.user ? (
            <li className="flex gap-2 items-center">
              <img
                src={data?.gravatarUrl}
                width={24}
                height={24}
                className="rounded-full"
              />
              <NavLink to={"/profile"}>{data?.user?.username}</NavLink>
              <form action="/logout" method="post" className="inline">
                <button className="btn btn-primary ml-2">Logout</button>
              </form>
            </li>
          ) : (
            <>
              <li>
                <NavLink to={"/login"}>Login</NavLink>
              </li>
              <li>
                <NavLink
                  to={"/register"}
                  className="btn btn-primary hover:no-underline"
                >
                  Register
                </NavLink>
              </li>
            </>
          )}
        </div>
      </ul>
    </nav>
  )
}
