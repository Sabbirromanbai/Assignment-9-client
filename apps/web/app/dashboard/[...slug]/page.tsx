import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "PizzaHub dashboard page.",
}

export default function DashboardPlaceholderPage() {
  return (
    <PagePlaceholder
      eyebrow="Dashboard"
      title="This dashboard page is on the way"
      description="The role-specific dashboard screens will be added here. The layout, navigation and access controls are already in place."
    />
  )
}
