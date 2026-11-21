"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  Pizza,
  ShieldCheck,
} from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { createOrder } from "@/lib/api"
import { useAuthSession } from "@/lib/auth"

const PENDING_ORDER_STORAGE_KEY = "pizzabari-pending-order"
const PAYMENT_DELAY_MS = 1200

type PendingOrder = {
  itemId: string
  itemName: string
  price: number
  image: string
  deliveryDate: string
  deliveryAddress: string
  message: string
}

function isPendingOrder(value: unknown): value is PendingOrder {
  if (!value || typeof value !== "object") {
    return false
  }

  const order = value as Record<string, unknown>

  return (
    typeof order.itemId === "string" &&
    order.itemId.length > 0 &&
    typeof order.itemName === "string" &&
    typeof order.price === "number" &&
    Number.isFinite(order.price) &&
    typeof order.image === "string" &&
    typeof order.deliveryDate === "string" &&
    order.deliveryDate.length > 0 &&
    typeof order.deliveryAddress === "string" &&
    order.deliveryAddress.length > 0 &&
    typeof order.message === "string"
  )
}

function parsePendingOrder(raw: string | null): PendingOrder | null {
  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    return isPendingOrder(parsed) ? parsed : null
  } catch {
    return null
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

function formatDeliveryDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

function CheckoutSkeleton() {
  return (
    <div className="flex min-h-[60svh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
        <p className="text-sm">Preparing your checkout...</p>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { isPending, isAuthenticated } = useAuthSession()
  const [order, setOrder] = React.useState<PendingOrder | null>(null)
  const [hasLoadedOrder, setHasLoadedOrder] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [isComplete, setIsComplete] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (isPending) {
      return
    }

    if (!isAuthenticated) {
      router.replace("/sign-in?callbackURL=%2Fcheckout")
      return
    }

    const stored = parsePendingOrder(
      window.sessionStorage.getItem(PENDING_ORDER_STORAGE_KEY)
    )

    if (!stored) {
      router.replace("/menu")
      return
    }

    setOrder(stored)
    setHasLoadedOrder(true)
  }, [isPending, isAuthenticated, router])

  async function handlePay() {
    if (!order || isProcessing) {
      return
    }

    setIsProcessing(true)
    setError(null)

    await new Promise((resolve) => setTimeout(resolve, PAYMENT_DELAY_MS))

    try {
      await createOrder({
        itemId: order.itemId,
        deliveryDate: order.deliveryDate,
        deliveryAddress: order.deliveryAddress,
        message: order.message || undefined,
      })
      window.sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY)
      setIsComplete(true)
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to place your order. Please try again."
      )
    } finally {
      setIsProcessing(false)
    }
  }

  if (isComplete) {
    return (
      <section className="mx-auto flex min-h-[60svh] w-full max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <span className="grid size-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-8" aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-heading text-headline text-balance">
          Payment successful
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Your order has been placed.
        </p>
        <Link
          href="/dashboard/customer/orders"
          className={cn(buttonVariants(), "mt-8 shadow-soft")}
        >
          View My Orders
        </Link>
      </section>
    )
  }

  if (isPending || !isAuthenticated || !hasLoadedOrder || !order) {
    return <CheckoutSkeleton />
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="max-w-2xl">
        <span className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Checkout
        </span>
        <h1 className="mt-3 font-heading text-headline text-balance">
          Complete your order
        </h1>
        <p className="mt-3 text-muted-foreground">
          Review your order and confirm the demo payment to place it.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-card sm:p-6">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Order summary
          </h2>

          <div className="mt-4 flex gap-4">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
              {order.image ? (
                <Image
                  src={order.image}
                  alt={order.itemName}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-muted-foreground">
                  <Pizza className="size-8" aria-hidden="true" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-heading text-base font-semibold tracking-tight">
                {order.itemName}
              </p>
              <p className="mt-1 font-heading text-xl font-semibold text-primary">
                {formatPrice(order.price)}
              </p>
            </div>
          </div>

          <dl className="mt-5 space-y-3 border-t border-border/70 pt-4 text-sm">
            <div className="flex gap-3">
              <dt className="shrink-0 text-muted-foreground">Delivery date</dt>
              <dd className="ml-auto text-right font-medium">
                {formatDeliveryDate(order.deliveryDate)}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="shrink-0 text-muted-foreground">
                Delivery address
              </dt>
              <dd className="ml-auto break-words text-right font-medium">
                {order.deliveryAddress}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-card sm:p-6">
          <div className="flex items-center gap-2">
            <CreditCard className="size-5 text-primary" aria-hidden="true" />
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              Payment
            </h2>
          </div>

          <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            Demo payment — no real money is charged
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label
                htmlFor="demo-card-number"
                className="mb-2 block text-sm font-medium"
              >
                Card number
              </label>
              <input
                id="demo-card-number"
                type="text"
                value="4242 4242 4242 4242"
                readOnly
                disabled
                className="premium-input h-11 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="demo-card-expiry"
                  className="mb-2 block text-sm font-medium"
                >
                  Expiry
                </label>
                <input
                  id="demo-card-expiry"
                  type="text"
                  value="12 / 30"
                  readOnly
                  disabled
                  className="premium-input h-11 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
              <div>
                <label
                  htmlFor="demo-card-cvc"
                  className="mb-2 block text-sm font-medium"
                >
                  CVC
                </label>
                <input
                  id="demo-card-cvc"
                  type="text"
                  value="123"
                  readOnly
                  disabled
                  className="premium-input h-11 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handlePay}
            disabled={isProcessing}
            className={cn(
              "mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-6 text-sm font-semibold tracking-wide text-primary-foreground shadow-glow transition-all duration-300 ease-smooth",
              "hover:-translate-y-0.5 hover:from-primary/90 hover:to-primary/70 hover:shadow-elevated",
              "active:translate-y-0 active:scale-[0.99]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isProcessing &&
                "pointer-events-none cursor-not-allowed opacity-60 shadow-none hover:translate-y-0 hover:shadow-none active:scale-100"
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Processing payment...
              </>
            ) : (
              <>
                <CreditCard className="size-4" aria-hidden="true" />
                Pay Now
              </>
            )}
          </button>

          <Link
            href={`/menu/${order.itemId}`}
            className={cn(buttonVariants({ variant: "ghost" }), "mt-3 w-full")}
          >
            Cancel
          </Link>
        </div>
      </div>
    </section>
  )
}
