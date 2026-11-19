"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, CheckCircle2, Clock, MapPin, Package, Pizza, RefreshCw, Store, XCircle } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import {
  cancelOrder,
  fetchMenuItems,
  fetchMyOrders,
  fetchVendorProfile,
  type MenuItem,
  type Order,
  type OrderStatus,
  type VendorProfile,
} from "@/lib/api"
import { OrderStatusTimeline } from "@/components/dashboard/order-status-timeline"
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

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-40 animate-pulse rounded-2xl border border-border/70 bg-muted/60"
        />
      ))}
    </div>
  )
}

type ConfirmState = Order | null

export function CustomerOrders() {
  const reduceMotion = useReducedMotion()
  const { toast } = useToast()

  const [orders, setOrders] = React.useState<Order[]>([])
  const [items, setItems] = React.useState<Record<string, MenuItem>>({})
  const [vendors, setVendors] = React.useState<Record<string, VendorProfile>>({})
  const [status, setStatus] = React.useState<ViewStatus>("loading")
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)
  const [processingId, setProcessingId] = React.useState<string | null>(null)
  const [confirm, setConfirm] = React.useState<ConfirmState>(null)
  const [isCancelling, setIsCancelling] = React.useState(false)

  React.useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setStatus("loading")
      setError(null)
      try {
        const [orderList, menuItems] = await Promise.all([
          fetchMyOrders(controller.signal),
          fetchMenuItems({}, controller.signal),
        ])
        setOrders(orderList)

        const itemMap: Record<string, MenuItem> = {}
        for (const item of menuItems) {
          itemMap[item._id] = item
        }
        setItems(itemMap)

        const vendorIds = [
          ...new Set(orderList.map((order) => order.vendorId).filter(Boolean)),
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
        setVendors(vendorMap)

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

  async function handleCancel() {
    if (!confirm) return
    setIsCancelling(true)
    setProcessingId(confirm._id)
    try {
      const updated = await cancelOrder(confirm._id)
      setOrders((prev) =>
        prev.map((entry) => (entry._id === updated._id ? updated : entry))
      )
      toast({
        variant: "success",
        title: "Order cancelled",
        description: "Your pending order has been cancelled.",
      })
    } catch (caughtError) {
      toast({
        variant: "error",
        title: "Failed to cancel order",
        description:
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to cancel this order. Please try again.",
      })
    } finally {
      setIsCancelling(false)
      setProcessingId(null)
      setConfirm(null)
    }
  }

  return (
    <section aria-labelledby="customer-orders-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Customer dashboard
          </p>
          <h1
            id="customer-orders-heading"
            className="mt-3 font-heading text-3xl font-bold tracking-tight"
          >
            My orders
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            View your order history, delivery details, and cancel pending orders.
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
            <Package className="size-10 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-lg font-semibold">
              No orders yet
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Your placed orders will appear here.
            </p>
            <Link
              href="/menu"
              className={cn(buttonVariants(), "mt-6 shadow-soft")}
            >
              Browse menu
            </Link>
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
              const vendor = vendors[order.vendorId]
              const isPending = order.status === "pending"
              const isProcessingThis = processingId === order._id
              const image = item?.images?.[0]

              return (
                <motion.article
                  key={order._id}
                  className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-card backdrop-blur-sm transition-shadow hover:shadow-elevated"
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
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt={item?.itemName ?? "Ordered item"}
                          className="size-full object-cover"
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
                          <Store className="size-4 shrink-0 text-primary" aria-hidden="true" />
                          <span className="truncate">
                            {vendor?.businessName || vendor?.name || "Vendor"}
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

                      <OrderStatusTimeline
                        status={order.status}
                        createdAt={order.createdAt}
                        className="mt-4 border-t border-border/60 pt-4"
                      />
                    </div>

                    {isPending ? (
                      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                        <button
                          type="button"
                          onClick={() => setConfirm(order)}
                          disabled={isProcessingThis}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "border-destructive/40 text-destructive hover:bg-destructive/10"
                          )}
                          aria-label={`Cancel order for ${item?.itemName ?? "item"}`}
                        >
                          {isProcessingThis ? (
                            <Clock className="size-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <XCircle className="size-4" aria-hidden="true" />
                          )}
                          Cancel
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
          aria-labelledby="cancel-order-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-foreground/25 backdrop-blur-sm"
            onClick={() => !isCancelling && setConfirm(null)}
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
              id="cancel-order-title"
              className="font-heading text-lg font-semibold tracking-tight"
            >
              Cancel this order?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Only pending orders can be cancelled. This action cannot be undone.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => !isCancelling && setConfirm(null)}
                disabled={isCancelling}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Keep order
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCancelling}
                className={cn(
                  "h-9 gap-1.5 px-3 inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-destructive text-destructive-foreground text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 hover:bg-destructive/90"
                )}
              >
                {isCancelling ? (
                  <Clock className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                Cancel order
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </section>
  )
}