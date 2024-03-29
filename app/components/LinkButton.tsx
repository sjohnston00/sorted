import { Link as RemixLink } from '@remix-run/react'
import { RemixLinkProps } from '@remix-run/react/dist/components'
import React, { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { ButtonVariant, variantClassName } from './Button'

type LinkProps = RemixLinkProps &
  React.RefAttributes<HTMLAnchorElement> & {
    variant?: ButtonVariant
  }

type Ref = HTMLAnchorElement

const LinkButton = forwardRef<Ref, LinkProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <RemixLink
        ref={ref}
        className={twMerge('btn', variantClassName(variant), className)}
        {...props}
      />
    )
  }
)

export default LinkButton
