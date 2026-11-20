import type { Metadata } from "next"

import { AdminMenuItems } from "@/components/dashboard/admin-menu-items"

export const metadata: Metadata = {
  title: "Manage Menu Items",
  description: "Admin review and management of Pizzabari menu items.",
}

export default function AdminMenuItemsPage() {
  return <AdminMenuItems />
}