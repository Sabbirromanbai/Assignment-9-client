"use client"

import * as React from "react"
import Image from "next/image"
import { Calendar, CheckCircle2, Clock, MapPin, Pizza, RefreshCw, User, XCircle } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { PremiumSkeleton } from "@/components/premium-ui"
import {
  fetchMyOrders,
  fetchVendorMenuItems,
  updateOrderStatus,
  type MenuItem,
  type Order,
  type OrderStatus,
} from "@/lib/api"
import { useToast } from "@/components/toast-provider"

type ViewStatus = "loading" | "success" | "empty" | "error"

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string; icon: React.ComponentType<{ className?: string; "aria-hidden"?: "true" }> }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    icon: Clock,
  },
  accepted: {
    label: "Accepted",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
    icon: XCircle,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground",
    icon: XCircle,
  },
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {config.label}
    </span>
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

function shortId(value: string) {
  return value.length > 8 ? `…${value.slice(-6)}` : value
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <PremiumSkeleton key={index} className="h-40 rounded-2xl" />
      ))}
    </div>
  )
}

type ConfirmState = {
  order: Order
  nextStatus: "accepted" | "rejected"
} | null

export function VendorOrders() {
  const reduceMotion = useReducedMotion()
  const { toast } = useToast()

  const [orders, setOrders] = React.useState<Order[]>([])
  const [items, setItems] = React.useState<Record<string, MenuItem>>({})
  const [failedImages, setFailedImages] = React.useState<Set<string>>(
    new Set()
  )
  const [status, setStatus] = React.useState<ViewStatus>("loading")
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)
  const [processingId, setProcessingId] = React.useState<string | null>(null)
  const [confirm, setConfirm] = React.useState<ConfirmState>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)

  React.useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setStatus("loading")
      setError(null)
      try {
        const [orderList, menuItems] = await Promise.all([
          fetchMyOrders(controller.signal),
          fetchVendorMenuItems(controller.signal),
        ])
        setOrders(orderList)
        const map: Record<string, MenuItem> = {}
        for (const item of menuItems) {
          map[item._id] = item
        }
        setItems(map)
        setStatus(orderList.length === 0 ? "empty" : "success")
      } catch (caughtError) {
        if (controller.signal.aborted) return
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load orders"
        )
        setStatus("error")
      }
    }

    void load()
    return () => controller.abort()
  }, [reloadKey])

  async function handleConfirm() {
    if (!confirm) return
    const { order, nextStatus } = confirm
    setIsProcessing(true)
    setProcessingId(order._id)
    try {
      const updated = await updateOrderStatus(order._id, nextStatus)
      setOrders((prev) =>
        prev.map((entry) => (entry._id === updated._id ? updated : entry))
      )
      toast({
        variant: "success",
        title: nextStatus === "accepted" ? "Order accepted" : "Order rejected",
        description:
          nextStatus === "accepted"
            ? "The order has been accepted and is being prepared."
            : "The order has been rejected.",
      })
    } catch (caughtError) {
      toast({
        variant: "error",
        title: "Failed to update order",
        description:
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to update this order. Please try again.",
      })
    } finally {
      setIsProcessing(false)
      setProcessingId(null)
      setConfirm(null)
    }
  }

  return (
    <section aria-labelledby="vendor-orders-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Vendor dashboard
          </p>
          <h1
            id="vendor-orders-heading"
            className="mt-3 font-heading text-3xl font-bold tracking-tight"
          >
            Customer orders
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review incoming orders, accept or reject pending requests, and track
            their status.
          </p>
        </div>
      </div>

      <div className="mt-8">
        {status === "loading" ? <OrdersSkeleton /> : null}

        {status === "error" ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
            <h2 className="mt-4 font-heading text-lg font-semibold">
              Could not load orders
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

        {status === "empty" ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/60 px-6 py-12 text-center">
            <Pizza className="size-10 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-lg font-semibold">
              No orders yet
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Customer orders will appear here as soon as they are placed.
            </p>
          </div>
        ) : null}

        {status === "success" ? (
          <motion.div
            className="space-y-4"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {orders.map((order, index) => {
              const item = items[order.itemId]
              const isPending = order.status === "pending"
              const isProcessingThis = processingId === order._id
              const image = item?.images?.[0]

              return (
                <motion.article
                  key={order._id}
                  className="group relative overflow-hidden premium-card transition-shadow hover:shadow-elevated"
                  initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: reduceMotion ? 0 : index * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {image && !failedImages.has(order._id) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt={item?.itemName ?? "Ordered item"}
                          className="size-full object-cover"
                          onError={() =>
                            setFailedImages((prev) => new Set(prev).add(order._id))
                          }
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-muted-foreground">
                          <Pizza className="size-8" aria-hidden="true" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start gap-2">
                        <span className="inline-flex rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                          {item?.category ?? "Menu item"}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>

                      <h3 className="mt-2 font-heading text-base font-semibold tracking-tight">
                        {item?.itemName ?? "Item unavailable"}
                      </h3>

                      {item ? (
                        <p className="mt-0.5 text-sm font-semibold text-primary">
                          {formatPrice(item.price)}
                        </p>
                      ) : null}

                      <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="size-4 shrink-0 text-primary" aria-hidden="true" />
                          <span className="truncate">
                            Customer {shortId(order.customerId)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 shrink-0 text-primary" aria-hidden="true" />
                          <span>Delivery: {formatDate(order.deliveryDate)}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                          <span className="break-words">{order.deliveryAddress}</span>
                        </div>
                        {order.message ? (
                          <p className="rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm text-foreground">
                            <span className="font-medium">Message: </span>
                            {order.message}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {isPending ? (
                      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                        <button
                          type="button"
                          onClick={() =>
                            setConfirm({ order, nextStatus: "accepted" })
                          }
                          disabled={isProcessingThis}
                          className={cn(
                            buttonVariants({ variant: "default", size: "sm" }),
                            "bg-emerald-600 text-white hover:bg-emerald-700"
                          )}
                          aria-label={`Accept order for ${item?.itemName ?? "item"}`}
                        >
                          {isProcessingThis ? (
                            <Clock className="size-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <CheckCircle2 className="size-4" aria-hidden="true" />
                          )}
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirm({ order, nextStatus: "rejected" })
                          }
                          disabled={isProcessingThis}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "border-destructive/40 text-destructive hover:bg-destructive/10"
                          )}
                          aria-label={`Reject order for ${item?.itemName ?? "item"}`}
                        >
                          <XCircle className="size-4" aria-hidden="true" />
                          Reject
                        </button>
                      </div>
                    ) : null}
                  </div>
                </motion.article>
              )
            })}
          </motion.div>
        ) : null}
      </div>

      {confirm ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-confirm-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-foreground/25 backdrop-blur-sm"
            onClick={() => !isProcessing && setConfirm(null)}
            tabIndex={-1}
            aria-label="Close dialog"
          />
          <motion.div
            className="relative z-10 w-full max-w-sm rounded-3xl border border-border/70 bg-card/95 p-6 shadow-elevated backdrop-blur-2xl"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2
              id="order-confirm-title"
              className="font-heading text-lg font-semibold tracking-tight"
            >
              {confirm.nextStatus === "accepted"
                ? "Accept this order?"
                : "Reject this order?"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {confirm.nextStatus === "accepted"
                ? "The customer will be notified and the order will move to accepted."
                : "The customer will be notified and the order will be rejected."}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Each order can only be processed once.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => !isProcessing && setConfirm(null)}
                disabled={isProcessing}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing}
                className={cn(
                  "h-9 gap-1.5 px-3 inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
                  confirm.nextStatus === "accepted"
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                )}
              >
                {isProcessing ? (
                  <Clock className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                {confirm.nextStatus === "accepted" ? "Accept" : "Reject"}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </section>
  )
}