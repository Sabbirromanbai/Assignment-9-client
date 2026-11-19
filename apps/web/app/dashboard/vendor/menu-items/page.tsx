import type { Metadata } from "next"

import { VendorMenuItems } from "@/components/dashboard/vendor-menu-items"

export const metadata: Metadata = {
  title: "My Menu Items",
  description: "View and manage your PizzaHub menu items.",
}

export default function VendorMenuItemsPage() {
  return <VendorMenuItems />
}
