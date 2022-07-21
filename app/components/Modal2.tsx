import React from "react"
import { Dialog } from "@headlessui/react"
import { motion } from "framer-motion"

const TRANSITIONS = {
  DURATION: 0.5,
  EASE: [0.32, 0.72, 0, 1],
}

export default function Modal({
  onClose,
  children,
}: {
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <Dialog static className="fixed inset-0 z-10" onClose={onClose} open={true}>
      <div className="flex flex-col justify-center h-full px-1 pt-4 text-center sm:block sm:p-0">
        <Dialog.Overlay
          as={motion.div}
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
          onAnimationStart={(variant: string) => {
            if (variant === "open") {
              set(document.documentElement, {
                background: "black",
                height: "100vh",
              })
              set(document.body, { position: "fixed", inset: "0" })
              set(document.querySelector("header"), { position: "absolute" })
              set(document.querySelector("#__app"), {
                borderRadius: "8px",
                overflow: "hidden",
                transform:
                  "scale(0.93) translateY(calc(env(safe-area-inset-top) + 8px))",
                transformOrigin: "top",
                transitionProperty: "transform",
                transitionDuration: `${TRANSITIONS.DURATION}s`,
                transitionTimingFunction: `cubic-bezier(${TRANSITIONS.EASE.join(
                  ","
                )})`,
              })
            } else {
              reset(document.querySelector("#__app"), "transform")
            }
          }}
          onAnimationComplete={(variant: string) => {
            if (variant === "closed") {
              reset(document.documentElement)
              reset(document.body)
              reset(document.querySelector("header"))
              reset(document.querySelector("#__app"))
            }
          }}
          className="fixed inset-0 bg-black/40"
        />

        <motion.div
          initial={{ y: "100%" }}
          animate={{
            y: 0,
            transition: { duration: 0.4, ease: [0.36, 0.66, 0.04, 1] },
          }}
          exit={{
            y: "100%",
            transition: { duration: 0.3, ease: [0.36, 0.66, 0.04, 1] },
          }}
          className="z-0 flex flex-col w-full h-full bg-[#1c1c1e] rounded-t-lg shadow-xl mt-4"
        >
          {children}
        </motion.div>
      </div>
    </Dialog>
  )
}

const cache = new Map()

function set(el: any, styles?: any) {
  const originalStyles: { [a: string]: any } = {}

  Object.entries(styles).forEach(([key, value]) => {
    originalStyles[key] = el.style[key]
    el.style[key] = value
  })

  cache.set(el, originalStyles)
}

function reset(el: any, prop?: any) {
  const originalStyles = cache.get(el)

  if (prop) {
    el.style[prop] = originalStyles[prop]
  } else {
    Object.entries(originalStyles).forEach(([key, value]) => {
      el.style[key] = value
    })
  }
}
