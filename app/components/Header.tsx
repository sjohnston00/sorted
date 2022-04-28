import React from "react"
import LoadingIndicator from "./LoadingIndicator"

type Props = {
  isLoading: boolean
}

export default function Header({ isLoading }: Props) {
  return (
    <header className="bg-neutral-200 dark:bg-neutral-800 font-bold text-neutral-800 dark:text-neutral-50 fixed top-0 left-0 right-0 text-3xl flex items-end pb-4 justify-center gap-2 standalone:h-24">
      <div className="flex items-center gap-2 justify-self-center">
        <svg
          width="24"
          height="24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-neutral-50"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M21.6 2.4H2.4v19.2h19.2V2.4zM0 0v24h24V0H0z"
            className="fill-current"
          />
          <path
            d="M4.56 4.08h14.88v15.84H4.56V4.08z"
            className="fill-current"
          />
        </svg>
        <span>Sorted</span>
      </div>
      <div
        className={`${
          isLoading ? "opacity-100" : "opacity-0"
        } transition-all justify-self-end`}
      >
        <LoadingIndicator className="spinner h-6 w-6" />
      </div>
    </header>
  )
}
