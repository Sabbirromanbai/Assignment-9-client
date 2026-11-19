"use client"

import * as React from "react"
import { Crown, RefreshCw, ShieldCheck, Sparkles, XCircle } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import {
  cancelPremiumSubscription,
  createCheckoutSession,
  fetchVendorDashboard,
  type VendorDashboardData,
} from "@/lib/api"
import { useToast } from "@/components/toast-provider"

type ViewStatus = "loading" | "success" | "error"

function formatExpiry(value: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function SubscriptionSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-40 animate-pulse rounded-2xl border border-border/70 bg-muted/60" />
      <div className="h-64 animate-pulse rounded-2xl border border-border/70 bg-muted/60" />
    </div>
  )
}

export function VendorSubscription() {
  const reduceMotion = useReducedMotion()
  const { toast } = useToast()

  const [data, setData] = React.useState<VendorDashboardData | null>(null)
  const [status, setStatus] = React.useState<ViewStatus>("loading")
  const [error, setError] = React.useState<string | null>(null)
  const [reloadKey, setReloadKey] = React.useState(0)
  const [isUpgrading, setIsUpgrading] = React.useState(false)
  const [isCancelling, setIsCancelling] = React.useState(false)

  React.useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setStatus("loading")
      setError(null)
      try {
        const result = await fetchVendorDashboard(controller.signal)
        setData(result)
        setStatus("success")
      } catch (caughtError) {
        if (controller.signal.aborted) return
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load subscription details"
        )
        setStatus("error")
      }
    }

    void load()
    return () => controller.abort()
  }, [reloadKey])

  async function handleUpgrade() {
    setIsUpgrading(true)
    try {
      const url = await createCheckoutSession()
      window.location.href = url
    } catch (caughtError) {
      toast({
        variant: "error",
        title: "Unable to start checkout",
        description:
          caughtError instanceof Error
            ? caughtError.message
            : "Stripe checkout is currently unavailable.",
      })
    } finally {
      setIsUpgrading(false)
    }
  }

  async function handleCancel() {
    setIsCancelling(true)
    try {
      const result = await cancelPremiumSubscription()
      toast({
        variant: "success",
        title: "Cancellation scheduled",
        description:
          result.cancelAt
            ? `Premium will end on ${new Date(result.cancelAt * 1000).toLocaleDateString()}.`
            : "Premium will end at the current billing period.",
      })
      setReloadKey((value) => value + 1)
    } catch (caughtError) {
      toast({
        variant: "error",
        title: "Unable to cancel subscription",
        description:
          caughtError instanceof Error
            ? caughtError.message
            : "Please try again in a moment.",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const isPremium = data?.subscriptionPlan === "premium"
  const expiry = formatExpiry(data?.subscriptionExpiresAt ?? null)

  return (
    <section aria-labelledby="vendor-subscription-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Vendor dashboard
          </p>
          <h1
            id="vendor-subscription-heading"
            className="mt-3 font-heading text-3xl font-bold tracking-tight"
          >
            Subscription
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your PizzaHub plan and unlock unlimited active menu items.
          </p>
        </div>
      </div>

      <div className="mt-8">
        {status === "loading" ? <SubscriptionSkeleton /> : null}

        {status === "error" ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
            <h2 className="mt-4 font-heading text-lg font-semibold">
              Could not load subscription details
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

        {status === "success" && data ? (
          <div className="space-y-6">
            <motion.div
              className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-6 shadow-card backdrop-blur-sm sm:p-8"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-16 size-56 rounded-full bg-primary/8 blur-3xl"
              />
              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                    Current plan
                  </p>
                  <h2 className="mt-2 flex items-center gap-2 font-heading text-2xl font-bold tracking-tight capitalize">
                    {isPremium ? (
                      <Crown className="size-6 text-primary" aria-hidden="true" />
                    ) : (
                      <ShieldCheck className="size-6 text-primary" aria-hidden="true" />
                    )}
                    {data.subscriptionPlan} plan
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    {isPremium
                      ? expiry
                        ? `Premium benefits are active until ${expiry}.`
                        : "Premium benefits are active."
                      : "Free plan: up to 3 active menu items."}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:items-end">
                  {!isPremium ? (
                    <button
                      type="button"
                      onClick={handleUpgrade}
                      disabled={isUpgrading}
                      className={cn(
                        buttonVariants(),
                        "shadow-soft",
                        isUpgrading && "cursor-not-allowed opacity-70"
                      )}
                    >
                      {isUpgrading ? (
                        <>
                          <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
                          Redirecting
                        </>
                      ) : (
                        <>
                          <Crown className="size-4" aria-hidden="true" />
                          Upgrade to Premium
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isCancelling}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        isCancelling && "cursor-not-allowed opacity-70"
                      )}
                    >
                      {isCancelling ? (
                        <>
                          <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
                          Cancelling
                        </>
                      ) : (
                        <>
                          <XCircle className="size-4" aria-hidden="true" />
                          Cancel Premium
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-2">
              <motion.div
                className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-card backdrop-blur-sm"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className="font-heading text-lg font-semibold tracking-tight">
                  Free plan
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>Up to 3 active menu items at a time.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>Items require admin approval before appearing publicly.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>Standard placement in browse results.</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                className="rounded-2xl border border-primary/30 bg-card/80 p-6 shadow-card backdrop-blur-sm"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight">
                  <Sparkles className="size-5 text-primary" aria-hidden="true" />
                  Premium benefits
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Crown className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>Unlimited active menu items.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Crown className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>Premium badge on your profile and items.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Crown className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>Featured placement in browse results.</span>
                  </li>
                </ul>
                {!isPremium ? (
                  <p className="mt-4 text-xs text-muted-foreground">
                    Premium activation happens only after Stripe confirms payment
                    via a verified webhook.
                  </p>
                ) : null}
              </motion.div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}