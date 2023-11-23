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
  label?: string | React.ReactNode
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
      ...props
    },
    ref
  ) => {
    return (
      <div className={twMerge('flex-1', divClassName)}>
        {showLabel ? (
          <label
            htmlFor={props.id}
            className={twMerge(
              'block w-full mb-1.5 text-gray-600 text-sm font-semibold tracking-wide',
              labelClassName
            )}>
            {label}
            {props.required ? (
              <span className='text-red-500 ms-1'>*</span>
            ) : null}
          </label>
        ) : null}
        <textarea
          ref={ref}
          className={twMerge(
            'border-2 max-w-full border-gray-300 dark:border-gray-600 p-2 block w-full bg-gray-50 dark:bg-slate-700 rounded-sm shadow-sm transition focus-visible:border-gray-800 dark:focus-visible:border-gray-500 outline-none disabled:opacity-30 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

export default Input
export { Textarea }
