"use client"

import * as React from "react"
import { CreditCard, RefreshCw, Search } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { PremiumSkeleton } from "@/components/premium-ui"
import {
  fetchAdminTransactions,
  type Transaction,
} from "@/lib/api"
import { useToast } from "@/components/toast-provider"

type ViewStatus = "loading" | "success" | "empty" | "error"

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`
  }
}

function formatDate(value?: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function statusClass(status: string) {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
    case "pending":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
    case "expired":
    case "failed":
      return "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function AdminTransactions() {
  const reduceMotion = useReducedMotion()

  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [status, setStatus] = React.useState<ViewStatus>("loading")
  const [error, setError] = React.useState<string | null>(null)
  const [statusFilter, setStatusFilter] = React.useState("")
  const [planFilter, setPlanFilter] = React.useState("")
  const [vendorFilter, setVendorFilter] = React.useState("")
  const [vendorInput, setVendorInput] = React.useState("")
  const [reloadKey, setReloadKey] = React.useState(0)

  React.useEffect(() => {
    const timer = setTimeout(() => setVendorFilter(vendorInput.trim()), 300)
    return () => clearTimeout(timer)
  }, [vendorInput])

  React.useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setStatus("loading")
      setError(null)
      try {
        const result = await fetchAdminTransactions(
          {
            status: statusFilter || undefined,
            plan: planFilter || undefined,
            vendorId: vendorFilter || undefined,
          },
          controller.signal
        )
        setTransactions(result)
        setStatus(result.length === 0 ? "empty" : "success")
      } catch (caughtError) {
        if (controller.signal.aborted) return
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load transactions"
        )
        setStatus("error")
      }
    }

    void load()
    return () => controller.abort()
  }, [statusFilter, planFilter, vendorFilter, reloadKey])

  return (
    <section aria-labelledby="admin-transactions-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Admin dashboard
          </p>
          <h1
            id="admin-transactions-heading"
            className="mt-3 font-heading text-3xl font-bold tracking-tight"
          >
            Transactions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Read-only record of Stripe subscription payments.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-card sm:flex-row sm:items-center">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="premium-input h-10"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="expired">Expired</option>
          <option value="failed">Failed</option>
        </select>

        <select
          value={planFilter}
          onChange={(event) => setPlanFilter(event.target.value)}
          className="premium-input h-10"
          aria-label="Filter by plan"
        >
          <option value="">All plans</option>
          <option value="premium">Premium</option>
          <option value="free">Free</option>
        </select>

        <label className="relative block flex-1">
          <span className="sr-only">Filter by vendor ID</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={vendorInput}
            onChange={(event) => setVendorInput(event.target.value)}
            placeholder="Filter by vendor ID"
            className="premium-input h-10 pl-9"
          />
        </label>
      </div>

      <div className="mt-8">
        {status === "loading" ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <PremiumSkeleton key={index} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : null}

        {status === "error" ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
            <h2 className="mt-4 font-heading text-lg font-semibold">
              Could not load transactions
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
            <CreditCard className="size-10 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-lg font-semibold">
              No transactions
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Transaction records will appear here once payments are processed.
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
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction._id}
                className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-card backdrop-blur-sm"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: reduceMotion ? 0 : index * 0.04,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium capitalize">{transaction.plan} plan</p>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          statusClass(transaction.status)
                        )}
                      >
                        {transaction.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Vendor: {transaction.vendorName || transaction.vendorId}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Session: {transaction.stripeSessionId}
                    </p>
                    {transaction.stripeSubscriptionId ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Subscription: {transaction.stripeSubscriptionId}
                      </p>
                    ) : null}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="font-heading text-lg font-semibold text-primary">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : null}
      </div>
    </section>
  )
}