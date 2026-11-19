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

export type VendorDashboardData = {
  totalMenuItems: number
  activeMenuItems: number
  pendingOrders: number
  acceptedOrders: number
  subscriptionPlan: "free" | "premium"
  subscriptionExpiresAt: string | null
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

export type UpdateVendorProfileInput = {
  name?: string
  businessName?: string
  image?: string
}

export async function updateVendorProfile(
  input: UpdateVendorProfileInput,
  signal?: AbortSignal
): Promise<VendorProfile> {
  const response = await fetchWithAuth<VendorProfile>(
    "/api/vendors/profile",
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    signal
  )

  return response.data
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

type ApiEnvelope<T> = {
  message?: string
  data: T
}

export async function getAuthToken(signal?: AbortSignal): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
    signal,
    credentials: "include",
    headers: { Accept: "application/json" },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Unable to get an authentication token")
  }

  const payload: unknown = await response.json()

  if (!payload || typeof payload !== "object" || !("token" in payload)) {
    throw new Error("Unexpected authentication token response")
  }

  const token = (payload as { token: unknown }).token
  if (typeof token !== "string" || !token) {
    throw new Error("Unexpected authentication token response")
  }

  return token
}

export async function fetchWithAuth<T>(
  path: string,
  init: RequestInit = {},
  signal?: AbortSignal
): Promise<ApiEnvelope<T>> {
  const token = await getAuthToken(signal)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    signal,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
    cache: "no-store",
  })

  const payload: unknown = await response.json().catch(() => null)
  const method = (init.method ?? "GET").toUpperCase()

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof (payload as { message: unknown }).message === "string"
        ? (payload as { message: string }).message
        : `Request failed with status ${response.status}`

    throw new Error(message)
  }

  // Some endpoints (for example DELETE) return only a message and no data.
  if (!payload || typeof payload !== "object") {
    if (method === "DELETE") {
      return { data: undefined as T }
    }
    throw new Error("Unexpected API response shape")
  }

  if (!("data" in payload)) {
    if (method === "DELETE") {
      return {
        message:
          typeof (payload as { message?: unknown }).message === "string"
            ? (payload as { message: string }).message
            : undefined,
        data: undefined as T,
      }
    }
    throw new Error("Unexpected API response shape")
  }

  return payload as ApiEnvelope<T>
}

export type CustomerDashboardData = {
  totalOrders: number
  pendingOrders: number
  acceptedOrders: number
  rejectedOrders: number
}

export async function fetchCustomerDashboard(
  signal?: AbortSignal
): Promise<CustomerDashboardData> {
  const response = await fetchWithAuth<CustomerDashboardData>(
    "/api/customers/dashboard",
    {},
    signal
  )

  return response.data
}

export async function cancelOrder(
  id: string,
  signal?: AbortSignal
): Promise<Order> {
  const response = await fetchWithAuth<Order>(
    `/api/orders/${id}/cancel`,
    { method: "PATCH" },
    signal
  )

  return response.data
}

export async function fetchVendorDashboard(
  signal?: AbortSignal
): Promise<VendorDashboardData> {
  const response = await fetchWithAuth<VendorDashboardData>(
    "/api/vendors/dashboard",
    {},
    signal
  )

  return response.data
}

export async function createCheckoutSession(
  signal?: AbortSignal
): Promise<string> {
  const response = await fetchWithAuth<{ url: string }>(
    "/api/subscriptions/checkout",
    { method: "POST" },
    signal
  )

  if (!response.data || typeof response.data.url !== "string") {
    throw new Error("Checkout session did not return a redirect URL")
  }

  return response.data.url
}

export async function cancelPremiumSubscription(
  signal?: AbortSignal
): Promise<{ cancelAt: number | null }> {
  const response = await fetchWithAuth<{ cancelAt: number | null }>(
    "/api/subscriptions/cancel",
    { method: "POST" },
    signal
  )

  return response.data
}

export type CreateMenuItemInput = {
  itemName: string
  category: string
  description: string
  price: number
  location: string
  images: string[]
}

export async function createMenuItem(
  input: CreateMenuItemInput,
  signal?: AbortSignal
): Promise<MenuItem> {
  const response = await fetchWithAuth<MenuItem>(
    "/api/menu",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
    signal
  )

  return response.data
}

export async function fetchUploadMenuImage(
  file: File,
  signal?: AbortSignal
): Promise<string> {
  const response = await fetchWithAuth<{ url: string }>(
    "/api/menu/images",
    {
      method: "POST",
      headers: {
        "Content-Type": file.type,
        "X-File-Name": file.name,
      },
      body: file,
    },
    signal
  )

  if (!response.data || typeof response.data.url !== "string") {
    throw new Error("Image upload failed: no image URL returned")
  }

  return response.data.url
}

export type AdminDashboardData = {
  totalUsers: number
  vendors: number
  customers: number
  totalMenuItems: number
  pendingMenuItems: number
  totalTransactions: number
}

export type AdminUser = {
  _id: string
  name: string
  email: string
  image?: string | null
  role: "vendor" | "customer" | "admin"
  isBlocked: boolean
  businessName?: string | null
  subscriptionPlan?: string
  subscriptionExpiresAt?: string | null
  createdAt?: string
}

