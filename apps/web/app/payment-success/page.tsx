import type { Metadata } from "next"
import { Suspense } from "react"

import { PaymentSuccess } from "@/components/payment-success"

export const metadata: Metadata = {
  title: "Payment Success",
  description: "Your Pizzabari payment confirmation.",
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccess />
    </Suspense>
  )
}