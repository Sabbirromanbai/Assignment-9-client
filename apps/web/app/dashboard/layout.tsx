import type { Metadata } from "next"

import { DashboardGuard } from "@/components/dashboard/dashboard-guard"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "PizzaHub role-based dashboard.",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardGuard>{children}</DashboardGuard>
}
