import React from "react"
import LoadingIndicator from "./LoadingIndicator"

type Props = {
  isLoading: boolean
}

export default function Header({ isLoading }: Props) {
  return (
    <header className="bg-neutral-200 dark:bg-neutral-800 font-bold text-neutral-800 dark:text-neutral-50 fixed top-0 left-0 right-0 h-12 text-3xl flex items-center justify-center gap-2">
      <span className="">Sorted</span>
      {isLoading && <LoadingIndicator className="spinner h-6 w-6" />}
    </header>
  )
}
