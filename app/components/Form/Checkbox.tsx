import React from 'react'
import { twMerge } from 'tailwind-merge'

type CheckboxProps = {
  className?: string
  label?: string
  name?: string
  id?: string
}

export default function Checkbox({
  className = '',
  label,
  name,
  id
}: CheckboxProps) {
  return (
    <div className={twMerge(`form-control ${className}`)}>
      <label className='label cursor-pointer'>
        <span className='label-text'>{label}</span>
        <input type='checkbox' className='checkbox' name={name} id={id} />
      </label>
    </div>
  )
}
