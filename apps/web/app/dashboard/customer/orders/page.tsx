import type { Metadata } from "next"

import { CustomerOrders } from "@/components/dashboard/customer-orders"

export const metadata: Metadata = {
  title: "My Orders",
  description: "View and manage your Pizzabari orders.",
}

export default function CustomerOrdersPage() {
  return <CustomerOrders />
}