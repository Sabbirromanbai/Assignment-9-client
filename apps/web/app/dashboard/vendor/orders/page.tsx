import type { Metadata } from "next"

import { VendorOrders } from "@/components/dashboard/vendor-orders"

export const metadata: Metadata = {
  title: "Customer Orders",
  description: "Review and manage customer orders for your Pizzabari kitchen.",
}

export default function VendorOrdersPage() {
  return <VendorOrders />
}