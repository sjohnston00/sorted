import React from "react"
import { Link, LoaderFunction, NavLink, useLoaderData, useMatches } from "remix"
import {
  HiCalendar,
  HiOutlineCalendar,
  HiUserCircle,
  HiOutlineUserCircle,
  HiClipboardList,
  HiOutlineClipboardList,
} from "react-icons/hi"

export default function Navbar() {
  const [{ data }] = useMatches()

  const a = { textDecoration: "underline" }
  return (
    <nav className="nav">
      <ul className="flex items-center justify-evenly gap-2 w-full">
        <li>
          <NavLink to="habits" title="Habits">
            {({ isActive }) =>
              isActive ? (
                <HiClipboardList size={"2em"} />
              ) : (
                <HiOutlineClipboardList size={"2em"} />
              )
            }
          </NavLink>
        </li>

        <li>
          <NavLink to={"/dashboard"} title="Calendar | Dashboard">
            {({ isActive }) =>
              isActive ? (
                <HiCalendar size={"2em"} />
              ) : (
                <HiOutlineCalendar size={"2em"} />
              )
            }
          </NavLink>
        </li>
        {/* <li>
          <img src="/icons/icon.png" height={36} width={36} />
        </li> */}
        <li className="flex gap-2 items-center">
          <NavLink to={"/profile"} title="Profile">
            {({ isActive }) =>
              isActive ? (
                <HiUserCircle size={"2em"} />
              ) : (
                <HiOutlineUserCircle size={"2em"} />
              )
            }
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}
