import React from 'react'

type ChevronProps = {
  direction?: 'left' | 'right' | 'up' | 'down'
}

export default function Chevron({ direction = 'left' }: ChevronProps) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      className={`w-5 h-5 ${
        direction === 'left'
          ? 'rotate-0'
          : direction === 'right'
          ? 'rotate-180'
          : direction === 'up'
          ? 'rotate-90'
          : '-rotate-90'
      }`}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M15.75 19.5L8.25 12l7.5-7.5'
      />
    </svg>
  )
}
