"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowUpRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Crown,
  Pizza,
  RefreshCw,
} from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import type { LucideIcon } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { PremiumVendorChip } from "@/components/premium-vendor-mark"
import {
  AnimatedCounter,
  PremiumSkeleton,
  TiltCard,
} from "@/components/premium-ui"
import {
  fetchVendorDashboard,
  type CategoryBreakdownEntry,
  type DailyOrderPoint,
  type VendorDashboardData,
} from "@/lib/api"
import { isActivePremiumSubscription } from "@/lib/subscription"

type Status = "loading" | "success" | "empty" | "error"

type RangeDays = 7 | 30

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

const TOOLTIP_STYLE: React.CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  color: "var(--card-foreground)",
  fontSize: "0.75rem",
  boxShadow: "var(--elevation-card)",
}

function formatChartDay(value: string) {
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

function ChartCard({
  title,
  description,
  action,
  children,
}: {
  title: string
  description: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-card backdrop-blur-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  )
}

function RangeToggle({
  value,
  onChange,
}: {
  value: RangeDays
  onChange: (value: RangeDays) => void
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/60 p-1">
      {([7, 30] as const).map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => onChange(range)}
          aria-pressed={value === range}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            value === range
              ? "bg-primary text-primary-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {range} days
        </button>
      ))}
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
      No data yet
    </div>
  )
}

function DailyOrdersChart({
  series,
  range,
  reduceMotion,
}: {
  series: DailyOrderPoint[]
  range: RangeDays
  reduceMotion: boolean | null
}) {
  const points = series.slice(-range)

  if (points.length === 0 || points.every((point) => point.orders === 0)) {
    return <EmptyChart />
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatChartDay}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            minTickGap={16}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: "var(--foreground)" }}
            labelFormatter={(label) => formatChartDay(String(label))}
          />
          <Bar
            dataKey="orders"
            name="Orders"
            fill="var(--chart-1)"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
            isAnimationActive={!reduceMotion}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function CategoryDonut({
  entries,
  reduceMotion,
}: {
  entries: CategoryBreakdownEntry[]
  reduceMotion: boolean | null
}) {
  const slices = entries.filter((entry) => entry.orders > 0)
  const total = slices.reduce((sum, entry) => sum + entry.orders, 0)

  if (total === 0) {
    return <EmptyChart />
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="h-56 w-full sm:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Pie
              data={slices}
              dataKey="orders"
              nameKey="category"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={2}
              isAnimationActive={!reduceMotion}
            >
              {slices.map((entry, index) => (
                <Cell
                  key={entry.category}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full space-y-2 sm:w-1/2">
        {slices.map((entry, index) => (
          <li
            key={entry.category}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                }}
              />
              <span className="truncate">{entry.category}</span>
            </span>
            <span className="shrink-0 font-medium tabular-nums">
              {entry.orders}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

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
  icon: LucideIcon
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
      <PremiumSkeleton className="h-44 rounded-2xl" />
    </div>
  )
}

export function VendorOverview() {
  const reduceMotion = useReducedMotion()
  const [data, setData] = React.useState<VendorDashboardData | null>(null)
  const [status, setStatus] = React.useState<Status>("loading")
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)
  const [range, setRange] = React.useState<RangeDays>(7)

  React.useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        setStatus("loading")
        setError(null)
        const result = await fetchVendorDashboard(controller.signal)

        setData(result)
        const hasActivity =
          result.totalMenuItems > 0 ||
          result.pendingOrders > 0 ||
          result.acceptedOrders > 0

        setStatus(hasActivity ? "success" : "empty")
      } catch (caughtError) {
        if (controller.signal.aborted) {
          return
        }
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
        <Pizza className="size-10 text-muted-foreground" aria-hidden="true" />
        <h2 className="mt-4 font-heading text-lg font-semibold">
          Your kitchen is quiet for now
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Add your first menu item to start receiving orders from Pizzabari
          customers.
        </p>
        <Link
          href="/dashboard/vendor/menu-items/new"
          className={cn(buttonVariants(), "mt-6 shadow-soft")}
        >
          Add menu item
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    )
  }

  const stats = [
    {
      label: "Total menu items",
      value: data.totalMenuItems,
      hint: "All items you have published",
      icon: Pizza,
    },
    {
      label: "Active menu items",
      value: data.activeMenuItems,
      hint: "Approved and visible to customers",
      icon: BadgeCheck,
    },
    {
      label: "Pending orders",
      value: data.pendingOrders,
      hint: "Waiting for your response",
      icon: Clock,
    },
    {
      label: "Accepted orders",
      value: data.acceptedOrders,
      hint: "Confirmed and being prepared",
      icon: CheckCircle2,
    },
  ]

  const isPremium = isActivePremiumSubscription(data)

  const dailyOrders = data.dailyOrders ?? []
  const categoryBreakdown = data.categoryBreakdown ?? []

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

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Daily orders"
          description={`Orders placed over the last ${range} days.`}
          action={<RangeToggle value={range} onChange={setRange} />}
        >
          <DailyOrdersChart
            series={dailyOrders}
            range={range}
            reduceMotion={reduceMotion}
          />
        </ChartCard>
        <ChartCard
          title="Orders by category"
          description="How your orders split across menu categories."
        >
          <CategoryDonut
            entries={categoryBreakdown}
            reduceMotion={reduceMotion}
          />
        </ChartCard>
      </div>

      <motion.div
        className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-6 shadow-card backdrop-blur-sm sm:p-8"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: reduceMotion ? 0 : 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-16 size-56 rounded-full bg-primary/8 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Subscription
            </p>
            <h2 className="mt-2 flex flex-wrap items-center gap-2 font-heading text-2xl font-bold tracking-tight capitalize">
              {isPremium ? (
                <Crown
                  className="size-6 text-[var(--premium-gold)]"
                  aria-hidden="true"
                />
              ) : (
                <BadgeCheck
                  className="size-6 text-primary"
                  aria-hidden="true"
                />
              )}
              {data.subscriptionPlan} plan
              {isPremium ? <PremiumVendorChip compact /> : null}
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {isPremium
                ? "Your premium benefits are active."
                : "Upgrade to premium for unlimited active menu items and featured placement."}
            </p>
          </div>

          <Link
            href="/dashboard/vendor/subscription"
            className={cn(
              buttonVariants({ variant: isPremium ? "outline" : "default" }),
              "self-start shadow-soft sm:self-auto"
            )}
          >
            {isPremium ? "Manage subscription" : "Upgrade to premium"}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
