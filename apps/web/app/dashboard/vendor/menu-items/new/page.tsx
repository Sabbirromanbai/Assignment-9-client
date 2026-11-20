import type { Metadata } from "next"

import { VendorMenuItemForm } from "@/components/dashboard/vendor-menu-item-form"

export const metadata: Metadata = {
  title: "Add Menu Item",
  description: "Add a new menu item to your Pizzabari kitchen.",
}

export default function AddMenuItemPage() {
  return <VendorMenuItemForm />
}
