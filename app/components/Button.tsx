import React, { forwardRef } from "react"
import { twMerge } from "tailwind-merge"

type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>

type Ref = HTMLButtonElement

const Button = forwardRef<Ref, ButtonProps>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={twMerge(
        "p-2 px-3 rounded shadow-sm bg-sky-500 font-semibold tracking-wide transition focus:ring hover:bg-sky-400 active:bg-sky-300 active:ring-sky-300 outline-none ring-sky-500 hover:ring-sky-400 ring-offset-2 active:scale-95 text-white",
        className
      )}
      {...props}
    />
  )
})

export default Button
