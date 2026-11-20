"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { fetchVendorDashboard } from "@/lib/api"
import { useAuthSession } from "@/lib/auth"
import { isActivePremiumSubscription } from "@/lib/subscription"

type PremiumContextValue = {
  isPremiumVendor: boolean
  isChecking: boolean
  refresh: () => void
}

const PremiumContext = React.createContext<PremiumContextValue | null>(null)

/**
 * Single source of truth for the signed-in vendor's premium identity.
 * Dashboard routes render DashboardShell instead of Navbar, so keeping this
 * state inside Navbar made the crown disappear as soon as a vendor navigated
 * into /dashboard. The provider lives above SiteChrome and is available on
 * public pages, auth pages and every dashboard route.
 */
export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isPending, user, role } = useAuthSession()
  const [isPremiumVendor, setIsPremiumVendor] = React.useState(false)
  const [isChecking, setIsChecking] = React.useState(false)
  const [reloadKey, setReloadKey] = React.useState(0)

  React.useEffect(() => {
    if (isPending || role !== "vendor" || !user?.id) {
      setIsPremiumVendor(false)
      setIsChecking(false)
      return
    }

    const controller = new AbortController()

    setIsChecking(true)

    void fetchVendorDashboard(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setIsPremiumVendor(isActivePremiumSubscription(data))
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setIsPremiumVendor(false)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsChecking(false)
        }
      })

    return () => controller.abort()
  }, [isPending, role, user?.id, pathname, reloadKey])

  const refresh = React.useCallback(() => {
    setReloadKey((value) => value + 1)
  }, [])

  const value = React.useMemo<PremiumContextValue>(
    () => ({ isPremiumVendor, isChecking, refresh }),
    [isPremiumVendor, isChecking, refresh]
  )

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
}

export function usePremiumVendor() {
  const context = React.useContext(PremiumContext)

  if (!context) {
    throw new Error("usePremiumVendor must be used within PremiumProvider")
  }

  return context
}
