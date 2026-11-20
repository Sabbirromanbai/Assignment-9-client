import { authClient } from "@/lib/auth-client"
import {
  normalizeRole,
  ROLE_HOME,
  type DashboardRole,
} from "@/lib/dashboard-nav"

type AuthUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string | null
}

export function useAuthSession() {
  const session = authClient.useSession()

  const rawUser = session.data?.user as AuthUser | undefined | null
  const role = normalizeRole(rawUser?.role) as DashboardRole | null

  return {
    ...session,
    user: rawUser,
    role,
    isAuthenticated: Boolean(session.data?.session && rawUser),
  }
}

type SessionLike = {
  session?: unknown | null
  user?: AuthUser | null
}

// There is no dedicated vendor application route in this app yet. When one is
// added, point this at it and the Hero CTA will use it automatically.
const VENDOR_APPLICATION_HREF: string | null = null

const GUEST_VENDOR_CTA_HREF = `/sign-in?callbackURL=${encodeURIComponent(
  "/dashboard"
)}`

/**
 * Resolve the "Become a Vendor" destination from a server-backed Better Auth
 * session. The session/user payload comes from the auth API (cookie + database
 * user role), so an authenticated user is never mistaken for a guest.
 */
export function resolveVendorCtaHref(session: SessionLike | null | undefined) {
  const isAuthenticated = Boolean(session?.session && session?.user)

  if (!isAuthenticated) {
    return GUEST_VENDOR_CTA_HREF
  }

  const role = normalizeRole(session?.user?.role) as DashboardRole | null

  if (role === "vendor") {
    return ROLE_HOME.vendor
  }

  if (role === "customer" && VENDOR_APPLICATION_HREF) {
    return VENDOR_APPLICATION_HREF
  }

  // Logged-in customers/admins (or users with a temporarily missing role) stay
  // inside the authenticated area instead of bouncing back to sign-in.
  return role ? ROLE_HOME[role] : "/dashboard"
}
