"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const isDashboard = pathname.startsWith("/dashboard")

  if (isDashboard) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={pathname}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{
            duration: reduceMotion ? 0 : 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex-1"
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  )
}
