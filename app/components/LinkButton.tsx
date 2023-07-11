import { Link as RemixLink } from "@remix-run/react";
import { RemixLinkProps } from "@remix-run/react/dist/components";
import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { ButtonVariant, variantClassName } from "./Button";

type LinkProps = RemixLinkProps &
  React.RefAttributes<HTMLAnchorElement> & {
    variant?: ButtonVariant;
  };

type Ref = HTMLAnchorElement;

const LinkButton = forwardRef<Ref, LinkProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <RemixLink
        ref={ref}
        className={twMerge(
          `inline-flex gap-2 items-center justify-center p-2 px-3 rounded shadow-sm font-semibold tracking-wide transition focus:ring outline-none ${variantClassName(
            variant
          )} ring-offset-2 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed`,
          className
        )}
        {...props}
      />
    );
  }
);

export default LinkButton;
