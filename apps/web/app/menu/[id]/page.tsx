import type { Metadata } from "next"

import { MenuItemDetails } from "@/components/menu-item-details"

export const metadata: Metadata = {
  title: "Menu Item | PizzaHub",
  description: "View PizzaHub menu item details.",
}

export default async function MenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <MenuItemDetails id={id} />
}
