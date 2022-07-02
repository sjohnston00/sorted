import React, { Children } from "react"
import { HiChevronLeft } from "react-icons/hi"
import { Link } from "remix"

type BackButtonProps = {
  to: string
  className?: string
  children: React.ReactNode
}

export default function BackButton({
  to,
  className,
  children,
}: BackButtonProps) {
  return (
    <Link
      to={to}
      className={`flex gap-1 items-center p-1 text-sm text-neutral-300 hover:text-neutral-300 hover:no-underline ${className}`}
    >
      <HiChevronLeft />
      {children}
    </Link>
  )
}
