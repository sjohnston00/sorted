import React from "react"
import { motion, Variants } from "framer-motion"
import { HiArrowUp, HiCalendar } from "react-icons/hi"

type Props = {
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>
}

export default function TodayButton({ setSelectedDate }: Props) {
  const handleClick = () => setSelectedDate(new Date())
  const pulse: Variants = {
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
      variants={pulse}
      initial="hidden"
      animate="visible"
      exit="hidden"
      tabIndex={1}
      className="fixed bottom-3 bg-primary right-3 p-2 rounded-full h-9 w-9 flex justify-center items-center"
    >
      <HiCalendar size={24} />
    </motion.a>
  )
}
