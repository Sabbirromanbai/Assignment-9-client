"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from "motion/react"

import { cn } from "@workspace/ui/lib/utils"

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        delay: reduceMotion ? 0 : delay,
        ease: EASE,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function TiltCard({
  children,
  className,
  intensity = 5,
  ...props
}: HTMLMotionProps<"div"> & { intensity?: number }) {
  const reduceMotion = useReducedMotion()
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const smoothX = useSpring(pointerX, { stiffness: 220, damping: 26 })
  const smoothY = useSpring(pointerY, { stiffness: 220, damping: 26 })
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [intensity, -intensity])
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-intensity, intensity])

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    if (reduceMotion) return
    const rect = event.currentTarget.getBoundingClientRect()
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5)
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5)
  }

  function handleLeave() {
    pointerX.set(0)
    pointerY.set(0)
  }

  return (
    <motion.div
      {...props}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={
        reduceMotion
          ? props.style
          : {
              ...props.style,
              rotateX,
              rotateY,
              transformPerspective: 900,
              transformStyle: "preserve-3d",
            }
      }
      whileHover={reduceMotion ? undefined : { y: -4 }}
      className={cn("premium-card premium-card-interactive", className)}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedCounter({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  const count = useMotionValue(reduceMotion ? value : 0)
  const display = useTransform(count, (latest) => Math.round(latest).toLocaleString())

  React.useEffect(() => {
    if (reduceMotion) {
      count.set(value)
      return
    }

    const controls = animate(count, value, { duration: 0.9, ease: EASE })
    return () => controls.stop()
  }, [count, reduceMotion, value])

  return <motion.span className={className}>{display}</motion.span>
}

export function PremiumSkeleton({ className }: { className?: string }) {
  return <div className={cn("premium-skeleton", className)} aria-hidden="true" />
}

export function PremiumEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("premium-empty", className)}>
      <span className="grid size-12 place-items-center rounded-2xl border border-brand-orange/20 bg-brand-orange/10 text-brand-orange">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-4 font-heading text-base font-semibold">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function AnimatedPresenceDiv({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence initial={false}>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: reduceMotion ? 0 : 0.24, ease: EASE }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
