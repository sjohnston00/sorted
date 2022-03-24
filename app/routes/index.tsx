import { useState } from "react"
import { Link, LoaderFunction, redirect } from "remix"

export const loader: LoaderFunction = (): Response => {
  return redirect("/dashboard")
}
