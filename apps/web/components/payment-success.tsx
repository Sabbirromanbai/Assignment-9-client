"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Clock, Loader2, RefreshCw, XCircle } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { usePremiumVendor } from "@/components/premium-provider"
import { fetchVendorDashboard } from "@/lib/api"
import { useAuthSession } from "@/lib/auth"
import { isActivePremiumSubscription } from "@/lib/subscription"

type Status = "pending" | "success" | "timeout" | "error"

export function PaymentSuccess() {
  const reduceMotion = useReducedMotion()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const { isPending: sessionPending, isAuthenticated } = useAuthSession()
  const { refresh: refreshPremiumStatus } = usePremiumVendor()

  const [status, setStatus] = React.useState<Status>("pending")
  const [attempts, setAttempts] = React.useState(0)

  React.useEffect(() => {
    if (sessionPending) return
    if (!isAuthenticated) {
      setStatus("error")
      return
    }

    let cancelled = false
    let attempt = 0
    const maxAttempts = 15

    async function poll() {
      while (!cancelled && attempt < maxAttempts) {
        attempt += 1
        setAttempts(attempt)
        try {
          const data = await fetchVendorDashboard()
          if (isActivePremiumSubscription(data)) {
            if (!cancelled) {
              setStatus("success")
              refreshPremiumStatus()
            }
            return
          }
        } catch {
          // keep polling; auth or network may be settling
        }
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
      if (!cancelled) setStatus("timeout")
    }

    void poll()
    return () => {
      cancelled = true
    }
  }, [sessionPending, isAuthenticated, refreshPremiumStatus])

  return (
    <section className="mx-auto flex min-h-[60svh] w-full max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      {status === "pending" ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <Loader2 className="size-10 animate-spin text-primary" aria-hidden="true" />
          <h1 className="mt-6 font-heading text-3xl font-bold tracking-tight">
            Payment received
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            We are activating your Premium plan. This usually takes a few seconds.
            {sessionId ? " Your checkout session has been recorded." : ""}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Checking activation… attempt {attempts} of 15
          </p>
        </motion.div>
      ) : null}

      {status === "success" ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <CheckCircle2 className="size-12 text-primary" aria-hidden="true" />
          <h1 className="mt-6 font-heading text-3xl font-bold tracking-tight">
            Premium activated
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Your Pizzabari Premium plan is now active. You can publish unlimited
            menu items with featured placement.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/vendor/subscription"
              className={cn(buttonVariants(), "shadow-soft")}
            >
              View subscription
            </Link>
            <Link
              href="/dashboard/vendor"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Go to dashboard
            </Link>
          </div>
        </motion.div>
      ) : null}

      {status === "timeout" ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <Clock className="size-12 text-amber-600" aria-hidden="true" />
          <h1 className="mt-6 font-heading text-3xl font-bold tracking-tight">
            Still activating
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Payment was received, but Premium has not been confirmed yet. It can
            take a moment for the webhook to finish processing.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/vendor/subscription"
              className={cn(buttonVariants(), "shadow-soft")}
            >
              Check subscription
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Retry
            </button>
          </div>
        </motion.div>
      ) : null}

      {status === "error" ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <XCircle className="size-12 text-destructive" aria-hidden="true" />
          <h1 className="mt-6 font-heading text-3xl font-bold tracking-tight">
            Sign in required
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Please sign in to view your subscription status.
          </p>
          <Link
            href="/sign-in?callbackURL=%2Fpayment-success"
            className={cn(buttonVariants(), "mt-8 shadow-soft")}
          >
            Sign in
          </Link>
        </motion.div>
      ) : null}
    </section>
  )
}