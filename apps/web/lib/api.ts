export type MenuItem = {
  _id: string
  itemName: string
  category: string
  description: string
  price: number
  location: string
  images: string[]
  status: "pending" | "approved" | "rejected" | "inactive"
  vendorId: string
  createdAt?: string
  updatedAt?: string
}

export type VendorProfile = {
  _id: string
  name: string
  image: string | null
  businessName: string | null
  subscriptionPlan: "free" | "premium"
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:5000"

export type MenuFilters = {
  search?: string
  category?: string
  location?: string
  sort?: "newest" | "price_asc" | "price_desc"
}

export async function fetchMenuItems(
  filters: MenuFilters = {},
  signal?: AbortSignal
): Promise<MenuItem[]> {
  const params = new URLSearchParams()

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim())
  }
  if (filters.category?.trim()) {
    params.set("category", filters.category.trim())
  }
  if (filters.location?.trim()) {
    params.set("location", filters.location.trim())
  }
  if (filters.sort) {
    params.set("sort", filters.sort)
  }

  const query = params.toString()
  const response = await fetch(
    `${API_BASE_URL}/api/menu${query ? `?${query}` : ""}`,
    {
      signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    }
  )

  if (!response.ok) {
    throw new Error(`Menu request failed with status ${response.status}`)
  }

  const payload: unknown = await response.json()

  if (
    !payload ||
    typeof payload !== "object" ||
    !("data" in payload) ||
    !Array.isArray((payload as { data: unknown }).data)
  ) {
    throw new Error("Unexpected menu response shape")
  }

  return (payload as { data: MenuItem[] }).data
}

export async function fetchVendorProfile(
  vendorId: string,
  signal?: AbortSignal
): Promise<VendorProfile> {
  const response = await fetch(`${API_BASE_URL}/api/vendors/${vendorId}`, {
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Vendor request failed with status ${response.status}`)
  }

  const payload: unknown = await response.json()

  if (
    !payload ||
    typeof payload !== "object" ||
    !("data" in payload) ||
    typeof (payload as { data: unknown }).data !== "object" ||
    (payload as { data: unknown }).data === null
  ) {
    throw new Error("Unexpected vendor response shape")
  }

  return (payload as { data: VendorProfile }).data
}
