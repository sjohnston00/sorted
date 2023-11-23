import React, { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'accent'
  | 'ghost'
  | 'link'

type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  variant?: ButtonVariant
}

type Ref = HTMLButtonElement

export const variantClassName = (variant?: ButtonVariant) =>
  variant === 'primary'
    ? 'btn-primary'
    : variant === 'secondary'
    ? 'btn-secondary'
    : variant === 'neutral'
    ? 'btn-neutral'
    : variant === 'accent'
    ? 'btn-accent'
    : variant === 'ghost'
    ? 'btn-ghost'
    : 'btn-link'

const Button = forwardRef<Ref, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(`btn ${variantClassName(variant)}`, className)}
        {...props}
      />
    )
  }
)

export default Button
