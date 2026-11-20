"use client"

import * as React from "react"
import Link from "next/link"
import { AlertCircle, CheckCircle2, Clock, Package, RefreshCw, ShoppingCart, XCircle } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import {
  AnimatedCounter,
  PremiumSkeleton,
  TiltCard,
} from "@/components/premium-ui"
import { fetchCustomerDashboard, type CustomerDashboardData } from "@/lib/api"
import { useToast } from "@/components/toast-provider"

type Status = "loading" | "success" | "empty" | "error"

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  index,
  reduceMotion,
}: {
  label: string
  value: number
  hint: string
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: "true" }>
  index: number
  reduceMotion: boolean | null
}) {
  return (
    <TiltCard
      className="relative overflow-hidden p-5"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: reduceMotion ? 0 : index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-3 font-heading text-3xl font-bold tracking-tight tabular-nums">
            <AnimatedCounter value={value} />
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-tomato/12 to-brand-orange/16 text-brand-orange">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
    </TiltCard>
  )
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <PremiumSkeleton key={index} className="h-36 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

export function CustomerOverview() {
  const reduceMotion = useReducedMotion()
  const [data, setData] = React.useState<CustomerDashboardData | null>(null)
  const [status, setStatus] = React.useState<Status>("loading")
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)

  React.useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        setStatus("loading")
        setError(null)
        const result = await fetchCustomerDashboard(controller.signal)
        setData(result)
        const hasActivity =
          result.totalOrders > 0
        setStatus(hasActivity ? "success" : "empty")
      } catch (caughtError) {
        if (controller.signal.aborted) return
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load dashboard data"
        )
        setStatus("error")
      }
    }

    void load()
    return () => controller.abort()
  }, [reloadKey])

  if (status === "loading") {
    return <OverviewSkeleton />
  }

  if (status === "error") {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
        <AlertCircle className="size-10 text-destructive" aria-hidden="true" />
        <h2 className="mt-4 font-heading text-lg font-semibold">
          Could not load dashboard data
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
    )
  }

  if (status === "empty" || !data) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/60 px-6 py-12 text-center">
        <ShoppingCart className="size-10 text-muted-foreground" aria-hidden="true" />
        <h2 className="mt-4 font-heading text-lg font-semibold">
          No orders yet
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Browse the menu and place your first order to see it here.
        </p>
        <Link
          href="/menu"
          className={cn(buttonVariants(), "mt-6 shadow-soft")}
        >
          Browse menu
        </Link>
      </div>
    )
  }

  const stats = [
    {
      label: "Total orders",
      value: data.totalOrders,
      hint: "All orders you have placed",
      icon: Package,
    },
    {
      label: "Pending orders",
      value: data.pendingOrders,
      hint: "Waiting for vendor response",
      icon: Clock,
    },
    {
      label: "Accepted orders",
      value: data.acceptedOrders,
      hint: "Confirmed by the vendor",
      icon: CheckCircle2,
    },
    {
      label: "Rejected orders",
      value: data.rejectedOrders,
      hint: "Declined by the vendor",
      icon: XCircle,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            hint={stat.hint}
            icon={stat.icon}
            index={index}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>

      <motion.div
        className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-card backdrop-blur-sm sm:p-8"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          Manage your orders
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          View delivery details, messages, and cancel pending orders.
        </p>
        <Link
          href="/dashboard/customer/orders"
          className={cn(buttonVariants(), "mt-6 shadow-soft")}
        >
          My orders
        </Link>
      </motion.div>
    </div>
  )
}