"use client"

import * as React from "react"
import Image from "next/image"
import { AlertCircle, CheckCircle2, Pizza, RefreshCw, Trash2, XCircle } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { PremiumSkeleton } from "@/components/premium-ui"
import {
  deleteAdminMenuItem,
  fetchAdminMenuItems,
  updateAdminMenuItemStatus,
  type MenuItem,
} from "@/lib/api"
import { useToast } from "@/components/toast-provider"

type ViewStatus = "loading" | "success" | "empty" | "error"

const STATUS_CONFIG: Record<
  MenuItem["status"],
  { label: string; className: string }
> = {
  approved: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
  inactive: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground",
  },
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

export function AdminMenuItems() {
  const reduceMotion = useReducedMotion()
  const { toast } = useToast()

  const [items, setItems] = React.useState<MenuItem[]>([])
  const [failedImages, setFailedImages] = React.useState<Set<string>>(
    new Set()
  )
  const [status, setStatus] = React.useState<ViewStatus>("loading")
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)
  const [processingId, setProcessingId] = React.useState<string | null>(null)
  const [deletingItem, setDeletingItem] = React.useState<MenuItem | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  React.useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setStatus("loading")
      setError(null)
      try {
        const result = await fetchAdminMenuItems(controller.signal)
        setItems(result)
        setStatus(result.length === 0 ? "empty" : "success")
      } catch (caughtError) {
        if (controller.signal.aborted) return
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
  }, [reloadKey])

  async function handleStatusChange(item: MenuItem, nextStatus: "approved" | "rejected") {
    setProcessingId(item._id)
    try {
      const updated = await updateAdminMenuItemStatus(item._id, nextStatus)
      setItems((prev) =>
        prev.map((entry) => (entry._id === updated._id ? updated : entry))
      )
      toast({
        variant: "success",
        title: nextStatus === "approved" ? "Item approved" : "Item rejected",
        description: `${updated.itemName} has been ${nextStatus}.`,
      })
    } catch (caughtError) {
      toast({
        variant: "error",
        title: "Failed to update item",
        description:
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to update this item. Please try again.",
      })
    } finally {
      setProcessingId(null)
    }
  }

  async function handleConfirmDelete() {
    if (!deletingItem) return
    setIsDeleting(true)
    try {
      await deleteAdminMenuItem(deletingItem._id)
      setItems((prev) => prev.filter((item) => item._id !== deletingItem._id))
      toast({
        variant: "success",
        title: "Item deleted",
        description: `${deletingItem.itemName} has been removed.`,
      })
      if (items.length - 1 === 0) setStatus("empty")
    } catch (caughtError) {
      toast({
        variant: "error",
        title: "Failed to delete item",
        description:
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to delete this item. Please try again.",
      })
    } finally {
      setIsDeleting(false)
      setDeletingItem(null)
    }
  }

  const sortedItems = React.useMemo(
    () =>
      [...items].sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1
        if (b.status === "pending" && a.status !== "pending") return 1
        return 0
      }),
    [items]
  )

  return (
    <section aria-labelledby="admin-menu-items-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Admin dashboard
          </p>
          <h1
            id="admin-menu-items-heading"
            className="mt-3 font-heading text-3xl font-bold tracking-tight"
          >
            Manage menu items
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review pending submissions and manage all menu items.
          </p>
        </div>
      </div>

      <div className="mt-8">
        {status === "loading" ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <PremiumSkeleton key={index} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : null}

        {status === "error" ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
            <AlertCircle className="size-10 text-destructive" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-lg font-semibold">
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

        {status === "empty" ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/60 px-6 py-12 text-center">
            <Pizza className="size-10 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-lg font-semibold">
              No menu items
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Menu items will appear here once vendors submit them.
            </p>
          </div>
        ) : null}

        {status === "success" ? (
          <motion.div
            className="space-y-3"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {sortedItems.map((item, index) => {
              const image = item.images?.[0]
              const isProcessing = processingId === item._id
              const config = STATUS_CONFIG[item.status]

              return (
                <motion.div
                  key={item._id}
                  className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-card backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: reduceMotion ? 0 : index * 0.04,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {image && !failedImages.has(item._id) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt={item.itemName}
                          className="size-full object-cover"
                          onError={() =>
                            setFailedImages((prev) => new Set(prev).add(item._id))
                          }
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-muted-foreground">
                          <Pizza className="size-6" aria-hidden="true" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium">{item.itemName}</p>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                            config.className
                          )}
                        >
                          {config.label}
                        </span>
                        <span className="inline-flex rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                          {item.category}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatPrice(item.price)} · {item.location}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Vendor: {item.vendorId}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {item.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item, "approved")}
                          disabled={isProcessing}
                          className={cn(
                            buttonVariants({ variant: "default", size: "sm" }),
                            "bg-emerald-600 text-white hover:bg-emerald-700"
                          )}
                          aria-label={`Approve ${item.itemName}`}
                        >
                          {isProcessing ? (
                            <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <CheckCircle2 className="size-4" aria-hidden="true" />
                          )}
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item, "rejected")}
                          disabled={isProcessing}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "border-destructive/40 text-destructive hover:bg-destructive/10"
                          )}
                          aria-label={`Reject ${item.itemName}`}
                        >
                          <XCircle className="size-4" aria-hidden="true" />
                          Reject
                        </button>
                      </>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => setDeletingItem(item)}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-sm" }),
                        "text-destructive hover:bg-destructive/10 hover:text-destructive"
                      )}
                      aria-label={`Delete ${item.itemName}`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        ) : null}
      </div>

      {deletingItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-menu-item-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-foreground/25 backdrop-blur-sm"
            onClick={() => !isDeleting && setDeletingItem(null)}
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
              id="delete-menu-item-title"
              className="font-heading text-lg font-semibold tracking-tight"
            >
              Delete menu item
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Permanently delete &quot;{deletingItem.itemName}&quot;? This cannot be undone.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => !isDeleting && setDeletingItem(null)}
                disabled={isDeleting}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className={cn(
                  "h-9 gap-1.5 px-3 inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-destructive text-destructive-foreground text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 hover:bg-destructive/90"
                )}
              >
                {isDeleting ? (
                  <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </section>
  )
}