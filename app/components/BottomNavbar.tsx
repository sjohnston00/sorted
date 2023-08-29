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
    <nav className='fixed px-4 bottom-0 h-[83px] backdrop-blur-md inset-x-0 text-black flex pt-1.5 items-start justify-around bottom-nav overflow-x-auto border-t border-gray-100'>
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
    </nav>
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
        `flex flex-col items-center justify-center px-2 text-gray-500 text-xs tracking-tighter gap-px transition ${
          isActive ? 'text-blue-500 font-medium' : ''
        } ${isPending ? 'opacity-30' : ''}`
      }>
      {({ isActive, isPending }) => (
        <>
          <span className={`${isActive ? 'text-blue-500' : ''}`}>{icon}</span>
          <span className={`${isActive ? 'text-blue-500' : ''}`}>{name}</span>
        </>
      )}
    </NavLink>
  )
}
