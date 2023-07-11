import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "danger"
  | "dark";

type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  variant?: ButtonVariant;
};

type Ref = HTMLButtonElement;

export const variantClassName = (variant?: ButtonVariant) =>
  variant === "primary"
    ? "bg-sky-500 hover:bg-sky-400 active:bg-sky-300 active:ring-sky-300 ring-sky-500 hover:ring-sky-400 text-white"
    : variant === "secondary"
    ? "bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-300 active:ring-indigo-300 ring-indigo-500 hover:ring-indigo-400 text-white"
    : variant === "tertiary"
    ? "bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-300 active:ring-emerald-300 ring-emerald-500 hover:ring-emerald-400 text-white"
    : variant === "danger"
    ? "bg-red-500 hover:bg-red-400 active:bg-red-300 active:ring-red-300 ring-red-500 hover:ring-red-400 text-white"
    : "bg-gray-800 hover:bg-gray-700 active:bg-gray-600 active:ring-gray-600 ring-gray-800 hover:ring-gray-700 text-white";

const Button = forwardRef<Ref, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
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

export default Button;
