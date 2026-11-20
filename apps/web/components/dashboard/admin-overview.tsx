"use client"

import * as React from "react"
import Link from "next/link"
import { AlertCircle, CreditCard, Pizza, RefreshCw, ShieldCheck, Users } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { fetchAdminDashboard, type AdminDashboardData } from "@/lib/api"
import { useToast } from "@/components/toast-provider"

type Status = "loading" | "success" | "error"

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
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-5 shadow-card backdrop-blur-sm"
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
            {value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
    </motion.div>
  )
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-36 animate-pulse rounded-2xl border border-border/70 bg-muted/60"
        />
      ))}
    </div>
  )
}

export function AdminOverview() {
  const reduceMotion = useReducedMotion()
  const [data, setData] = React.useState<AdminDashboardData | null>(null)
  const [status, setStatus] = React.useState<Status>("loading")
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)

  React.useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setStatus("loading")
      setError(null)
      try {
        const result = await fetchAdminDashboard(controller.signal)
        setData(result)
        setStatus("success")
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

  const stats = [
    {
      label: "Total users",
      value: data?.totalUsers ?? 0,
      hint: "All registered accounts",
      icon: Users,
    },
    {
      label: "Vendors",
      value: data?.vendors ?? 0,
      hint: "Registered vendors",
      icon: ShieldCheck,
    },
    {
      label: "Customers",
      value: data?.customers ?? 0,
      hint: "Registered customers",
      icon: Users,
    },
    {
      label: "Total menu items",
      value: data?.totalMenuItems ?? 0,
      hint: "Across all vendors",
      icon: Pizza,
    },
    {
      label: "Pending approvals",
      value: data?.pendingMenuItems ?? 0,
      hint: "Awaiting admin review",
      icon: AlertCircle,
    },
    {
      label: "Transactions",
      value: data?.totalTransactions ?? 0,
      hint: "Recorded payments",
      icon: CreditCard,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Admin dashboard
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight">
          Platform overview
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Monitor users, menu items, and transactions across Pizzabari.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/admin/users"
          className={cn(buttonVariants({ variant: "outline" }), "h-auto justify-start p-4")}
        >
          <Users className="size-5" aria-hidden="true" />
          Manage users
        </Link>
        <Link
          href="/dashboard/admin/menu-items"
          className={cn(buttonVariants({ variant: "outline" }), "h-auto justify-start p-4")}
        >
          <Pizza className="size-5" aria-hidden="true" />
          Manage menu items
        </Link>
        <Link
          href="/dashboard/admin/transactions"
          className={cn(buttonVariants({ variant: "outline" }), "h-auto justify-start p-4")}
        >
          <CreditCard className="size-5" aria-hidden="true" />
          View transactions
        </Link>
      </div>
    </div>
  )
}