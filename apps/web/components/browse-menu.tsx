"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Pizza, RefreshCw, Search, Store } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { Button } from "@workspace/ui/components/button"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import {
  fetchMenuItems,
  fetchVendorProfile,
  type MenuItem,
  type MenuFilters,
  type VendorProfile,
} from "@/lib/api"

type BrowseMenuProps = {
  initialSearch?: string
  initialCategory?: string
  initialLocation?: string
}

const SKELETON_COUNT = 8

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

function MenuSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
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

function MenuCard({
  item,
  vendor,
  index = 0,
}: {
  item: MenuItem
  vendor?: VendorProfile
  index?: number
}) {
  const image = item.images?.[0]
  const [imageFailed, setImageFailed] = React.useState(false)
  const reduceMotion = useReducedMotion()

  return (
    <motion.article
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-elevated"
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.5,
        delay: reduceMotion ? 0 : (index % 4) * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {image && !imageFailed ? (
          <Image
            src={image}
            alt={item.itemName}
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
          className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
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
          <MapPinIcon />
          <span className="truncate">{item.location}</span>
        </p>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Store className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate">
            {vendor?.businessName || vendor?.name || "Vendor unavailable"}
          </span>
        </p>

        <Link
          href={`/menu/${item._id}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "mt-auto w-full"
          )}
        >
          View Details
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </motion.article>
  )
}

function MapPinIcon() {
  return (
    <svg
      className="size-4 shrink-0 text-primary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export function BrowseMenu({
  initialSearch = "",
  initialCategory = "",
  initialLocation = "",
}: BrowseMenuProps) {
  const [searchInput, setSearchInput] = React.useState(initialSearch)
  const [search, setSearch] = React.useState(initialSearch)
  const [category, setCategory] = React.useState(initialCategory)
  const [location, setLocation] = React.useState(initialLocation)
  const [sort, setSort] = React.useState("")

  const [items, setItems] = React.useState<MenuItem[]>([])
  const [allItems, setAllItems] = React.useState<MenuItem[]>([])
  const [vendors, setVendors] = React.useState<Record<string, VendorProfile>>({})
  const [status, setStatus] = React.useState<
    "loading" | "success" | "empty" | "error"
  >("loading")
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)

  const allItemsRef = React.useRef<MenuItem[]>([])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput])

  React.useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        setStatus("loading")
        setError(null)

        if (allItemsRef.current.length === 0 || reloadKey > 0) {
          const all = await fetchMenuItems({}, controller.signal)
          allItemsRef.current = all
          setAllItems(all)
        }

        const filters: MenuFilters = {}
        if (search) filters.search = search
        if (category) filters.category = category
        if (location) filters.location = location
        if (sort) filters.sort = sort as MenuFilters["sort"]

        const filtered = await fetchMenuItems(filters, controller.signal)
        const approved = filtered.filter((item) => item.status === "approved")

        const vendorIds = [
          ...new Set(approved.map((item) => item.vendorId).filter(Boolean)),
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

        setItems(approved)
        setVendors(vendorMap)
        setStatus(approved.length > 0 ? "success" : "empty")
      } catch (caughtError) {
        if (controller.signal.aborted) {
          return
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load menu items"
        )
        setStatus("error")
      }
    }

    void load()

    return () => controller.abort()
  }, [search, category, location, sort, reloadKey])

  const categories = React.useMemo(
    () =>
      [...new Set(allItems.map((item) => item.category).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b)
      ),
    [allItems]
  )

  const locations = React.useMemo(
    () =>
      [...new Set(allItems.map((item) => item.location).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b)
      ),
    [allItems]
  )

  const hasFilters = Boolean(searchInput || category || location || sort)

  function clearFilters() {
    setSearchInput("")
    setSearch("")
    setCategory("")
    setLocation("")
    setSort("")
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <span className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Browse Menu
          </span>
          <h1 className="mt-3 font-heading text-headline text-balance">
            Find your next favorite pizza
          </h1>
          <p className="mt-3 text-muted-foreground">
            Search by name and filter by category or location.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-card sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_200px_200px_180px_auto]">
        <label className="relative block">
          <span className="sr-only">Search menu items</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name"
            className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
          />
        </label>

        <label className="block">
          <span className="sr-only">Filter by category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Filter by location</span>
          <select
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <option value="">All locations</option>
            {locations.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Sort by price</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort by price"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            <option value="">Newest first</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </label>

        <Button
          type="button"
          variant="outline"
          onClick={clearFilters}
          disabled={!hasFilters}
          className="h-10"
        >
          Clear filters
        </Button>
      </div>

      <div className="mt-10">
        {status === "loading" ? <MenuSkeleton /> : null}

        {status === "success" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item, index) => (
              <MenuCard
                key={item._id}
                item={item}
                vendor={vendors[item.vendorId]}
                index={index}
              />
            ))}
          </div>
        ) : null}

        {status === "empty" ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/60 px-6 py-12 text-center">
            <Pizza className="size-10 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-lg font-semibold">
              {hasFilters ? "No menu items match your filters" : "No menu items available"}
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {hasFilters
                ? "Try adjusting your search, category, or location."
                : "Approved menu items will appear here once they are available."}
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : null}

        {status === "error" ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
            <h2 className="font-heading text-lg font-semibold text-destructive">
              Could not load menu items
            </h2>
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
