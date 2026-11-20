"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  Flame,
  MapPin,
  Pizza,
  ShoppingBag,
  Star,
  Store,
} from "lucide-react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { PremiumSkeleton } from "@/components/premium-ui"
import { PremiumVendorChip } from "@/components/premium-vendor-mark"
import { useToast } from "@/components/toast-provider"
import type { MenuItem, VendorProfile } from "@/lib/api"
import { addCartItem } from "@/lib/cart"
import { isActivePremiumSubscription } from "@/lib/subscription"

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const DEFAULT_SIZES =
  "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"

/**
 * The API currently sends the MenuItem fields only. Optional merchandising
 * fields are accepted defensively so badges never show invented data.
 */
type PizzaCardItem = MenuItem & {
  rating?: number | null
  reviewCount?: number | null
  compareAtPrice?: number | null
  discountPercent?: number | null
  isPopular?: boolean | null
  featured?: boolean | null
  badge?: string | null
}

type PizzaCardProps = {
  item: MenuItem
  vendor?: VendorProfile
  index?: number
  sizes?: string
  className?: string
}

export function formatPizzaPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)
}

function readMerchandisingData(item: MenuItem) {
  const data = item as PizzaCardItem
  const price = Number.isFinite(item.price) ? item.price : 0

  const rating =
    typeof data.rating === "number" &&
    Number.isFinite(data.rating) &&
    data.rating >= 0 &&
    data.rating <= 5
      ? data.rating
      : null

  const reviewCount =
    typeof data.reviewCount === "number" &&
    Number.isFinite(data.reviewCount) &&
    data.reviewCount >= 0
      ? Math.floor(data.reviewCount)
      : null

  const compareAtPrice =
    typeof data.compareAtPrice === "number" &&
    Number.isFinite(data.compareAtPrice) &&
    data.compareAtPrice > price
      ? data.compareAtPrice
      : null

  const explicitDiscount =
    typeof data.discountPercent === "number" &&
    Number.isFinite(data.discountPercent) &&
    data.discountPercent > 0 &&
    data.discountPercent <= 100
      ? Math.round(data.discountPercent)
      : null

  const derivedDiscount = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null

  const discountPercent =
    explicitDiscount ??
    (derivedDiscount && derivedDiscount > 0 ? derivedDiscount : null)

  const badge =
    typeof data.badge === "string" && data.badge.trim().length > 0
      ? data.badge.trim()
      : null

  return {
    rating,
    reviewCount,
    compareAtPrice,
    discountPercent,
    isPopular: Boolean(data.isPopular || data.featured),
    badge,
  }
}

