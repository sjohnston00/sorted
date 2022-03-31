import { motion } from "framer-motion"

type Props = {
  children: React.ReactNode
  onClick: any
}

export default function Backdrop({ children, onClick }: Props) {
  return (
    <motion.div
      onClick={onClick}
      className="fixed inset-0 bg-neutral-800 bg-opacity-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  )
}
