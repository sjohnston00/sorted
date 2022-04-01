import { motion, Variants } from "framer-motion"
import React from "react"
import Backdrop from "./ModalBackdrop"

const slideInFromBottom: Variants = {
  modalOut: {
    y: "100vh",
    opacity: 0,
    scale: 0.3,
    transition: {
      duration: 0.3,
    },
  },
  modalIn: {
    y: "0",
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      duration: 0.65,
      delay: 0.2,
    },
  },
}

type Props = {
  handleClose: any
  children: React.ReactNode
}

export default function Modal({ handleClose, children }: Props) {
  return (
    <Backdrop onClick={handleClose}>
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-0 left-0 right-0 w-full h-3/4 rounded-t-lg shadow-lg p-2 bg-neutral-200 dark:bg-neutral-800"
        variants={slideInFromBottom}
        initial="modalOut"
        animate="modalIn"
        exit="modalOut"
      >
        {children}
      </motion.div>
    </Backdrop>
  )
}
