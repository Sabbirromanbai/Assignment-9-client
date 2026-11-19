"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit,
  Loader2,
  Pizza,
  Plus,
  RefreshCw,
  Trash2,
  X,
  XCircle,
  Eye,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import {
  fetchVendorMenuItems,
  updateMenuItem,
  deleteMenuItem,
  type MenuItem,
  type UpdateMenuItemInput,
  fetchUploadMenuImage,
} from "@/lib/api"
import { PIZZA_CATEGORIES, type PizzaCategory } from "@/lib/dashboard-nav"
import { ProfileImageUpload } from "@/components/profile-image-upload"
import { useToast } from "@/components/toast-provider"

// ─── Status badge ────────────────────────────────────────────────────────────

type StatusConfig = {
  label: string
  className: string
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: "true" }>
}

const STATUS_CONFIGS: Record<MenuItem["status"], StatusConfig> = {
  approved: {
    label: "Approved",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    icon: Clock,
  },
  rejected: {
    label: "Rejected",
    className:
      "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
    icon: XCircle,
  },
  inactive: {
    label: "Inactive",
    className:
      "bg-muted text-muted-foreground",
    icon: X,
  },
}

function StatusBadge({ status }: { status: MenuItem["status"] }) {
  const config = STATUS_CONFIGS[status]
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function MenuItemsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-28 animate-pulse rounded-2xl border border-border/70 bg-muted/60"
        />
      ))}
    </div>
  )
}

// ─── Confirmation modal ───────────────────────────────────────────────────────

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  variant?: "destructive" | "default"
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  isLoading = false,
  variant = "default",
}: ConfirmDialogProps) {
  const reduceMotion = useReducedMotion()

  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel()
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener("keydown", onKey)
    }
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-foreground/25 backdrop-blur-sm"
        onClick={onCancel}
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
          id="confirm-dialog-title"
          className="font-heading text-lg font-semibold tracking-tight"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              variant === "destructive"
                ? "h-8 gap-1.5 px-2.5 inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-3 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40"
                : buttonVariants()
            )}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

type EditModalProps = {
  item: MenuItem
  onClose: () => void
  onSaved: (updated: MenuItem) => void
}

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/

