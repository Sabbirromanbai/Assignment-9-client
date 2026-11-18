export type MenuItem = {
  _id: string
  itemName: string
  category: string
  description: string
  price: number
  location: string
  images: string[]
  status: "pending" | "approved" | "rejected" | "inactive"
  createdAt?: string
  updatedAt?: string
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:5000"

export async function fetchMenuItems(signal?: AbortSignal): Promise<MenuItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/menu`, {
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  })

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
