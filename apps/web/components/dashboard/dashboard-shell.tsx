"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home, LogOut, Menu, ShieldCheck, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { Logo } from "@/components/logo"
import {
  PremiumCrown,
  PremiumVendorBadge,
  PremiumVendorChip,
} from "@/components/premium-vendor-mark"
import { usePremiumVendor } from "@/components/premium-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/components/toast-provider"
import { authClient } from "@/lib/auth-client"
import type { DashboardRole } from "@/lib/dashboard-nav"
import { DASHBOARD_NAV } from "@/lib/dashboard-nav"

type DashboardShellProps = {
  role: DashboardRole
  user: { name?: string | null; email?: string | null; image?: string | null }
  children: React.ReactNode
}

function resolveNavItem(pathname: string, role: DashboardRole) {
  const navItems = DASHBOARD_NAV[role]
  const exactMatch = navItems.find((navItem) => navItem.href === pathname)

  if (exactMatch) {
    return exactMatch
  }

  return navItems
    .filter((navItem) => pathname.startsWith(`${navItem.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]
}

function getPageTitle(pathname: string, role: DashboardRole) {
  return resolveNavItem(pathname, role)?.label ?? "Dashboard"
}

export function DashboardShell({ role, user, children }: DashboardShellProps) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const { isPremiumVendor } = usePremiumVendor()
  const { toast } = useToast()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [isSigningOut, setIsSigningOut] = React.useState(false)

  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  React.useEffect(() => {
    if (!mobileOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [mobileOpen])

  async function handleSignOut() {
    if (isSigningOut) {
      return
    }

    setIsSigningOut(true)

    try {
      const { error } = await authClient.signOut()

      if (error) {
        toast({
          variant: "error",
          title: "Sign out failed",
          description: error.message || "Unable to sign out. Please try again.",
        })
        return
      }

      toast({
        variant: "success",
        title: "Signed out",
        description: "You have been signed out of Pizzabari.",
      })
      window.location.href = "/"
    } catch {
      toast({
        variant: "error",
        title: "Sign out failed",
        description: "Unable to sign out. Please try again.",
      })
    } finally {
      setIsSigningOut(false)
    }
  }

  const displayName = user.name || user.email || "Account"
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const navItems = DASHBOARD_NAV[role]
  const activeHref = resolveNavItem(pathname, role)?.href

  const exploreItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Browse Menu", href: "/menu", icon: Menu },
  ] as const

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-border/70 px-5">
        <Logo />
      </div>

      <div className="px-4 py-5">
        <div className="premium-card premium-card-interactive account-surface account-surface-interactive flex items-center gap-3 rounded-2xl p-3">
          <span className="relative shrink-0">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt=""
                className="size-10 rounded-full object-cover ring-1 ring-border/70"
              />
            ) : (
              <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-brand-orange to-brand-tomato text-sm font-semibold text-white">
                {initials}
              </span>
            )}
            {role === "vendor" && isPremiumVendor ? (
              <PremiumCrown className="absolute -top-2 -left-2" />
            ) : null}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground capitalize">
              <ShieldCheck
                className="size-3 text-[var(--role-badge-foreground)]"
                aria-hidden="true"
              />
              {role}
            </p>
            {role === "vendor" && isPremiumVendor ? (
              <PremiumVendorBadge compact className="mt-1.5" />
            ) : null}
          </div>
        </div>
      </div>

      <nav aria-label="Explore" className="px-3 pb-4">
        <p className="mb-2 text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Explore
        </p>
        {exploreItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-all duration-300 ease-premium focus-visible:ring-2 focus-visible:ring-ring/60",
                active
                  ? "bg-[linear-gradient(110deg,var(--brand-tomato),var(--brand-orange))] text-white shadow-glow"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <nav aria-label="Dashboard" className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = activeHref === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-all duration-300 ease-premium focus-visible:ring-2 focus-visible:ring-ring/60",
                active
                  ? "bg-[linear-gradient(110deg,var(--brand-tomato),var(--brand-orange))] text-white shadow-glow"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
              <ChevronRight
                className={cn(
                  "ml-auto size-4 opacity-0 transition-opacity duration-200",
                  active ? "opacity-70" : "group-hover:opacity-50"
                )}
                aria-hidden="true"
              />
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border/70 p-3">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "w-full justify-start text-muted-foreground hover:text-foreground",
            isSigningOut && "cursor-not-allowed opacity-60"
          )}
        >
          <LogOut className="size-4" aria-hidden="true" />
          {isSigningOut ? "Signing out..." : "Logout"}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-svh bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border/70 bg-sidebar/85 shadow-card backdrop-blur-2xl lg:block">
        {sidebarContent}
      </aside>

      {mobileOpen ? (
        <div className="lg:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close dashboard menu"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-foreground/25 backdrop-blur-sm"
          />
          <motion.aside
            initial={reduceMotion ? false : { x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border/70 bg-sidebar/95 shadow-elevated backdrop-blur-2xl"
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close dashboard menu"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
            {sidebarContent}
          </motion.aside>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/70 sm:px-6">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-orange/40 to-transparent"
          />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex size-9 items-center justify-center rounded-xl border border-border/70 bg-card/70 text-foreground shadow-soft transition-all duration-300 ease-premium hover:border-brand-orange/30 hover:bg-accent/70 hover:text-accent-foreground lg:hidden"
            aria-label="Open dashboard menu"
          >
            <Menu className="size-4" aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Dashboard
            </p>
            <div className="flex items-center gap-2">
              <h1 className="truncate font-heading text-lg font-semibold tracking-tight">
                {getPageTitle(pathname, role)}
              </h1>
              {role === "vendor" && isPremiumVendor ? (
                <PremiumVendorChip compact className="hidden sm:inline-flex" />
              ) : null}
            </div>
          </div>
          <ThemeToggle />
        </header>

        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{
              duration: reduceMotion ? 0 : 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}