export function PizzaCard({
  item,
  vendor,
  index = 0,
  sizes = DEFAULT_SIZES,
  className,
}: PizzaCardProps) {
  const image = item.images?.[0]
  const reduceMotion = useReducedMotion()
  const { toast } = useToast()
  const [imageFailed, setImageFailed] = React.useState(false)
  const [isAdded, setIsAdded] = React.useState(false)
  const addResetTimer = React.useRef<number | null>(null)

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const smoothX = useSpring(pointerX, { stiffness: 190, damping: 24 })
  const smoothY = useSpring(pointerY, { stiffness: 190, damping: 24 })

  const cardRotateX = useTransform(smoothY, [-0.5, 0.5], [3.5, -3.5])
  const cardRotateY = useTransform(smoothX, [-0.5, 0.5], [-3.5, 3.5])
  const imageRotateX = useTransform(smoothY, [-0.5, 0.5], [9, -9])
  const imageRotateY = useTransform(smoothX, [-0.5, 0.5], [-9, 9])
  const imageShiftX = useTransform(smoothX, [-0.5, 0.5], [6, -6])
  const imageShiftY = useTransform(smoothY, [-0.5, 0.5], [4, -4])

  const merchandising = readMerchandisingData(item)

  const badges = [
    merchandising.isPopular ? "Popular" : null,
    merchandising.discountPercent
      ? `Save ${merchandising.discountPercent}%`
      : null,
    merchandising.badge,
  ].filter((value): value is string => Boolean(value))

  React.useEffect(
    () => () => {
      if (addResetTimer.current !== null) {
        window.clearTimeout(addResetTimer.current)
      }
    },
    []
  )

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (reduceMotion || event.pointerType !== "mouse") return

    const rect = event.currentTarget.getBoundingClientRect()
    if (!rect.width || !rect.height) return

    pointerX.set((event.clientX - rect.left) / rect.width - 0.5)
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5)
  }

  function handlePointerLeave() {
    pointerX.set(0)
    pointerY.set(0)
  }

  function handleAddToCart() {
    try {
      const { count } = addCartItem({
        id: item._id,
        name: item.itemName,
        price: item.price,
        image: image ?? null,
        category: item.category ?? null,
      })

      setIsAdded(true)
      if (addResetTimer.current !== null) {
        window.clearTimeout(addResetTimer.current)
      }
      addResetTimer.current = window.setTimeout(() => setIsAdded(false), 1500)

      toast({
        variant: "success",
        title: "Added to cart",
        description: `${item.itemName} · ${count} item${count === 1 ? "" : "s"} in your cart`,
      })
    } catch {
      toast({
        variant: "error",
        title: "Unable to add to cart",
        description: "Your browser blocked local storage. Please try again.",
      })
    }
  }

  const cardMotionStyle = reduceMotion
    ? undefined
    : {
        rotateX: cardRotateX,
        rotateY: cardRotateY,
        transformPerspective: 1100,
        transformStyle: "preserve-3d" as const,
      }

  const imageMotionStyle = reduceMotion
    ? undefined
    : {
        rotateX: imageRotateX,
        rotateY: imageRotateY,
        x: imageShiftX,
        y: imageShiftY,
        transformStyle: "preserve-3d" as const,
      }

  return (
    <motion.article
      className={cn(
        "pizza-card premium-card group flex h-full flex-col overflow-hidden rounded-3xl",
        className
      )}
      style={cardMotionStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.55,
        delay: reduceMotion ? 0 : (index % 4) * 0.08,
        ease: EASE,
      }}
      whileHover={
        reduceMotion
          ? undefined
          : { y: -6, transition: { duration: 0.3, ease: EASE, delay: 0 } }
      }
      whileTap={
        reduceMotion
          ? undefined
          : { scale: 0.99, transition: { duration: 0.18, ease: EASE, delay: 0 } }
      }
    >
      <div className="pizza-card-image-stage relative aspect-[4/3] w-full overflow-hidden">
        <div
          aria-hidden="true"
          className="pizza-card-glow absolute inset-x-8 bottom-4 h-14 rounded-full"
        />

        <motion.div
          aria-hidden="true"
          className="pizza-card-image-tilt absolute inset-0"
          style={imageMotionStyle}
        >
          <div className="pizza-card-float absolute inset-0">
            {image && !imageFailed ? (
              <Image
                src={image}
                alt={item.itemName}
                fill
                sizes={sizes}
                quality={85}
                className="pizza-card-image object-cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="grid h-full place-items-center text-muted-foreground">
                <Pizza className="size-12 opacity-70" aria-hidden="true" />
              </div>
            )}
          </div>
        </motion.div>

        <div aria-hidden="true" className="pizza-card-overlay absolute inset-0" />

        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3">
          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className={cn(
                    "pizza-card-badge inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.08em] uppercase",
                    badge === "Popular" && "text-brand-orange"
                  )}
                >
                  {badge === "Popular" ? (
                    <Flame className="size-3" aria-hidden="true" />
                  ) : null}
                  {badge}
                </span>
              ))}
            </div>
          ) : (
            <span />
          )}

          {merchandising.rating !== null ? (
            <span
              className="pizza-card-rating inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
              aria-label={`Rated ${merchandising.rating.toFixed(1)} out of 5${
                merchandising.reviewCount !== null
                  ? ` from ${merchandising.reviewCount} reviews`
                  : ""
              }`}
            >
              <Star className="size-3.5 fill-current" aria-hidden="true" />
              <span>{merchandising.rating.toFixed(1)}</span>
              {merchandising.reviewCount !== null ? (
                <span className="opacity-70">({merchandising.reviewCount})</span>
              ) : null}
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {item.category ? (
              <span className="pizza-card-category inline-flex max-w-full truncate rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] uppercase">
                {item.category}
              </span>
            ) : null}
            <h3 className="mt-2 line-clamp-2 font-heading text-xl font-semibold tracking-tight">
              {item.itemName}
            </h3>
          </div>

          <div className="shrink-0 text-right">
            <p className="font-heading text-xl font-bold tracking-tight text-primary">
              {formatPizzaPrice(item.price)}
            </p>
            {merchandising.compareAtPrice !== null ? (
              <p className="text-xs text-muted-foreground line-through">
                {formatPizzaPrice(merchandising.compareAtPrice)}
              </p>
            ) : null}
          </div>
        </div>

        <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>

        <div className="mt-auto space-y-2 border-t border-border/60 pt-3">
          {item.location ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0 text-brand-orange" aria-hidden="true" />
              <span className="truncate">{item.location}</span>
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
            <Store className="size-3.5 shrink-0 text-brand-orange" aria-hidden="true" />
            <span className="truncate">
              {vendor?.businessName || vendor?.name || "Vendor unavailable"}
            </span>
            {vendor && isActivePremiumSubscription(vendor) ? (
              <PremiumVendorChip compact />
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`Add ${item.itemName} to cart`}
            className={cn(
              "pizza-card-add inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold tracking-wide text-primary-foreground outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
          >
            {isAdded ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <ShoppingBag className="size-4" aria-hidden="true" />
            )}
            <span>{isAdded ? "Added" : "Add to cart"}</span>
          </button>

          <Link
            href={`/menu/${item._id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pizza-card-details h-9 w-full text-xs"
            )}
            aria-label={`View details for ${item.itemName}`}
          >
            View details
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

export function PizzaCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("pizza-card premium-card overflow-hidden rounded-3xl", className)}>
      <div className="pizza-card-image-stage aspect-[4/3] w-full" />
      <div className="space-y-3 p-5 sm:p-6">
        <PremiumSkeleton className="h-4 w-1/3 rounded-full" />
        <PremiumSkeleton className="h-6 w-2/3 rounded" />
        <PremiumSkeleton className="h-4 w-full rounded" />
        <PremiumSkeleton className="h-4 w-4/5 rounded" />
        <PremiumSkeleton className="h-11 rounded-xl" />
        <PremiumSkeleton className="h-9 rounded-xl" />
      </div>
    </div>
  )
}
