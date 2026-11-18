import type { Metadata } from "next"

import { FeaturedPizzas } from "@/components/featured-pizzas"
import { Hero } from "@/components/hero"

export const metadata: Metadata = {
  title: "PizzaHub",
  description:
    "Wood-fired pizza made fresh to order, delivered warm to your door.",
}

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedPizzas />
    </>
  )
}
