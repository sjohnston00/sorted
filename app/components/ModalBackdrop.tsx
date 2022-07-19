import React from "react"
import { motion } from "framer-motion"

type Props = {
  children: React.ReactNode
  onClick: () => void
}

const TRANSITIONS = {
  DURATION: 0.5,
  EASE: [0.32, 0.72, 0, 1],
}

export default function Backdrop({ children, onClick }: Props) {
  return (
    <motion.div
      onClick={onClick}
      className="fixed inset-0 bg-black/40"
      variants={{
        open: {
          opacity: 1,
          transition: {
            ease: TRANSITIONS.EASE,
            duration: TRANSITIONS.DURATION,
          },
        },
        closed: {
          opacity: 0,
          transition: {
            ease: TRANSITIONS.EASE,
            duration: TRANSITIONS.DURATION,
          },
        },
      }}
      initial="closed"
      animate="open"
      exit="closed"
      onAnimationStart={(variant) => {
        variant
      }}
      onAnimationComplete={(variant) => {
        console.log(variant)
      }}
    >
      {children}
    </motion.div>
  )
}
