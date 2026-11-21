"use client"

import * as React from "react"
import { Pizza, RefreshCw, Search } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { PizzaCard, PizzaCardSkeleton } from "@/components/pizza-card"
import {
  fetchMenuItems,
  fetchVendorProfile,
  type MenuItem,
  type MenuFilters,
  type VendorProfile,
} from "@/lib/api"
import { PIZZA_CATEGORIES } from "@/lib/dashboard-nav"

type BrowseMenuProps = {
  initialSearch?: string
  initialCategory?: string
  initialLocation?: string
}

const SKELETON_COUNT = 8

function MenuSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <PizzaCardSkeleton key={index} />
      ))}
    </div>
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

  const categories = PIZZA_CATEGORIES

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

      <div className="mt-8 grid gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-card sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_200px_180px_auto]">
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
            className="premium-input h-10 pl-9"
          />
        </label>

        <label className="block">
          <span className="sr-only">Filter by location</span>
          <select
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="premium-input h-10"
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
            className="premium-input h-10"
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

      {categories.length > 0 ? (
        <div
          className="mt-6 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by category"
        >
          <button
            type="button"
            onClick={() => setCategory("")}
            aria-pressed={category === ""}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              category === ""
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/70 bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            All
          </button>
          {categories.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              aria-pressed={category === value}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                category === value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/70 bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {value}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-10">
        {status === "loading" ? <MenuSkeleton /> : null}

        {status === "success" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item, index) => (
              <PizzaCard
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
