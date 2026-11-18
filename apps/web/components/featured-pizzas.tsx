"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MapPin, Pizza, RefreshCw } from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { fetchMenuItems, type MenuItem } from "@/lib/api"

const FEATURED_COUNT = 6

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

function FeaturedSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: FEATURED_COUNT }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card"
        >
          <div className="aspect-[4/3] animate-pulse bg-muted" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-9 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

function FeaturedCard({ item }: { item: MenuItem }) {
  const image = item.images?.[0]
  const [imageFailed, setImageFailed] = React.useState(false)

  return (
    <article className="group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-elevated">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {image && !imageFailed ? (
          <Image
            src={image}
            alt={item.itemName}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
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
          className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent"
        />
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-heading text-lg font-semibold tracking-tight">
              {item.itemName}
            </h3>
            <span className="mt-1 inline-flex rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
              {item.category}
            </span>
          </div>
          <span className="shrink-0 font-heading text-lg font-semibold text-primary">
            {formatPrice(item.price)}
          </span>
        </div>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate">{item.location}</span>
        </p>

        <Link
          href={`/menu/${item._id}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "mt-1 w-full"
          )}
        >
          View Details
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

export function FeaturedPizzas() {
  const [items, setItems] = React.useState<MenuItem[]>([])
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

        const data = await fetchMenuItems(controller.signal)
        const featured = data
          .filter((item) => item.status === "approved")
          .slice(0, FEATURED_COUNT)

        setItems(featured)
        setStatus(featured.length > 0 ? "success" : "empty")
      } catch (caughtError) {
        if (controller.signal.aborted) {
          return
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load featured pizzas"
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
            Featured
          </span>
          <h2 className="mt-3 font-heading text-headline text-balance">
            Pizzas worth the trip
          </h2>
          <p className="mt-3 text-muted-foreground">
            Hand-picked favorites from local kitchens, ready to order.
          </p>
        </div>

        <Link
          href="/menu"
          className={cn(buttonVariants({ variant: "outline" }), "self-start sm:self-auto")}
        >
          Explore Full Menu
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-10">
        {status === "loading" ? <FeaturedSkeleton /> : null}

        {status === "success" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <FeaturedCard key={item._id} item={item} />
            ))}
          </div>
        ) : null}

        {status === "empty" ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/60 px-6 py-12 text-center">
            <Pizza className="size-10 text-muted-foreground" aria-hidden="true" />
            <h3 className="mt-4 font-heading text-lg font-semibold">
              No featured pizzas yet
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Check back soon, or browse the full menu for everything available.
            </p>
            <Link
              href="/menu"
              className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
            >
              Explore Full Menu
            </Link>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
            <h3 className="font-heading text-lg font-semibold text-destructive">
              Could not load featured pizzas
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
