import type { Metadata } from "next"

import { AdminOverview } from "@/components/dashboard/admin-overview"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Overview of PizzaHub platform activity.",
}

export default function AdminDashboardPage() {
  return <AdminOverview />
}