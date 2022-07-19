import { motion, Variants } from "framer-motion"
import React from "react"
import Backdrop from "./ModalBackdrop"

const TRANSITIONS = {
  DURATION: 0.5,
  EASE: [0.32, 0.72, 0, 1],
}

const slideInFromBottom: Variants = {
  modalOut: {
    y: "100vh",
    transition: {
      type: "just",
    },
  },
  modalIn: {
    y: "0",
    opacity: 1,
    transition: {
      type: "just",
    },
  },
}

type Props = {
  handleClose: () => void
  children: React.ReactNode
}

export default function Modal({ handleClose, children }: Props) {
  return (
    <Backdrop onClick={handleClose}>
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-0 left-0 right-0 w-full h-1/2 rounded-t-lg shadow-lg p-2 pb-16 bg-neutral-200 dark:bg-neutral-900 overflow-auto "
        // variants={slideInFromBottom}
        initial={{ y: "100%" }}
        animate={{
          y: 0,
          transition: {
            ease: TRANSITIONS.EASE,
            duration: TRANSITIONS.DURATION,
          },
        }}
        exit={{
          y: "100%",
          transition: {
            ease: TRANSITIONS.EASE,
            duration: TRANSITIONS.DURATION,
          },
        }}
      >
        {children}
      </motion.div>
    </Backdrop>
  )
}
