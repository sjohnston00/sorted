import React from "react"
import { MetaFunction, Outlet } from "remix"

export const meta: MetaFunction = () => {
  return {
    title: "Sorted | Habits",
  }
}

export default function Index() {
  return (
    <>
      <Outlet />
    </>
  )
}
