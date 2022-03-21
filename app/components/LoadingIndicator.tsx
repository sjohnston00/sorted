import React from "react"

export default function LoadingIndicator() {
  return (
    <svg
      className="spinner absolute top-3 right-6 z-10 h-6 w-6"
      viewBox="0 0 50 50"
    >
      <circle
        className="path stroke-slate-50"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke-width="5"
      ></circle>
    </svg>
  )
}
