import * as React from "react"
import { CheckCircle2, Clock, Package, XCircle } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import type { OrderStatus } from "@/lib/api"

type TimelineStep = {
  label: string
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: "true" }>
  state: "complete" | "current" | "terminal"
  tone: "primary" | "success" | "danger" | "muted"
}

function formatDate(value?: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getSteps(status: OrderStatus): TimelineStep[] {
  const placed: TimelineStep = {
    label: "Order placed",
    icon: Package,
    state: "complete",
    tone: "primary",
  }

  switch (status) {
    case "pending":
      return [
        placed,
        { label: "Pending review", icon: Clock, state: "current", tone: "primary" },
      ]
    case "accepted":
      return [
        placed,
        { label: "Accepted", icon: CheckCircle2, state: "complete", tone: "success" },
      ]
    case "rejected":
      return [
        placed,
        { label: "Rejected", icon: XCircle, state: "terminal", tone: "danger" },
      ]
    case "cancelled":
      return [
        placed,
        { label: "Cancelled", icon: XCircle, state: "terminal", tone: "muted" },
      ]
    default:
      return [placed]
  }
}

const TONE_CLASSES: Record<TimelineStep["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  danger: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  muted: "bg-muted text-muted-foreground",
}

type OrderStatusTimelineProps = {
  status: OrderStatus
  createdAt?: string
  className?: string
}

export function OrderStatusTimeline({
  status,
  createdAt,
  className,
}: OrderStatusTimelineProps) {
  const steps = getSteps(status)
  const placedDate = formatDate(createdAt)

  return (
    <ol
      className={cn("flex flex-col gap-3", className)}
      aria-label="Order status timeline"
    >
      {steps.map((step, index) => {
        const Icon = step.icon
        const isLast = index === steps.length - 1
        return (
          <li key={step.label} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full",
                  TONE_CLASSES[step.tone]
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className="mt-1 h-6 w-px bg-border/70"
                />
              ) : null}
            </div>
            <div className="min-w-0 pt-1">
              <p className="text-sm font-medium">{step.label}</p>
              {index === 0 && placedDate ? (
                <p className="text-xs text-muted-foreground">{placedDate}</p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}