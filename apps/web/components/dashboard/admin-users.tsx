"use client"

import * as React from "react"
import { AlertCircle, Ban, RefreshCw, Search, ShieldCheck, UserCheck } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { PremiumSkeleton } from "@/components/premium-ui"
import { PremiumVendorChip } from "@/components/premium-vendor-mark"
import {
  fetchAdminUsers,
  setUserBlocked,
  type AdminUser,
} from "@/lib/api"
import { isActivePremiumSubscription } from "@/lib/subscription"
import { useToast } from "@/components/toast-provider"

type ViewStatus = "loading" | "success" | "empty" | "error"

export function AdminUsers() {
  const reduceMotion = useReducedMotion()
  const { toast } = useToast()

  const [users, setUsers] = React.useState<AdminUser[]>([])
  const [status, setStatus] = React.useState<ViewStatus>("loading")
  const [error, setError] = React.useState<string | null>(null)
  const [roleFilter, setRoleFilter] = React.useState("")
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [reloadKey, setReloadKey] = React.useState(0)
  const [processingId, setProcessingId] = React.useState<string | null>(null)
  const [confirm, setConfirm] = React.useState<AdminUser | null>(null)
  const [nextBlocked, setNextBlocked] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  React.useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setStatus("loading")
      setError(null)
      try {
        const result = await fetchAdminUsers(
          { role: roleFilter || undefined, search: search || undefined },
          controller.signal
        )
        setUsers(result)
        setStatus(result.length === 0 ? "empty" : "success")
      } catch (caughtError) {
        if (controller.signal.aborted) return
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load users"
        )
        setStatus("error")
      }
    }

    void load()
    return () => controller.abort()
  }, [roleFilter, search, reloadKey])

  async function handleConfirm() {
    if (!confirm) return
    setProcessingId(confirm._id)
    try {
      await setUserBlocked(confirm._id, nextBlocked)
      setUsers((prev) =>
        prev.map((user) =>
          user._id === confirm._id ? { ...user, isBlocked: nextBlocked } : user
        )
      )
      toast({
        variant: "success",
        title: nextBlocked ? "User blocked" : "User unblocked",
        description: `${confirm.name} has been ${nextBlocked ? "blocked" : "unblocked"}.`,
      })
    } catch (caughtError) {
      toast({
        variant: "error",
        title: "Failed to update user",
        description:
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to update this user. Please try again.",
      })
    } finally {
      setProcessingId(null)
      setConfirm(null)
    }
  }

  return (
    <section aria-labelledby="admin-users-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Admin dashboard
          </p>
          <h1
            id="admin-users-heading"
            className="mt-3 font-heading text-3xl font-bold tracking-tight"
          >
            Manage users
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Search, filter, and block or unblock customer and vendor accounts.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-card sm:flex-row sm:items-center">
        <label className="relative block flex-1">
          <span className="sr-only">Search users</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name or email"
            className="premium-input h-10 pl-9"
          />
        </label>

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          className="premium-input h-10"
          aria-label="Filter by role"
        >
          <option value="">All roles</option>
          <option value="vendor">Vendors</option>
          <option value="customer">Customers</option>
        </select>
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
            <AlertCircle className="size-10 text-destructive" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-lg font-semibold">
              Could not load users
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
            <ShieldCheck className="size-10 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-lg font-semibold">
              No users found
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Try adjusting your search or role filter.
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
            {users.map((user, index) => {
              const isProcessing = processingId === user._id
              return (
                <motion.div
                  key={user._id}
                  className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-card backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: reduceMotion ? 0 : index * 0.04,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{user.name}</p>
                      <span className="inline-flex rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground capitalize">
                        {user.role}
                      </span>
                      {user.role === "vendor" &&
                      isActivePremiumSubscription(user) ? (
                        <PremiumVendorChip compact />
                      ) : null}
                      {user.isBlocked ? (
                        <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
                          Blocked
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    {user.businessName ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {user.businessName}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setConfirm(user)
                      setNextBlocked(!user.isBlocked)
                    }}
                    disabled={isProcessing}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      user.isBlocked
                        ? "border-emerald-500/40 text-emerald-700 hover:bg-emerald-50"
                        : "border-destructive/40 text-destructive hover:bg-destructive/10"
                    )}
                    aria-label={`${user.isBlocked ? "Unblock" : "Block"} ${user.name}`}
                  >
                    {isProcessing ? (
                      <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
                    ) : user.isBlocked ? (
                      <UserCheck className="size-4" aria-hidden="true" />
                    ) : (
                      <Ban className="size-4" aria-hidden="true" />
                    )}
                    {user.isBlocked ? "Unblock" : "Block"}
                  </button>
                </motion.div>
              )
            })}
          </motion.div>
        ) : null}
      </div>

      {confirm ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="block-user-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-foreground/25 backdrop-blur-sm"
            onClick={() => !processingId && setConfirm(null)}
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
              id="block-user-title"
              className="font-heading text-lg font-semibold tracking-tight"
            >
              {nextBlocked ? "Block user?" : "Unblock user?"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {nextBlocked
                ? `${confirm.name} will no longer be able to access Pizzabari.`
                : `${confirm.name} will regain access to Pizzabari.`}
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => !processingId && setConfirm(null)}
                disabled={Boolean(processingId)}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={Boolean(processingId)}
                className={cn(
                  "h-9 gap-1.5 px-3 inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
                  nextBlocked
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                )}
              >
                {processingId ? (
                  <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                {nextBlocked ? "Block" : "Unblock"}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </section>
  )
}