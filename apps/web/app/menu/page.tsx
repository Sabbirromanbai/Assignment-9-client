import type { Metadata } from "next"

import { BrowseMenu } from "@/components/browse-menu"

export const metadata: Metadata = {
  title: "Browse Menu",
  description: "Search and filter approved Pizzabari menu items.",
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    category?: string
    location?: string
  }>
}) {
  const params = await searchParams

  return (
    <BrowseMenu
      initialSearch={params.search}
      initialCategory={params.category}
      initialLocation={params.location}
    />
  )
}
