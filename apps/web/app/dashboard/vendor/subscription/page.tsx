import type { Metadata } from "next"

import { VendorSubscription } from "@/components/dashboard/vendor-subscription"

export const metadata: Metadata = {
  title: "Subscription",
  description: "Manage your Pizzabari subscription plan.",
}

export default function VendorSubscriptionPage() {
  return <VendorSubscription />
}