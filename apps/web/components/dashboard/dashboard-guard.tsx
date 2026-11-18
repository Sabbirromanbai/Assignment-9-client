"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuthSession } from "@/lib/auth"
import { ROLE_HOME, type DashboardRole } from "@/lib/dashboard-nav"

function requiredRoleForPath(pathname: string): DashboardRole | null {
  if (pathname.startsWith("/dashboard/vendor")) {
    return "vendor"
  }
  if (pathname.startsWith("/dashboard/customer")) {
    return "customer"
  }
  if (pathname.startsWith("/dashboard/admin")) {
    return "admin"
  }
  return null
}

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isPending, isAuthenticated, user, role } = useAuthSession()

  React.useEffect(() => {
    if (isPending) {
      return
    }

    if (!isAuthenticated) {
      router.replace(
        `/sign-in?callbackURL=${encodeURIComponent(pathname)}`
      )
      return
    }

    const requiredRole = requiredRoleForPath(pathname)
    if (requiredRole && role !== requiredRole) {
      router.replace(role ? ROLE_HOME[role] : "/dashboard")
    }
  }, [isPending, isAuthenticated, role, pathname, router])

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          Redirecting to sign in...
        </p>
      </div>
    )
  }

  const requiredRole = requiredRoleForPath(pathname)
  if (requiredRole && role !== requiredRole) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          Redirecting to your dashboard...
        </p>
      </div>
    )
  }

  if (!role) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4 text-center">
        <div>
          <h1 className="font-heading text-xl font-semibold">
            Account role unavailable
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please sign in again to continue.
          </p>
        </div>
      </div>
    )
  }

  return (
    <DashboardShell role={role} user={user}>
      {children}
    </DashboardShell>
  )
}