function EditModal({ item, onClose, onSaved }: EditModalProps) {
  const reduceMotion = useReducedMotion()
  const { toast } = useToast()

  const [values, setValues] = React.useState({
    itemName: item.itemName,
    category: item.category as PizzaCategory,
    description: item.description,
    price: String(item.price),
    location: item.location,
    image: item.images[0] ?? null,
  })
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof typeof values, string>>
  >({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isImageUploading, setIsImageUploading] = React.useState(false)

  React.useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSubmitting) onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener("keydown", onKey)
    }
  }, [isSubmitting, onClose])

  function validate() {
    const errs: Partial<Record<keyof typeof values, string>> = {}
    if (!values.itemName.trim())
      errs.itemName = "Item name is required."
    else if (values.itemName.trim().length > 100)
      errs.itemName = "Item name must be 100 characters or fewer."
    if (!values.category) errs.category = "Category is required."
    if (!values.description.trim())
      errs.description = "Description is required."
    else if (values.description.trim().length > 2000)
      errs.description = "Description must be 2000 characters or fewer."
    if (!values.price) errs.price = "Price is required."
    else if (!PRICE_PATTERN.test(values.price))
      errs.price = "Enter a valid price."
    else if (parseFloat(values.price) <= 0)
      errs.price = "Price must be greater than 0."
    if (!values.location.trim()) errs.location = "Location is required."
    else if (values.location.trim().length > 200)
      errs.location = "Location must be 200 characters or fewer."
    return errs
  }

  function update<K extends keyof typeof values>(
    field: K,
    value: (typeof values)[K]
  ) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setIsSubmitting(true)
    try {
      const payload: UpdateMenuItemInput = {
        itemName: values.itemName.trim(),
        category: values.category,
        description: values.description.trim(),
        price: parseFloat(values.price),
        location: values.location.trim(),
        images: values.image ? [values.image] : [],
      }
      const updated = await updateMenuItem(item._id, payload)
      toast({
        variant: "success",
        title: "Menu item updated",
        description: `${updated.itemName} has been saved.`,
      })
      onSaved(updated)
    } catch (err) {
      toast({
        variant: "error",
        title: "Update failed",
        description:
          err instanceof Error
            ? err.message
            : "Unable to update the menu item. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    "h-11 w-full rounded-lg border border-border/70 bg-background/70 px-3 text-sm outline-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/25"

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <button
        type="button"
        className="fixed inset-0 cursor-default bg-foreground/25 backdrop-blur-sm"
        onClick={() => !isSubmitting && onClose()}
        tabIndex={-1}
        aria-label="Close edit dialog"
      />
      <motion.div
        className="relative z-10 mx-auto my-8 w-full max-w-2xl rounded-3xl border border-border/70 bg-card/95 shadow-elevated backdrop-blur-2xl"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between border-b border-border/70 px-6 py-4">
          <h2
            id="edit-modal-title"
            className="font-heading text-lg font-semibold tracking-tight"
          >
            Edit menu item
          </h2>
          <button
            type="button"
            onClick={() => !isSubmitting && onClose()}
            disabled={isSubmitting}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            aria-label="Close"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6" noValidate>
          {/* Item name */}
          <div>
            <label
              htmlFor="edit-item-name"
              className="mb-2 block text-sm font-medium"
            >
              Item name
            </label>
            <input
              id="edit-item-name"
              type="text"
              autoComplete="off"
              value={values.itemName}
              onChange={(e) => update("itemName", e.target.value)}
              aria-invalid={Boolean(errors.itemName)}
              aria-describedby={
                errors.itemName ? "edit-item-name-error" : undefined
              }
              className={inputClass}
              placeholder="e.g. Margherita Classic"
            />
            {errors.itemName ? (
              <p id="edit-item-name-error" className="mt-2 text-sm text-destructive">
                {errors.itemName}
              </p>
            ) : null}
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="edit-category"
              className="mb-2 block text-sm font-medium"
            >
              Category
            </label>
            <select
              id="edit-category"
              value={values.category}
              onChange={(e) =>
                update("category", e.target.value as PizzaCategory)
              }
              aria-invalid={Boolean(errors.category)}
              className={inputClass}
            >
              {PIZZA_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category ? (
              <p className="mt-2 text-sm text-destructive">{errors.category}</p>
            ) : null}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="edit-description"
              className="mb-2 block text-sm font-medium"
            >
              Description
            </label>
            <textarea
              id="edit-description"
              rows={3}
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              aria-invalid={Boolean(errors.description)}
              className="h-24 w-full rounded-lg border border-border/70 bg-background/70 px-3 py-3 text-sm outline-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/25"
              placeholder="Describe your menu item..."
            />
            {errors.description ? (
              <p className="mt-2 text-sm text-destructive">
                {errors.description}
              </p>
            ) : null}
          </div>

          {/* Price + Location */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-price"
                className="mb-2 block text-sm font-medium"
              >
                Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  $
                </span>
                <input
                  id="edit-price"
                  type="text"
                  inputMode="decimal"
                  value={values.price}
                  onChange={(e) => update("price", e.target.value)}
                  aria-invalid={Boolean(errors.price)}
                  className="h-11 w-full rounded-lg border border-border/70 bg-background/70 pl-10 pr-3 text-sm outline-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/25"
                  placeholder="0.00"
                />
              </div>
              {errors.price ? (
                <p className="mt-2 text-sm text-destructive">{errors.price}</p>
              ) : null}
            </div>
            <div>
              <label
                htmlFor="edit-location"
                className="mb-2 block text-sm font-medium"
              >
                Location
              </label>
              <input
                id="edit-location"
                type="text"
                autoComplete="off"
                value={values.location}
                onChange={(e) => update("location", e.target.value)}
                aria-invalid={Boolean(errors.location)}
                className={inputClass}
                placeholder="e.g. New York, NY"
              />
              {errors.location ? (
                <p className="mt-2 text-sm text-destructive">
                  {errors.location}
                </p>
              ) : null}
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Item image
            </label>
            <ProfileImageUpload
              value={values.image ?? null}
              disabled={isSubmitting || isImageUploading}
              onUploadingChange={setIsImageUploading}
              onChange={(url) => update("image", url ?? "")}
              endpoint="/api/menu/images"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => !isSubmitting && onClose()}
              disabled={isSubmitting}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isImageUploading}
              className={cn(
                "h-8 gap-1.5 px-2.5 inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-medium whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50",
                "hover:from-primary/90 hover:to-primary/70"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              Save changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Menu item card ───────────────────────────────────────────────────────────

type MenuItemCardProps = {
  item: MenuItem
  index: number
  reduceMotion: boolean | null
  onEdit: (item: MenuItem) => void
  onDelete: (item: MenuItem) => void
  onToggleAvailability: (item: MenuItem) => void
  isTogglingId: string | null
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

function MenuItemCard({
  item,
  index,
  reduceMotion,
  onEdit,
  onDelete,
  onToggleAvailability,
  isTogglingId,
}: MenuItemCardProps) {
  const [imageFailed, setImageFailed] = React.useState(false)
  const image = item.images[0]
  const isActive = item.status === "approved"
  const isInactive = item.status === "inactive"
  const isToggling = isTogglingId === item._id
  const canToggle = isActive || isInactive

  return (
    <motion.div
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
        {/* Image */}
        <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:h-24 sm:w-24">
          {image && !imageFailed ? (
            <Image
              src={image}
              alt={item.itemName}
              fill
              sizes="(min-width: 640px) 96px, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              <Pizza className="size-8" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-2">
            <span className="inline-flex rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
              {item.category}
            </span>
            <StatusBadge status={item.status} />
          </div>
          <h3 className="mt-2 truncate font-heading text-base font-semibold tracking-tight">
            {item.itemName}
          </h3>
          <p className="mt-0.5 font-heading text-lg font-bold text-primary">
            {formatPrice(item.price)}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {item.description}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{item.location}</p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
          {/* View details – only for approved items */}
          {isActive ? (
            <Link
              href={`/menu/${item._id}`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-sm" }),
                "shrink-0"
              )}
              aria-label={`View ${item.itemName} on public menu`}
              title="View on public menu"
            >
              <Eye className="size-4" aria-hidden="true" />
            </Link>
          ) : null}

          {/* Toggle availability – approved ↔ inactive */}
          {canToggle ? (
            <button
              type="button"
              onClick={() => onToggleAvailability(item)}
              disabled={isToggling}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-sm" }),
                "shrink-0",
                isActive
                  ? "text-emerald-600 hover:text-emerald-700"
                  : "text-muted-foreground"
              )}
              aria-label={
                isActive
                  ? `Mark ${item.itemName} as inactive`
                  : `Mark ${item.itemName} as active`
              }
              title={isActive ? "Mark inactive" : "Mark active"}
            >
              {isToggling ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : isActive ? (
                <ToggleRight className="size-4" aria-hidden="true" />
              ) : (
                <ToggleLeft className="size-4" aria-hidden="true" />
              )}
            </button>
          ) : null}

          {/* Edit */}
          <button
            type="button"
            onClick={() => onEdit(item)}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "shrink-0"
            )}
            aria-label={`Edit ${item.itemName}`}
            title="Edit item"
          >
            <Edit className="size-4" aria-hidden="true" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDelete(item)}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            )}
            aria-label={`Delete ${item.itemName}`}
            title="Delete item"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type ViewStatus = "loading" | "success" | "empty" | "error"

export function VendorMenuItems() {
  const reduceMotion = useReducedMotion()
  const { toast } = useToast()

  const [items, setItems] = React.useState<MenuItem[]>([])
  const [status, setStatus] = React.useState<ViewStatus>("loading")
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)

  const [editingItem, setEditingItem] = React.useState<MenuItem | null>(null)
  const [deletingItem, setDeletingItem] = React.useState<MenuItem | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [togglingId, setTogglingId] = React.useState<string | null>(null)
  const [availabilityItem, setAvailabilityItem] =
    React.useState<MenuItem | null>(null)
  const [isTogglingAvailability, setIsTogglingAvailability] =
    React.useState(false)

  React.useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setStatus("loading")
      setError(null)
      try {
        const result = await fetchVendorMenuItems(controller.signal)
        setItems(result)
        setStatus(result.length === 0 ? "empty" : "success")
      } catch (err) {
        if (controller.signal.aborted) return
        setError(
          err instanceof Error ? err.message : "Unable to load menu items"
        )
        setStatus("error")
      }
    }

    void load()
    return () => controller.abort()
  }, [reloadKey])

  // ── Delete handler ──────────────────────────────────────────────────────────
  async function handleConfirmDelete() {
    if (!deletingItem) return
    setIsDeleting(true)
    try {
      await deleteMenuItem(deletingItem._id)
      setItems((prev) => prev.filter((it) => it._id !== deletingItem._id))
      toast({
        variant: "success",
        title: "Menu item deleted",
        description: `${deletingItem.itemName} has been removed.`,
      })
      if (items.length - 1 === 0) setStatus("empty")
    } catch (err) {
      toast({
        variant: "error",
        title: "Delete failed",
        description:
          err instanceof Error
            ? err.message
            : "Unable to delete this item. Please try again.",
      })
    } finally {
      setIsDeleting(false)
      setDeletingItem(null)
    }
  }

  // ── Availability toggle handler ─────────────────────────────────────────────
  async function handleConfirmToggle() {
    if (!availabilityItem) return
    const isCurrentlyActive = availabilityItem.status === "approved"
    setIsTogglingAvailability(true)
    setTogglingId(availabilityItem._id)
    try {
      // PATCH /api/menu/:id/availability with { available: boolean }
      const { fetchWithAuth } = await import("@/lib/api")
      const response = await fetchWithAuth<MenuItem>(
        `/api/menu/${availabilityItem._id}/availability`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ available: !isCurrentlyActive }),
        }
      )
      const updated = response.data
      setItems((prev) =>
        prev.map((it) => (it._id === updated._id ? updated : it))
      )
      toast({
        variant: "success",
        title: isCurrentlyActive
          ? "Item marked inactive"
          : "Item marked active",
        description: `${updated.itemName} is now ${updated.status}.`,
      })
    } catch (err) {
      toast({
        variant: "error",
        title: "Failed to update availability",
        description:
          err instanceof Error
            ? err.message
            : "Unable to update availability. Please try again.",
      })
    } finally {
      setIsTogglingAvailability(false)
      setTogglingId(null)
      setAvailabilityItem(null)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <section aria-labelledby="vendor-menu-items-heading">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Vendor dashboard
            </p>
            <h1
              id="vendor-menu-items-heading"
              className="mt-3 font-heading text-3xl font-bold tracking-tight"
            >
              My menu items
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              View and manage the menu items you have submitted. Rejected items
              are never shown to customers.
            </p>
          </div>

          <Link
            href="/dashboard/vendor/menu-items/new"
            className={cn(buttonVariants(), "self-start shadow-soft")}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add item
          </Link>
        </div>

        {/* Body */}
        <div className="mt-8">
          {status === "loading" && <MenuItemsSkeleton />}

          {status === "error" && (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
              <AlertCircle
                className="size-10 text-destructive"
                aria-hidden="true"
              />
              <h2 className="mt-4 font-heading text-lg font-semibold">
                Could not load your menu items
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {error ?? "Please try again in a moment."}
              </p>
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className={cn(buttonVariants({ variant: "outline" }), "mt-6")}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Try again
              </button>
            </div>
          )}

          {status === "empty" && (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/60 px-6 py-12 text-center">
              <Pizza
                className="size-10 text-muted-foreground"
                aria-hidden="true"
              />
              <h2 className="mt-4 font-heading text-lg font-semibold">
                No menu items yet
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Add your first menu item. It will be reviewed before appearing
                to customers.
              </p>
              <Link
                href="/dashboard/vendor/menu-items/new"
                className={cn(buttonVariants(), "mt-6 shadow-soft")}
              >
                <Plus className="size-4" aria-hidden="true" />
                Add menu item
              </Link>
            </div>
          )}

          {status === "success" && (
            <motion.div
              className="space-y-4"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Summary row */}
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span>
                  <strong className="text-foreground">{items.length}</strong>{" "}
                  total
                </span>
                <span>
                  <strong className="text-emerald-600">
                    {items.filter((i) => i.status === "approved").length}
                  </strong>{" "}
                  approved
                </span>
                <span>
                  <strong className="text-amber-600">
                    {items.filter((i) => i.status === "pending").length}
                  </strong>{" "}
                  pending
                </span>
                <span>
                  <strong className="text-destructive">
                    {items.filter((i) => i.status === "rejected").length}
                  </strong>{" "}
                  rejected
                </span>
              </div>

              {/* Cards */}
              {items.map((item, index) => (
                <MenuItemCard
                  key={item._id}
                  item={item}
                  index={index}
                  reduceMotion={reduceMotion}
                  onEdit={setEditingItem}
                  onDelete={setDeletingItem}
                  onToggleAvailability={setAvailabilityItem}
                  isTogglingId={togglingId}
                />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Edit modal */}
      {editingItem ? (
        <EditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={(updated) => {
            setItems((prev) =>
              prev.map((it) => (it._id === updated._id ? updated : it))
            )
            setEditingItem(null)
          }}
        />
      ) : null}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={Boolean(deletingItem)}
        title="Delete menu item"
        description={
          deletingItem
            ? `Are you sure you want to permanently delete "${deletingItem.itemName}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItem(null)}
        isLoading={isDeleting}
        variant="destructive"
      />

      {/* Availability confirmation */}
      <ConfirmDialog
        open={Boolean(availabilityItem)}
        title={
          availabilityItem?.status === "approved"
            ? "Mark item as inactive"
            : "Mark item as active"
        }
        description={
          availabilityItem?.status === "approved"
            ? `"${availabilityItem?.itemName}" will be hidden from the public menu until you reactivate it.`
            : `"${availabilityItem?.itemName}" will be visible to customers again.`
        }
        confirmLabel={
          availabilityItem?.status === "approved"
            ? "Mark inactive"
            : "Mark active"
        }
        onConfirm={handleConfirmToggle}
        onCancel={() => setAvailabilityItem(null)}
        isLoading={isTogglingAvailability}
      />
    </>
  )
}