export type Transaction = {
  _id: string
  vendorId: string
  plan: string
  amount: number
  currency: string
  stripeSessionId: string
  stripeSubscriptionId: string | null
  status: string
  createdAt?: string
}

export type AdminMenuFilters = {
  status?: string
  plan?: string
  vendorId?: string
}

export async function fetchAdminDashboard(
  signal?: AbortSignal
): Promise<AdminDashboardData> {
  const response = await fetchWithAuth<AdminDashboardData>(
    "/api/admin/dashboard",
    {},
    signal
  )
  return response.data
}

export async function fetchAdminUsers(
  filters: { role?: string; search?: string } = {},
  signal?: AbortSignal
): Promise<AdminUser[]> {
  const params = new URLSearchParams()
  if (filters.role) params.set("role", filters.role)
  if (filters.search?.trim()) params.set("search", filters.search.trim())
  const query = params.toString()
  const response = await fetchWithAuth<AdminUser[]>(
    `/api/admin/users${query ? `?${query}` : ""}`,
    {},
    signal
  )
  if (!Array.isArray(response.data)) {
    throw new Error("Unexpected admin users response shape")
  }
  return response.data
}

export async function setUserBlocked(
  id: string,
  blocked: boolean,
  signal?: AbortSignal
): Promise<void> {
  await fetchWithAuth<unknown>(
    `/api/admin/users/${id}/block`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked }),
    },
    signal
  )
}

export async function fetchAdminTransactions(
  filters: AdminMenuFilters = {},
  signal?: AbortSignal
): Promise<Transaction[]> {
  const params = new URLSearchParams()
  if (filters.status?.trim()) params.set("status", filters.status.trim())
  if (filters.plan?.trim()) params.set("plan", filters.plan.trim())
  if (filters.vendorId?.trim()) params.set("vendorId", filters.vendorId.trim())
  const query = params.toString()
  const response = await fetchWithAuth<Transaction[]>(
    `/api/admin/transactions${query ? `?${query}` : ""}`,
    {},
    signal
  )
  if (!Array.isArray(response.data)) {
    throw new Error("Unexpected transactions response shape")
  }
  return response.data
}

export async function fetchAdminMenuItems(signal?: AbortSignal): Promise<MenuItem[]> {
  const response = await fetchWithAuth<MenuItem[]>("/api/menu/admin", {}, signal)
  if (!Array.isArray(response.data)) {
    throw new Error("Unexpected admin menu items response shape")
  }
  return response.data
}

export async function fetchPendingMenuItems(signal?: AbortSignal): Promise<MenuItem[]> {
  const response = await fetchWithAuth<MenuItem[]>("/api/menu/admin/pending", {}, signal)
  if (!Array.isArray(response.data)) {
    throw new Error("Unexpected pending menu items response shape")
  }
  return response.data
}

export async function updateAdminMenuItemStatus(
  id: string,
  status: "pending" | "approved" | "rejected" | "inactive",
  signal?: AbortSignal
): Promise<MenuItem> {
  const response = await fetchWithAuth<MenuItem>(
    `/api/menu/admin/${id}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
    signal
  )
  return response.data
}

export async function deleteAdminMenuItem(
  id: string,
  signal?: AbortSignal
): Promise<void> {
  await fetchWithAuth<unknown>(`/api/menu/admin/${id}`, { method: "DELETE" }, signal)
}

export async function fetchVendorMenuItems(
  signal?: AbortSignal
): Promise<MenuItem[]> {
  const response = await fetchWithAuth<MenuItem[]>(
    "/api/menu/mine",
    {},
    signal
  )

  if (!Array.isArray(response.data)) {
    throw new Error("Unexpected vendor menu items response shape")
  }

  return response.data
}

export type OrderStatus = "pending" | "accepted" | "rejected" | "cancelled"

export type Order = {
  _id: string
  itemId: string
  vendorId: string
  customerId: string
  deliveryDate: string
  deliveryAddress: string
  message: string
  status: OrderStatus
  createdAt?: string
}

export async function fetchMyOrders(signal?: AbortSignal): Promise<Order[]> {
  const response = await fetchWithAuth<Order[]>("/api/orders/mine", {}, signal)

  if (!Array.isArray(response.data)) {
    throw new Error("Unexpected orders response shape")
  }

  return response.data
}

export async function updateOrderStatus(
  id: string,
  status: "accepted" | "rejected",
  signal?: AbortSignal
): Promise<Order> {
  const response = await fetchWithAuth<Order>(
    `/api/orders/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
    signal
  )

  return response.data
}

export type UpdateMenuItemInput = Partial<CreateMenuItemInput>

export async function updateMenuItem(
  id: string,
  input: UpdateMenuItemInput,
  signal?: AbortSignal
): Promise<MenuItem> {
  const response = await fetchWithAuth<MenuItem>(
    `/api/menu/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    signal
  )

  return response.data
}

export async function deleteMenuItem(
  id: string,
  signal?: AbortSignal
): Promise<void> {
  await fetchWithAuth<unknown>(`/api/menu/${id}`, { method: "DELETE" }, signal)
}

export async function toggleMenuItemAvailability(
  id: string,
  available: boolean,
  signal?: AbortSignal
): Promise<MenuItem> {
  const response = await fetchWithAuth<MenuItem>(
    `/api/menu/${id}/availability`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: available }),
    },
    signal
  )

  return response.data
}
