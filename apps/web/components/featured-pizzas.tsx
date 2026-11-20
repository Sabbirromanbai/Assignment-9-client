"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Pizza, RefreshCw } from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { PizzaCard, PizzaCardSkeleton } from "@/components/pizza-card"
import {
  fetchMenuItems,
  fetchVendorProfile,
  type MenuItem,
  type VendorProfile,
} from "@/lib/api"

const FEATURED_COUNT = 6

function FeaturedSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: FEATURED_COUNT }).map((_, index) => (
        <PizzaCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function FeaturedPizzas() {
  const [items, setItems] = React.useState<MenuItem[]>([])
  const [vendors, setVendors] = React.useState<Record<string, VendorProfile>>({})
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
        const featured = data
          .filter((item) => item.status === "approved")
          .slice(0, FEATURED_COUNT)

        const vendorIds = [
          ...new Set(featured.map((item) => item.vendorId).filter(Boolean)),
        ]

        const vendorResults = await Promise.allSettled(
          vendorIds.map((vendorId) =>
            fetchVendorProfile(vendorId, controller.signal)
          )
        )

        const vendorMap: Record<string, VendorProfile> = {}
        vendorResults.forEach((result, index) => {
          if (result.status === "fulfilled") {
            const vendorId = vendorIds[index]
            if (vendorId) {
              vendorMap[vendorId] = result.value
            }
          }
        })

        setItems(featured)
        setVendors(vendorMap)
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
            {items.map((item, index) => (
              <PizzaCard
                key={item._id}
                item={item}
                vendor={vendors[item.vendorId]}
                index={index}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
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
