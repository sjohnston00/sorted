import { useState } from "react"
import { Link, LoaderFunction, redirect } from "remix"
import CustomCalendar from "~/components/customCalendar"

// export const loader: LoaderFunction = (): Response => {
//   return redirect("/dashboard")
// }

export default function Index() {
  return (
    <div>
      <CustomCalendar />
    </div>
  )
}
