"use client"

import * as React from "react"
import Link from "next/link"
import { AlertCircle, CheckCircle2, Clock, Package, RefreshCw, ShoppingCart, XCircle } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
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

import {
  AnimatedCounter,
  PremiumSkeleton,
  TiltCard,
} from "@/components/premium-ui"
import {
  fetchCustomerDashboard,
  type CustomerDashboardData,
  type DailyOrderPoint,
} from "@/lib/api"
import { useToast } from "@/components/toast-provider"

type Status = "loading" | "success" | "empty" | "error"

type RangeDays = 7 | 30

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

function StatusDonut({
  slices,
  reduceMotion,
}: {
  slices: { label: string; value: number; color: string }[]
  reduceMotion: boolean | null
}) {
  const data = slices.filter((slice) => slice.value > 0)

  if (data.length === 0) {
    return <EmptyChart />
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="h-56 w-full sm:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={2}
              isAnimationActive={!reduceMotion}
            >
              {data.map((slice) => (
                <Cell key={slice.label} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full space-y-2 sm:w-1/2">
        {data.map((slice) => (
          <li
            key={slice.label}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="truncate">{slice.label}</span>
            </span>
            <span className="shrink-0 font-medium tabular-nums">
              {slice.value}
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
  const [range, setRange] = React.useState<RangeDays>(7)

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

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Daily orders"
          description={`Orders you placed over the last ${range} days.`}
          action={<RangeToggle value={range} onChange={setRange} />}
        >
          <DailyOrdersChart
            series={data.dailyOrders ?? []}
            range={range}
            reduceMotion={reduceMotion}
          />
        </ChartCard>
        <ChartCard
          title="Orders by status"
          description="How your orders are progressing."
        >
          <StatusDonut
            slices={[
              {
                label: "Pending",
                value: data.pendingOrders,
                color: "var(--chart-3)",
              },
              {
                label: "Accepted",
                value: data.acceptedOrders,
                color: "var(--chart-4)",
              },
              {
                label: "Rejected",
                value: data.rejectedOrders,
                color: "var(--chart-1)",
              },
            ]}
            reduceMotion={reduceMotion}
          />
        </ChartCard>
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