import { authClient } from "@/lib/auth-client"
import { normalizeRole, type DashboardRole } from "@/lib/dashboard-nav"

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
