"use client"

import * as React from "react"
import { Crown } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@workspace/ui/lib/utils"

export function PremiumCrown({
  className,
  tooltipPlacement = "top",
}: {
  className?: string
  tooltipPlacement?: "top" | "bottom"
}) {
  const reduceMotion = useReducedMotion()
  const tooltipId = React.useId()

  return (
    <span
      role="img"
      aria-label="Premium vendor"
      aria-describedby={tooltipId}
      tabIndex={0}
      className={cn(
        "group/premium relative z-20 inline-flex size-5 shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--premium-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <motion.span
        aria-hidden="true"
        animate={
          reduceMotion ? undefined : { y: [0, -2, 0], rotate: [-4, 4, -4] }
        }
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        className="relative grid size-full place-items-center rounded-full border border-[var(--premium-gold-soft)] premium-gold-surface shadow-[0_0_0_1px_var(--premium-gold-deep),0_4px_14px_var(--premium-glow)]"
      >
        <Crown
          className="size-3 fill-[var(--premium-gold-soft)] text-[var(--premium-gold-ink)]"
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <span className="premium-crown-shine pointer-events-none absolute inset-0 overflow-hidden rounded-full">
          <span
            className="absolute inset-y-0 -left-1/2 w-1/2 animate-[premium-crown-shine_4.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent"
            aria-hidden="true"
          />
        </span>
      </motion.span>

      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-[70] w-max -translate-x-1/2 rounded-xl border border-[var(--premium-gold-border)] bg-[var(--premium-tooltip)] px-2.5 py-2 text-center opacity-0 shadow-elevated backdrop-blur-xl transition-all duration-200 ease-out",
          "translate-y-1 group-hover/premium:translate-y-0 group-hover/premium:opacity-100 group-focus-visible/premium:translate-y-0 group-focus-visible/premium:opacity-100",
          tooltipPlacement === "top" ? "bottom-full mb-2" : "top-full mt-2"
        )}
      >
        <span className="block text-[10px] font-extrabold tracking-[0.14em] text-[var(--premium-gold-soft)] uppercase">
          Premium Vendor
        </span>
        <span className="mt-0.5 block text-[10px] font-normal text-[var(--premium-gold)]">
          Active subscription
        </span>
      </span>
    </span>
  )
}

export function PremiumVendorBadge({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md border border-[var(--premium-gold-border)] premium-gold-surface px-2 py-[3px] text-[9px] font-extrabold tracking-[0.12em] text-[var(--premium-gold-ink)] uppercase shadow-[0_2px_10px_var(--premium-glow)]",
        compact && "px-1.5 text-[8px]",
        className
      )}
    >
      {compact ? "Premium" : "Premium Vendor"}
    </span>
  )
}

/** Inline crown + label for cards, tables and profile rows. */
export function PremiumVendorChip({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--premium-gold-border)] bg-[var(--premium-gold-wash)] px-2.5 py-1 text-[10px] font-extrabold tracking-[0.1em] text-[var(--premium-gold)] uppercase shadow-[0_2px_12px_var(--premium-glow)]",
        compact && "px-2 py-0.5 text-[9px]",
        className
      )}
    >
      <Crown className="size-3 fill-[var(--premium-gold-wash)]" aria-hidden="true" />
      {compact ? "Premium" : "Premium Vendor"}
    </span>
  )
}
