import type { Metadata } from "next"
import Link from "next/link"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

export const metadata: Metadata = {
  title: "Payment Cancelled",
  description: "Your PizzaHub checkout was cancelled.",
}

export default function PaymentCancelPage() {
  return (
    <section className="mx-auto flex min-h-[60svh] w-full max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <h1 className="font-heading text-3xl font-bold tracking-tight">
        Checkout cancelled
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Your payment was not completed and your plan has not changed.
      </p>
      <Link
        href="/dashboard/vendor/subscription"
        className={cn(buttonVariants(), "mt-8 shadow-soft")}
      >
        Back to subscription
      </Link>
    </section>
  )
}