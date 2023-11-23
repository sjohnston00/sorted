import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  label?: React.ReactNode
  topRightlabel?: React.ReactNode
  bottomLeftlabel?: React.ReactNode
  bottomRightlabel?: React.ReactNode
  showLabel?: boolean
  divClassName?: string
  labelClassName?: string
}

type InputRef = HTMLInputElement

const Input = forwardRef<InputRef, InputProps>(
  (
    {
      className,
      label = 'label',
      showLabel = true,
      divClassName,
      labelClassName,
      topRightlabel,
      bottomLeftlabel,
      bottomRightlabel,
      ...props
    },
    ref
  ) => {
    return (
      <div className={twMerge('flex-1 form-control w-full', divClassName)}>
        {showLabel ? (
          <label
            htmlFor={props.id}
            className={twMerge('label', labelClassName)}>
            <span className='label-text'>
              {label}{' '}
              {props.required ? (
                <span className='text-red-500 ms-1'>*</span>
              ) : null}
            </span>
            <span className='label-text-alt'>{topRightlabel}</span>
          </label>
        ) : null}
        <input
          ref={ref}
          className={twMerge('input input-bordered w-full', className)}
          {...props}
        />
        <label className='label'>
          <span className='label-text-alt'>{bottomLeftlabel}</span>
          <span className='label-text-alt'>{bottomRightlabel}</span>
        </label>
      </div>
    )
  }
)

type TextareaProps = React.DetailedHTMLProps<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
> & {
  label?: React.ReactNode
  topRightLabel?: React.ReactNode
  bottomLeftLabel?: React.ReactNode
  bottomRightLabel?: React.ReactNode
  showLabel?: boolean
  divClassName?: string
  labelClassName?: string
}

type TextareaRef = HTMLTextAreaElement

const Textarea = forwardRef<TextareaRef, TextareaProps>(
  (
    {
      className,
      label = 'label',
      showLabel = true,
      divClassName,
      labelClassName,
      topRightLabel,
      bottomLeftLabel,
      bottomRightLabel,
      ...props
    },
    ref
  ) => {
    return (
      <div className={twMerge('form-control', divClassName)}>
        {showLabel ? (
          <label
            htmlFor={props.id}
            className={twMerge('label', labelClassName)}>
            <span className='label-text'>
              {label}{' '}
              {props.required ? (
                <span className='text-red-500 ms-1'>*</span>
              ) : null}
            </span>
            <span className='label-text-alt'>{topRightLabel}</span>
          </label>
        ) : null}
        <textarea
          ref={ref}
          className={twMerge('textarea textarea-bordered h-24', className)}
          {...props}
        />
        <label className='label'>
          <span className='label-text-alt'>{bottomLeftLabel}</span>
          <span className='label-text-alt'>{bottomRightLabel}</span>
        </label>
      </div>
    )
  }
)

export default Input
export { Textarea }
