import { motion, Variants } from "framer-motion"
import React from "react"
import { useLocation } from "remix"
import Backdrop from "./ModalBackdrop"

const slideInFromBottom: Variants = {
  hidden: {
    y: "100vh",
    opacity: 0,
  },
  visible: {
    y: "0",
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.2,
    },
  },
  exit: {
    y: "100vh",
    opacity: 0,
  },
}

type Props = {
  handleClose: any
  children: React.ReactNode
}

export default function Modal({ handleClose, children }: Props) {
  const key = useLocation().key
  return (
    <Backdrop onClick={handleClose}>
      <motion.div
        layoutId={key}
        onClick={(e) => e.stopPropagation()}
        className="fixed bottom-0 left-0 right-0 w-full h-3/4 rounded-t-lg shadow-lg p-2 bg-neutral-200 dark:bg-neutral-800"
        variants={slideInFromBottom}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {children}
      </motion.div>
    </Backdrop>
  )
}
