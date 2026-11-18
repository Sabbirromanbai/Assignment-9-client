"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

export function Hero() {
  const reduceMotion = useReducedMotion()
  const sectionRef = React.useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"])
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-black"
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={reduceMotion ? undefined : { y: imageY, scale: imageScale }}
      >
        <Image
          src="/images/hero-pizza.jpg"
          alt="Wood-fired pizza with bubbling cheese, basil and a charred crust on a dark surface"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/48 to-black/12"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent"
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-2xl"
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-[0.18em] text-white/90 uppercase backdrop-blur-md"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="size-1.5 rounded-full bg-primary"
              aria-hidden="true"
            />
            Wood fired · Fresh daily
          </motion.span>

          <motion.h1
            id="hero-heading"
            className="mt-6 font-heading text-5xl leading-[1.02] font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            Taste the fire,
            <br />
            <span className="text-primary">delivered warm.</span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            Slow-fermented dough, hand-stretched crusts and generous toppings —
            fired to order and brought to your door while the cheese is still
            bubbling.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href="/menu"
              className={cn(buttonVariants(), "shadow-glow")}
            >
              Browse Menu
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-white/35 bg-white/5 text-white hover:bg-white/15 hover:text-white"
              )}
            >
              Become a Vendor
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
