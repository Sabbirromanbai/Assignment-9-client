"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Loader2,
  MapPin,
  Pizza,
  RefreshCw,
  Store,
} from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import {
  createOrder,
  fetchMenuItems,
  fetchVendorProfile,
  type MenuItem,
  type VendorProfile,
} from "@/lib/api"
import { PremiumSkeleton } from "@/components/premium-ui"
import { PremiumVendorChip } from "@/components/premium-vendor-mark"
import { useAuthSession } from "@/lib/auth"
import { isActivePremiumSubscription } from "@/lib/subscription"
import { useToast } from "@/components/toast-provider"

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
        <PremiumSkeleton className="aspect-[4/3] rounded-2xl" />
        <div className="space-y-4">
          <PremiumSkeleton className="h-6 w-24 rounded" />
          <PremiumSkeleton className="h-10 w-3/4 rounded" />
          <PremiumSkeleton className="h-7 w-1/3 rounded" />
          <PremiumSkeleton className="h-24 rounded" />
          <PremiumSkeleton className="h-10 rounded-lg" />
        </div>
      </div>
    </section>
  )
}

export function MenuItemDetails({ id }: MenuItemDetailsProps) {
  const reduceMotion = useReducedMotion()
  const { isPending: sessionPending, isAuthenticated, role } = useAuthSession()
  const { toast } = useToast()

  const [item, setItem] = React.useState<MenuItem | null>(null)
  const [vendor, setVendor] = React.useState<VendorProfile | null>(null)
  const [selectedImage, setSelectedImage] = React.useState(0)
  const [imageFailed, setImageFailed] = React.useState(false)
  const [status, setStatus] = React.useState<
    "loading" | "success" | "not-found" | "invalid" | "error"
  >("loading")
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)

  const [orderValues, setOrderValues] = React.useState({
    deliveryDate: "",
    deliveryAddress: "",
    message: "",
  })
  const [orderErrors, setOrderErrors] = React.useState<Record<string, string>>({})
  const [isSubmittingOrder, setIsSubmittingOrder] = React.useState(false)
  const [orderSuccess, setOrderSuccess] = React.useState(false)

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

  function validateOrder() {
    const errors: Record<string, string> = {}

    if (!orderValues.deliveryDate) {
      errors.deliveryDate = "Delivery date is required."
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(orderValues.deliveryDate)) {
      errors.deliveryDate = "Enter a valid delivery date."
    }

    const address = orderValues.deliveryAddress.trim()
    if (!address) {
      errors.deliveryAddress = "Delivery address is required."
    } else if (address.length > 1000) {
      errors.deliveryAddress = "Address must be 1000 characters or fewer."
    }

    if (orderValues.message.length > 1000) {
      errors.message = "Message must be 1000 characters or fewer."
    }

    setOrderErrors(errors)
    return Object.keys(errors).length === 0
  }

  function friendlyOrderError(message: string) {
    if (message.includes("active order already exists")) {
      return "An active order already exists for this item and delivery date."
    }
    if (message.includes("Vendors cannot order")) {
      return "Vendors cannot order their own items."
    }
    if (message.includes("approved and active")) {
      return "This item is not currently available to order."
    }
    if (message.includes("Item not found")) {
      return "This item is no longer available."
    }
    return message
  }

  async function handleOrderSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validateOrder()) return

    setIsSubmittingOrder(true)
    setOrderSuccess(false)
    try {
      await createOrder({
        itemId: id,
        deliveryDate: orderValues.deliveryDate,
        deliveryAddress: orderValues.deliveryAddress.trim(),
        message: orderValues.message.trim() || undefined,
      })
      setOrderSuccess(true)
      setOrderErrors({})
      toast({
        variant: "success",
        title: "Order placed",
        description: "Your order has been submitted for vendor review.",
      })
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? friendlyOrderError(caughtError.message)
          : "Unable to place your order. Please try again."
      setOrderErrors({ form: message })
      toast({ variant: "error", title: "Order failed", description: message })
    } finally {
      setIsSubmittingOrder(false)
    }
  }

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
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Store
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>
                {vendor?.businessName || vendor?.name || "Vendor unavailable"}
              </span>
              {vendor && isActivePremiumSubscription(vendor) ? (
                <PremiumVendorChip compact />
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              Order option
            </h2>

            {sessionPending ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Checking your session...
              </p>
            ) : !isAuthenticated ? (
              <>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Delivery date, address, and special instructions are required
                  to place an order. Sign in to continue.
                </p>
                <Link
                  href={`/sign-in?callbackURL=${encodeURIComponent(`/menu/${id}`)}`}
                  className={cn(buttonVariants(), "mt-4 shadow-soft")}
                >
                  Sign in to order
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </>
            ) : role !== "customer" ? (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Ordering is available to customers only.
              </p>
            ) : orderSuccess ? (
              <div className="mt-3 space-y-3">
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-5" aria-hidden="true" />
                  Your order has been placed.
                </p>
                <Link
                  href="/dashboard/customer/orders"
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  View my orders
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="mt-4 space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="order-delivery-date"
                    className="mb-2 block text-sm font-medium"
                  >
                    Delivery date
                  </label>
                  <div className="relative">
                    <Calendar
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <input
                      id="order-delivery-date"
                      type="date"
                      value={orderValues.deliveryDate}
                      onChange={(event) => {
                        setOrderValues((current) => ({
                          ...current,
                          deliveryDate: event.target.value,
                        }))
                        setOrderErrors((prev) => ({ ...prev, deliveryDate: "" }))
                      }}
                      aria-invalid={Boolean(orderErrors.deliveryDate)}
                      aria-describedby={
                        orderErrors.deliveryDate ? "order-date-error" : undefined
                      }
                      className="premium-input h-11 pl-10"
                    />
                  </div>
                  {orderErrors.deliveryDate ? (
                    <p id="order-date-error" className="mt-2 text-sm text-destructive">
                      {orderErrors.deliveryDate}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="order-delivery-address"
                    className="mb-2 block text-sm font-medium"
                  >
                    Delivery address
                  </label>
                  <textarea
                    id="order-delivery-address"
                    rows={3}
                    value={orderValues.deliveryAddress}
                    onChange={(event) => {
                      setOrderValues((current) => ({
                        ...current,
                        deliveryAddress: event.target.value,
                      }))
                      setOrderErrors((prev) => ({ ...prev, deliveryAddress: "" }))
                    }}
                    aria-invalid={Boolean(orderErrors.deliveryAddress)}
                    aria-describedby={
                      orderErrors.deliveryAddress
                        ? "order-address-error"
                        : undefined
                    }
                    className="w-full rounded-lg border border-border/70 bg-background/70 px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/25"
                    placeholder="Street address, city, and ZIP code"
                  />
                  {orderErrors.deliveryAddress ? (
                    <p id="order-address-error" className="mt-2 text-sm text-destructive">
                      {orderErrors.deliveryAddress}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="order-message"
                    className="mb-2 block text-sm font-medium"
                  >
                    Message <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <textarea
                    id="order-message"
                    rows={2}
                    value={orderValues.message}
                    onChange={(event) => {
                      setOrderValues((current) => ({
                        ...current,
                        message: event.target.value,
                      }))
                      setOrderErrors((prev) => ({ ...prev, message: "" }))
                    }}
                    aria-invalid={Boolean(orderErrors.message)}
                    className="w-full rounded-lg border border-border/70 bg-background/70 px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/25"
                    placeholder="Special instructions for the kitchen"
                  />
                  {orderErrors.message ? (
                    <p className="mt-2 text-sm text-destructive">{orderErrors.message}</p>
                  ) : null}
                </div>

                {orderErrors.form ? (
                  <p role="alert" className="text-sm text-destructive">
                    {orderErrors.form}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className={cn(
                    "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-6 text-sm font-semibold tracking-wide text-primary-foreground shadow-glow transition-all duration-300 ease-smooth",
                    "hover:-translate-y-0.5 hover:from-primary/90 hover:to-primary/70 hover:shadow-elevated",
                    "active:translate-y-0 active:scale-[0.99]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isSubmittingOrder &&
                      "pointer-events-none cursor-not-allowed opacity-60 shadow-none hover:translate-y-0 hover:shadow-none active:scale-100"
                  )}
                >
                  {isSubmittingOrder ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Placing order...
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center gap-2">
                      Place order
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
