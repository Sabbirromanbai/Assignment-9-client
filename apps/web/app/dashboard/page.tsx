"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { useAuthSession } from "@/lib/auth"
import { ROLE_HOME } from "@/lib/dashboard-nav"

export default function DashboardPage() {
  const router = useRouter()
  const { isPending, isAuthenticated, role, roleSelectionPending } =
    useAuthSession()

  React.useEffect(() => {
    if (isPending) {
      return
    }

    if (!isAuthenticated) {
      router.replace("/sign-in?callbackURL=%2Fdashboard")
      return
    }

    if (roleSelectionPending) {
      router.replace("/choose-role")
      return
    }

    router.replace(role ? ROLE_HOME[role] : "/sign-in?callbackURL=%2Fdashboard")
  }, [isPending, isAuthenticated, role, roleSelectionPending, router])

  return (
    <div className="flex min-h-[60svh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
        <p className="text-sm">Opening your dashboard...</p>
      </div>
    </div>
  )
}
