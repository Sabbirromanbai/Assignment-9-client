"use client"

import { Leaf, ShieldCheck, ShoppingBag } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

const features = [
  {
    icon: Leaf,
    title: "Fresh & Quality Ingredients",
    description:
      "Slow-fermented dough, vine-ripened tomatoes and hand-picked toppings prepared fresh for every order.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Local Vendors",
    description:
      "Every partner kitchen is vetted for quality, hygiene and consistency you can rely on.",
  },
  {
    icon: ShoppingBag,
    title: "Easy Ordering Experience",
    description:
      "Browse, customize and checkout in a few taps, with clear tracking from oven to door.",
  },
] as const

export function WhyChoosePizzabari() {
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
          Why Pizzabari
        </span>
        <h2 className="mt-3 font-heading text-headline text-balance">
          Crafted for every craving
        </h2>
        <p className="mt-3 text-muted-foreground">
          From the first stretch of dough to the final slice, every detail is
          built around freshness, trust and ease.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon

          return (
            <motion.article
              key={feature.title}
              className="group rounded-2xl border border-border/70 bg-card p-6 shadow-card transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-elevated"
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.55,
                delay: reduceMotion ? 0 : index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 ease-smooth group-hover:scale-110">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-heading text-xl font-semibold tracking-tight">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
