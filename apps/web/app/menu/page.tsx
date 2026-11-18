import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = {
  title: "Browse Menu",
  description: "Explore the PizzaHub menu of wood-fired pizzas.",
}

export default function MenuPage() {
  return (
    <PagePlaceholder
      eyebrow="Menu"
      title="Our menu is firing up"
      description="The full PizzaHub menu is being prepared. Soon you'll find every wood-fired pizza, side and drink right here."
    />
  )
}
