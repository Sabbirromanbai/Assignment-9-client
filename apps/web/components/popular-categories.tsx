"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Pizza, RefreshCw } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { fetchMenuItems, type MenuItem } from "@/lib/api"

type Category = {
  name: string
  image: string | null
}

const PDF_CATEGORIES = [
  "Classic Pizzas",
  "Vegetarian Pizzas",
  "Meat Lovers",
  "Specialty / Gourmet Pizzas",
  "Sides & Appetizers",
  "Beverages & Desserts",
] as const

function deriveCategories(items: MenuItem[]): Category[] {
  const available = new Map<string, string | null>()

  for (const item of items) {
    const name = item.category?.trim()
    if (!name) {
      continue
    }

    const key = name.toLowerCase()
    if (!available.has(key)) {
      available.set(key, item.images?.[0] ?? null)
    }
  }

  return PDF_CATEGORIES.filter((category) =>
    available.has(category.toLowerCase())
  ).map((category) => ({
    name: category,
    image: available.get(category.toLowerCase()) ?? null,
  }))
}

function CategorySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="aspect-[4/3] animate-pulse rounded-2xl bg-muted"
        />
      ))}
    </div>
  )
}

function CategoryCard({ category }: { category: Category }) {
  const [imageFailed, setImageFailed] = React.useState(false)
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/menu?category=${encodeURIComponent(category.name)}`}
        className="group relative block overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {category.image && !imageFailed ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-105"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <Pizza className="size-10" aria-hidden="true" />
          </div>
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <h3 className="font-heading text-lg font-semibold tracking-tight text-white sm:text-xl">
          {category.name}
        </h3>
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-white/80">
          Explore
          <ArrowRight
            className="size-3 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
    </motion.div>
  )
}

export function PopularCategories() {
  const [categories, setCategories] = React.useState<Category[]>([])
  const [status, setStatus] = React.useState<
    "loading" | "success" | "empty" | "error"
  >("loading")
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)

  React.useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        setStatus("loading")
        setError(null)

        const data = await fetchMenuItems({}, controller.signal)
        const derived = deriveCategories(data)

        setCategories(derived)
        setStatus(derived.length > 0 ? "success" : "empty")
      } catch (caughtError) {
        if (controller.signal.aborted) {
          return
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load categories"
        )
        setStatus("error")
      }
    }

    void load()

    return () => controller.abort()
  }, [reloadKey])

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <span className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Categories
          </span>
          <h2 className="mt-3 font-heading text-headline text-balance">
            Popular categories
          </h2>
          <p className="mt-3 text-muted-foreground">
            Browse by what you are craving.
          </p>
        </div>

        <Link
          href="/menu"
          className={cn(buttonVariants({ variant: "outline" }), "self-start sm:self-auto")}
        >
          View All
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-10">
        {status === "loading" ? <CategorySkeleton /> : null}

        {status === "success" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard key={category.name} category={category} />
            ))}
          </div>
        ) : null}

        {status === "empty" ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/60 px-6 py-12 text-center">
            <Pizza className="size-10 text-muted-foreground" aria-hidden="true" />
            <h3 className="mt-4 font-heading text-lg font-semibold">
              No categories available
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Categories will appear once menu items are added.
            </p>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
            <h3 className="font-heading text-lg font-semibold text-destructive">
              Could not load categories
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {error ?? "Please try again in a moment."}
            </p>
            <button
              type="button"
              onClick={() => setReloadKey((value) => value + 1)}
              className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Try again
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
