import React from "react"
import { NavLink } from "remix"
import {
  HiCalendar,
  HiOutlineCalendar,
  HiUserCircle,
  HiOutlineUserCircle,
  HiClipboardList,
  HiOutlineClipboardList,
  HiHome,
  HiOutlineHome,
} from "react-icons/hi"

export default function Navbar() {
  return (
    <nav className="nav translucent-blur">
      <ul className="flex items-center justify-around  gap-2 w-full">
        <li>
          <NavLink to="habits" title="Habits" className="hover:no-underline">
            {({ isActive }) =>
              isActive ? (
                <div className="flex flex-col items-center">
                  <HiClipboardList
                    size={"1.25em"}
                    className="dark:stroke-neutral-50 stroke-neutral-800"
                  />
                  <span className="text-xs font-semibold">Habits</span>
                </div>
              ) : (
                <div className="flex flex-col items-center opacity-80">
                  <HiOutlineClipboardList
                    size={"1.25em"}
                    className="dark:stroke-neutral-50 stroke-neutral-800"
                  />
                  <span className="dark:text-neutral-50 text-neutral-800 text-xs">
                    Habits
                  </span>
                </div>
              )
            }
          </NavLink>
        </li>

        <li>
          <NavLink
            to={"/dashboard"}
            title="Calendar | Dashboard"
            className="hover:no-underline"
          >
            {({ isActive }) =>
              isActive ? (
                <div className="flex flex-col items-center">
                  <HiCalendar size={"1.25em"} />
                  <span className="text-xs font-semibold">Calendar</span>
                </div>
              ) : (
                <div className="flex flex-col items-center opacity-80">
                  <HiOutlineCalendar
                    size={"1.25em"}
                    className="dark:stroke-neutral-50 stroke-neutral-800"
                  />
                  <span className="dark:text-neutral-50 text-neutral-800 text-xs">
                    Calendar
                  </span>
                </div>
              )
            }
          </NavLink>
        </li>
        {/* <li>
          <img src="/icons/icon.png" height={36} width={36} />
        </li> */}
        <li className="flex gap-2 items-center">
          <NavLink
            to={"/profile"}
            title="Profile"
            className="hover:no-underline"
          >
            {({ isActive }) =>
              isActive ? (
                <div className="flex flex-col items-center">
                  <HiUserCircle size={"1.25em"} />
                  <span className="text-xs font-semibold">Profile</span>
                </div>
              ) : (
                <div className="flex flex-col items-center opacity-80">
                  <HiOutlineUserCircle
                    size={"1.25em"}
                    className="dark:stroke-neutral-50 stroke-neutral-800"
                  />
                  <span className="dark:text-neutral-50 text-neutral-800 text-xs">
                    Profile
                  </span>
                </div>
              )
            }
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}
