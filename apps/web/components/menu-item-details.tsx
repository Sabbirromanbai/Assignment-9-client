"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  MapPin,
  Pizza,
  RefreshCw,
  Store,
} from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import {
  fetchMenuItems,
  fetchVendorProfile,
  type MenuItem,
  type VendorProfile,
} from "@/lib/api"

type MenuItemDetailsProps = {
  id: string
}

const VALID_OBJECT_ID = /^[a-f\d]{24}$/i

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

function DetailSkeleton() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" />
        <div className="space-y-4">
          <div className="h-6 w-24 animate-pulse rounded bg-muted" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-7 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-24 animate-pulse rounded bg-muted" />
          <div className="h-10 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </section>
  )
}

export function MenuItemDetails({ id }: MenuItemDetailsProps) {
  const reduceMotion = useReducedMotion()
  const [item, setItem] = React.useState<MenuItem | null>(null)
  const [vendor, setVendor] = React.useState<VendorProfile | null>(null)
  const [selectedImage, setSelectedImage] = React.useState(0)
  const [imageFailed, setImageFailed] = React.useState(false)
  const [status, setStatus] = React.useState<
    "loading" | "success" | "not-found" | "invalid" | "error"
  >("loading")
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)

  React.useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setStatus("loading")
      setError(null)
      setItem(null)
      setVendor(null)
      setSelectedImage(0)
      setImageFailed(false)

      if (!VALID_OBJECT_ID.test(id)) {
        setStatus("invalid")
        return
      }

      try {
        const items = await fetchMenuItems({}, controller.signal)
        const found = items.find((entry) => entry._id === id)

        if (!found || found.status !== "approved") {
          setStatus("not-found")
          return
        }

        setItem(found)

        try {
          const profile = await fetchVendorProfile(found.vendorId, controller.signal)
          if (!controller.signal.aborted) {
            setVendor(profile)
          }
        } catch {
          if (!controller.signal.aborted) {
            setVendor(null)
          }
        }

        if (!controller.signal.aborted) {
          setStatus("success")
        }
      } catch (caughtError) {
        if (controller.signal.aborted) {
          return
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load this menu item"
        )
        setStatus("error")
      }
    }

    void load()

    return () => controller.abort()
  }, [id, reloadKey])

  const images = item?.images ?? []
  const activeImage = images[selectedImage] ?? images[0]

  if (status === "loading") {
    return <DetailSkeleton />
  }

  if (status === "invalid") {
    return (
      <section className="mx-auto flex min-h-[60svh] w-full max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <h1 className="font-heading text-headline text-balance">
          Invalid menu item
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          The requested menu item ID is not valid.
        </p>
        <Link
          href="/menu"
          className={cn(buttonVariants({ variant: "outline" }), "mt-8")}
        >
          Back to menu
        </Link>
      </section>
    )
  }

  if (status === "not-found") {
    return (
      <section className="mx-auto flex min-h-[60svh] w-full max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <h1 className="font-heading text-headline text-balance">
          Menu item not found
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          This item is unavailable, not approved, or no longer exists.
        </p>
        <Link
          href="/menu"
          className={cn(buttonVariants({ variant: "outline" }), "mt-8")}
        >
          Back to menu
        </Link>
      </section>
    )
  }

  if (status === "error" || !item) {
    return (
      <section className="mx-auto flex min-h-[60svh] w-full max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <h1 className="font-heading text-headline text-balance">
          Could not load this item
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          {error ?? "Please try again in a moment."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Try again
          </button>
          <Link
            href="/menu"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            Back to menu
          </Link>
        </div>
      </section>
    )
  }

  return (
    <motion.section
      className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Link
          href="/menu"
          className="transition-colors hover:text-foreground"
        >
          Browse Menu
        </Link>
        <span aria-hidden="true">/</span>
        <span className="truncate text-foreground">{item.itemName}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/70 bg-muted shadow-card">
            {activeImage && !imageFailed ? (
              <Image
                src={activeImage}
                alt={item.itemName}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="grid h-full place-items-center text-muted-foreground">
                <Pizza className="size-12" aria-hidden="true" />
              </div>
            )}
          </div>

          {images.length > 1 ? (
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => {
                    setSelectedImage(index)
                    setImageFailed(false)
                  }}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-xl border bg-muted transition-all duration-200",
                    selectedImage === index
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border/70 hover:border-primary/50"
                  )}
                  aria-label={`View image ${index + 1} of ${images.length}`}
                  aria-pressed={selectedImage === index}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-5">
          <div>
            <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              {item.category}
            </span>
            <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
              {item.itemName}
            </h1>
            <p className="mt-3 font-heading text-3xl font-semibold text-primary">
              {formatPrice(item.price)}
            </p>
          </div>

          <p className="text-base leading-relaxed text-muted-foreground">
            {item.description}
          </p>

          <div className="grid gap-3 rounded-2xl border border-border/70 bg-card p-5 shadow-card">
            <div className="flex items-center gap-3 text-sm">
              <MapPin
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>{item.location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Store
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>
                {vendor?.businessName || vendor?.name || "Vendor unavailable"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              Order option
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Delivery date, address, and special instructions are required to
              place an order. Sign in to continue with ordering.
            </p>
            <Link
              href="/sign-in"
              className={cn(buttonVariants(), "mt-4 shadow-soft")}
            >
              Sign in to order
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
