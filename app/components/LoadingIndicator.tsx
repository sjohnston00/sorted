import React from "react"

type Props = {
  className?: string
}

export default function LoadingIndicator({
  className = "spinner absolute top-3 right-6 z-10 h-6 w-6",
}: Props) {
  return (
    <svg className={className} viewBox="0 0 50 50">
      <circle
        className="path dark:stroke-neutral-50 stroke-neutral-800"
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke-width="5"
      ></circle>
    </svg>
  )
}
