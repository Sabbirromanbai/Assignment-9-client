import type { Metadata } from "next"

import { FeaturedPizzas } from "@/components/featured-pizzas"
import { Hero } from "@/components/hero"
import { HowPizzabariWorks } from "@/components/how-pizzabari-works"
import { PopularCategories } from "@/components/popular-categories"
import { WhyChoosePizzabari } from "@/components/why-choose-pizzabari"

export const metadata: Metadata = {
  title: "Pizzabari",
  description:
    "Wood-fired pizza made fresh to order, delivered warm to your door.",
}

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedPizzas />
      <PopularCategories />
      <WhyChoosePizzabari />
      <HowPizzabariWorks />
    </>
  )
}
