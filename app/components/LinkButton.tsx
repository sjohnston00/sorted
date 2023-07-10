import { Link as RemixLink } from "@remix-run/react"
import { RemixLinkProps } from "@remix-run/react/dist/components"
import React, { forwardRef } from "react"
import { twMerge } from "tailwind-merge"

type LinkProps = RemixLinkProps & React.RefAttributes<HTMLAnchorElement>

type Ref = HTMLAnchorElement

const LinkButton = forwardRef<Ref, LinkProps>(
  ({ className, ...props }, ref) => {
    return (
      <RemixLink
        ref={ref}
        className={twMerge(
          "p-2 px-3 rounded shadow-sm bg-sky-500 font-semibold tracking-wide transition focus:ring hover:bg-sky-400 active:bg-sky-300 active:ring-sky-300 outline-none ring-sky-500 hover:ring-sky-400 ring-offset-2 active:scale-95 text-white",
          className
        )}
        {...props}
      />
    )
  }
)

export default LinkButton
