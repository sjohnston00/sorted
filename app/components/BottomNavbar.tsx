import React from 'react'
import Trash from './icons/Trash'
import { Link, NavLink } from '@remix-run/react'
import Chevron from './icons/Chevron'
import Home from './icons/Home'
import CalendarDays from './icons/CalendarDays'
import Squares from './icons/Squares'
import UserCircle from './icons/UserCircle'

export default function BottomNavbar() {
  return (
    <div className='btm-nav backdrop-blur-md bottom-nav bg-transparent'>
      <NavItem name='Home' to='/' icon={<CalendarDays className='w-7 h-7' />} />
      <NavItem
        name='Habits'
        to='/habits'
        icon={<Squares className='w-7 h-7' />}
      />
      <NavItem
        name='Profile'
        to='/profile'
        icon={<UserCircle className='w-7 h-7' />}
      />
    </div>
  )
}

type NavItemProps = {
  name: string
  icon?: React.ReactNode
  to: string
}

function NavItem({ name, to, icon }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive, isPending }) =>
        `flex flex-col items-center justify-center px-2 text-gray-500 text-xs tracking-tighter gap-px transition bg-transparent ${
          isActive ? 'active border-primary ' : ''
        } ${isPending ? 'opacity-30' : ''}`
      }>
      {({ isActive, isPending }) => (
        <>
          <span className={`${isActive ? 'active text-primary' : ''}`}>
            {icon}
          </span>
          <span className={`${isActive ? 'active text-primary' : ''}`}>
            {name}
          </span>
        </>
      )}
    </NavLink>
  )
}
