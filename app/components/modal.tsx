import { motion, Variants } from "framer-motion"
import React from "react"
import Backdrop from "./ModalBackdrop"

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
  handleClose: any
  children: React.ReactNode
}

export default function Modal({ handleClose, children }: Props) {
  return (
    <Backdrop onClick={handleClose}>
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-0 left-0 right-0 w-full h-1/2 rounded-t-lg shadow-lg p-2 bg-neutral-200 dark:bg-neutral-900"
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
