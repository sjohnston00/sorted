import React from "react"
import { motion, Variants } from "framer-motion"
import { HiArrowUp, HiCalendar } from "react-icons/hi"

type Props = {
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>
}

export default function TodayButton({ setSelectedDate }: Props) {
  const today = new Date()
  const handleClick = () =>
    setSelectedDate(
      new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
          0,
          0,
          0,
          0
        )
      )
    )
  const variants: Variants = {
    hidden: {
      scale: 0.9,
      opacity: 0,
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 1,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }
  return (
    <motion.a
      onClick={handleClick}
      href="#today"
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      tabIndex={1}
      className="fixed bottom-5 right-5 hover:text-neutral-50 bg-primary p-1 rounded-full h-9 w-9 flex justify-center items-center"
    >
      <HiCalendar />
    </motion.a>
  )
}
