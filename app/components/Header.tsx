import React from "react"
import LoadingIndicator from "./LoadingIndicator"

type Props = {
  isLoading: boolean
}

export default function Header({ isLoading }: Props) {
  return (
    <header className="translucent-blur font-bold text-neutral-50 fixed top-0 left-0 right-0 flex items-center justify-center gap-2 h-16 standalone:items-end standalone:pb-4  standalone:h-24 ">
      <div className="flex items-center gap-2">
        <svg
          width="24"
          height="24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-neutral-50"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M21.6 2.4H2.4v19.2h19.2V2.4zM0 0v24h24V0H0z"
            className="fill-current"
          />
          <path
            d="M4.56 4.08h14.88v15.84H4.56V4.08z"
            className="fill-current"
          />
        </svg>
        <span className="text-3xl">Sorted</span>
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
