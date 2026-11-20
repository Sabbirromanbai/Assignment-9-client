"use client"

import Link from "next/link"
import { ArrowRight, Search, ShoppingBag, Smile } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Explore",
    description:
      "Browse local vendors and discover pizzas, sides and drinks crafted near you.",
  },
  {
    number: "02",
    icon: ShoppingBag,
    title: "Place Your Order",
    description:
      "Customize your favorites and checkout in a few taps, with clear delivery options.",
  },
  {
    number: "03",
    icon: Smile,
    title: "Enjoy",
    description:
      "Track your order and enjoy fresh, hot pizza delivered straight to your door.",
  },
] as const

export function HowPizzabariWorks() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <motion.div
        className="mx-auto max-w-2xl text-center"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          How it works
        </span>
        <h2 className="mt-3 font-heading text-headline text-balance">
          Fresh Pizza in 3 Simple Steps
        </h2>
        <p className="mt-3 text-muted-foreground">
          From craving to first bite, ordering with Pizzabari stays simple.
        </p>
      </motion.div>

      <div className="relative mt-14">
        <motion.div
          aria-hidden="true"
          className="absolute left-[16.666%] right-[16.666%] top-10 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
          initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "center" }}
        />

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon

            return (
              <motion.article
                key={step.title}
                className="group relative rounded-2xl border border-border/70 bg-card p-6 text-center shadow-card transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-elevated"
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.55,
                  delay: reduceMotion ? 0 : index * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <span className="absolute -top-5 left-1/2 z-10 grid size-10 -translate-x-1/2 place-items-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground shadow-glow">
                  {step.number}
                </span>

                <span className="mx-auto mt-4 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 ease-smooth group-hover:scale-110">
                  <Icon className="size-7" aria-hidden="true" />
                </span>

                <h3 className="mt-5 font-heading text-xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </motion.article>
            )
          })}
        </div>
      </div>

      <motion.div
        className="mt-12 flex justify-center"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href="/menu"
          className={cn(buttonVariants(), "shadow-glow")}
        >
          Browse Menu
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </motion.div>
    </section>
  )
}
