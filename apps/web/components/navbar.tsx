"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowRight,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
  X,
  type LucideIcon,
} from "lucide-react"
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { Logo } from "@/components/logo"
import { PremiumSkeleton } from "@/components/premium-ui"
import {
  PremiumCrown,
  PremiumVendorBadge,
} from "@/components/premium-vendor-mark"
import { usePremiumVendor } from "@/components/premium-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/components/toast-provider"
import { authClient } from "@/lib/auth-client"
import { useAuthSession } from "@/lib/auth"
import {
  DASHBOARD_NAV,
  ROLE_HOME,
  type DashboardRole,
} from "@/lib/dashboard-nav"

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const ROLE_LABELS: Record<DashboardRole, string> = {
  vendor: "Vendor",
  customer: "Customer",
  admin: "Admin",
}

const navigation = [
  { name: "Home", href: "/" },
  { name: "Browse Menu", href: "/menu" },
] as const

function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`)
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function AccountMenuItem({
  href,
  icon: Icon,
  label,
  onNavigate,
  reduceMotion,
}: {
  href: string
  icon: LucideIcon
  label: string
  onNavigate: () => void
  reduceMotion: boolean | null
}) {
  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { x: 2 }}
      transition={{ duration: 0.2, ease: EASE }}
      className="group"
    >
      <Link
        href={href}
        role="menuitem"
        onClick={onNavigate}
        className="account-menu-item"
      >
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="truncate">{label}</span>
        <ArrowRight
          className="ml-auto size-3.5 text-muted-foreground/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          aria-hidden="true"
        />
      </Link>
    </motion.div>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const { isPending, user, role } = useAuthSession()
  const { isPremiumVendor } = usePremiumVendor()
  const { toast } = useToast()

  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [accountOpen, setAccountOpen] = React.useState(false)
  const [isSigningOut, setIsSigningOut] = React.useState(false)
  const accountRef = React.useRef<HTMLDivElement | null>(null)

  const navPointerX = useMotionValue(0)
  const navPointerY = useMotionValue(0)
  const smoothNavX = useSpring(navPointerX, {
    stiffness: 180,
    damping: 24,
    mass: 0.4,
  })
  const smoothNavY = useSpring(navPointerY, {
    stiffness: 180,
    damping: 24,
    mass: 0.4,
  })
  const navRotateX = useTransform(smoothNavY, [-1, 1], [1.4, -1.4])
  const navRotateY = useTransform(smoothNavX, [-1, 1], [-2.4, 2.4])
  const navTransform = useMotionTemplate`perspective(1100px) rotateX(${navRotateX}deg) rotateY(${navRotateY}deg)`

  const displayName = user?.name || user?.email || "Account"
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const roleLabel = role ? ROLE_LABELS[role] : null
  const rawRole = (user as { role?: string | null } | null | undefined)?.role
  const visibleRoleLabel = roleLabel || (rawRole ? capitalize(rawRole) : null)

  const primaryItems = React.useMemo(() => {
    if (!role) {
      return navigation
    }

    return [
      ...navigation,
      {
        name: role === "vendor" ? "Vendor Studio" : "Dashboard",
        href: ROLE_HOME[role],
      },
    ]
  }, [role])

  const roleItems = React.useMemo(
    () => (role ? DASHBOARD_NAV[role] : []),
    [role]
  )

  const menuTransition =
    reduceMotion === true
      ? { duration: 0 }
      : { duration: 0.22, ease: EASE }

  React.useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 12)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  React.useEffect(() => {
    if (!accountOpen) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAccountOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [accountOpen])

  React.useEffect(() => {
    setAccountOpen(false)
    setOpen(false)
  }, [pathname])

  React.useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)")

    function handleViewportChange(event: MediaQueryListEvent) {
      if (event.matches) {
        setOpen(false)
      }
    }

    desktop.addEventListener("change", handleViewportChange)

    return () => desktop.removeEventListener("change", handleViewportChange)
  }, [])

  React.useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  function handleNavPointerMove(event: React.MouseEvent<HTMLElement>) {
    if (reduceMotion) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    navPointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2)
    navPointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2)
  }

  function resetNavPointer() {
    navPointerX.set(0)
    navPointerY.set(0)
  }

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
      router.push("/")
      router.refresh()
    } catch {
      toast({
        variant: "error",
        title: "Sign out failed",
        description: "Unable to sign out. Please try again.",
      })
    } finally {
      setIsSigningOut(false)
      setAccountOpen(false)
    }
  }

  return (
    <motion.header
      initial={reduceMotion ? false : { y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: EASE }}
      className={cn(
        "sticky top-0 z-50 border-b border-border/70 bg-background/75 backdrop-blur-2xl transition-[background-color,box-shadow,border-color] duration-300 supports-[backdrop-filter]:bg-background/65",
        scrolled && "bg-background/90 shadow-card supports-[backdrop-filter]:bg-background/78"
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent opacity-70"
      />

      <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-6 lg:gap-8">
          <Logo className="shrink-0" />

          <motion.nav
            aria-label="Primary"
            onMouseMove={handleNavPointerMove}
            onMouseLeave={resetNavPointer}
            style={
              reduceMotion
                ? undefined
                : {
                    transform: navTransform,
                    transformPerspective: 1100,
                    transformStyle: "preserve-3d",
                  }
            }
            className="relative hidden items-center gap-1 md:flex"
          >
            {primaryItems.map((item, index) => {
              const active = isActive(pathname, item.href)

              return (
                <motion.div
                  key={item.href}
                  initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.08 + index * 0.05,
                    ease: EASE,
                  }}
                >
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group/nav relative isolate rounded-xl px-3.5 py-2 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring/60",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {active ? (
                      <motion.span
                        layoutId="premium-nav-active-desktop"
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 rounded-xl border border-brand-orange/25 bg-[linear-gradient(110deg,color-mix(in_oklab,var(--brand-tomato)_12%,transparent),color-mix(in_oklab,var(--brand-orange)_16%,transparent),color-mix(in_oklab,var(--brand-cheese)_22%,transparent))] shadow-soft"
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 420, damping: 34 }
                        }
                      />
                    ) : null}
                    <span className="relative z-10">{item.name}</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute bottom-1 left-1/2 h-px w-0 -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,var(--brand-tomato),var(--brand-orange),var(--brand-cheese))] transition-all duration-300 ease-premium",
                        active
                          ? "w-5 opacity-70"
                          : "opacity-0 group-hover/nav:w-5 group-hover/nav:opacity-60"
                      )}
                    />
                  </Link>
                </motion.div>
              )
            })}
          </motion.nav>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle />

          <span
            aria-hidden="true"
            className="mx-0.5 hidden h-5 w-px bg-border/70 sm:block"
          />

          <div className="hidden items-center gap-2 md:flex">
            {isPending ? (
              <div className="flex items-center gap-2">
                <PremiumSkeleton className="size-8 rounded-full" />
                <PremiumSkeleton className="h-8 w-24 rounded-xl" />
              </div>
            ) : user ? (
              <motion.div ref={accountRef} className="relative">
                <motion.button
                  type="button"
                  onClick={() => setAccountOpen((value) => !value)}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  whileHover={reduceMotion ? undefined : { y: -1 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="account-surface account-surface-interactive inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  <span className="relative shrink-0">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.image}
                        alt=""
                        className="size-7 rounded-full object-cover ring-1 ring-border/70"
                      />
                    ) : (
                      <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-brand-orange to-brand-tomato text-[11px] font-bold text-white shadow-soft">
                        {initials}
                      </span>
                    )}
                    {isPremiumVendor ? (
                      <PremiumCrown className="absolute -top-2 -left-2" />
                    ) : null}
                  </span>
                  <span className="hidden max-w-24 truncate sm:block lg:max-w-32">
                    {displayName}
                  </span>
                  {isPremiumVendor ? (
                    <PremiumVendorBadge compact className="hidden lg:inline-flex" />
                  ) : null}
                  {visibleRoleLabel ? (
                    <span className="role-badge hidden lg:inline-flex">
                      {visibleRoleLabel}
                    </span>
                  ) : null}
                  <ChevronDown
                    className={cn(
                      "size-3.5 text-muted-foreground transition-transform duration-300 ease-premium",
                      accountOpen && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </motion.button>

                <AnimatePresence>
                  {accountOpen ? (
                    <motion.div
                      role="menu"
                      initial={
                        reduceMotion ? false : { opacity: 0, y: -8, scale: 0.98 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={menuTransition}
                      className="account-menu absolute right-0 top-full z-50 mt-2 w-72 origin-top-right p-2"
                    >
                      <div className="flex items-center gap-3 border-b border-border/70 px-3 py-3">
                        <span className="relative shrink-0">
                          {user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.image}
                              alt=""
                              className="size-9 rounded-full object-cover ring-1 ring-border/70"
                            />
                          ) : (
                            <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-brand-orange to-brand-tomato text-xs font-bold text-white">
                              {initials}
                            </span>
                          )}
                          {isPremiumVendor ? (
                            <PremiumCrown
                              tooltipPlacement="bottom"
                              className="absolute -top-2 -left-2"
                            />
                          ) : null}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {displayName}
                          </p>
                          {user.email ? (
                            <p className="truncate text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          ) : null}
                          {isPremiumVendor ? (
                            <PremiumVendorBadge className="mt-1.5" compact />
                          ) : null}
                        </div>
                        {visibleRoleLabel ? (
                          <span className="role-badge px-2 py-1">
                            {visibleRoleLabel}
                          </span>
                        ) : null}
                      </div>

                      <div className="py-1">
                        {roleItems.length > 0 ? (
                          roleItems.map((item) => (
                            <AccountMenuItem
                              key={item.href}
                              href={item.href}
                              icon={item.icon}
                              label={item.label}
                              onNavigate={() => setAccountOpen(false)}
                              reduceMotion={reduceMotion}
                            />
                          ))
                        ) : (
                          <AccountMenuItem
                            href="/dashboard"
                            icon={LayoutDashboard}
                            label="Dashboard"
                            onNavigate={() => setAccountOpen(false)}
                            reduceMotion={reduceMotion}
                          />
                        )}
                      </div>

                      <div className="border-t border-border/70 pt-1">
                        <AccountMenuItem
                          href="/dashboard/profile"
                          icon={User}
                          label="Profile settings"
                          onNavigate={() => setAccountOpen(false)}
                          reduceMotion={reduceMotion}
                        />
                        <AccountMenuItem
                          href="/dashboard/settings"
                          icon={Settings}
                          label="Settings"
                          onNavigate={() => setAccountOpen(false)}
                          reduceMotion={reduceMotion}
                        />
                        <motion.button
                          type="button"
                          role="menuitem"
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                          whileHover={reduceMotion ? undefined : { x: 2 }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive focus-visible:bg-destructive/10 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <LogOut className="size-4" aria-hidden="true" />
                          {isSigningOut ? "Signing out..." : "Logout"}
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            ) : (
              <>
                <motion.div
                  whileHover={reduceMotion ? undefined : { y: -1 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  transition={{ duration: 0.2, ease: EASE }}
                >
                  <Link
                    href="/sign-in"
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Sign In
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  transition={{ duration: 0.2, ease: EASE }}
                >
                  <Link
                    href="/sign-up"
                    className={cn(buttonVariants(), "shadow-soft hover:shadow-glow")}
                  >
                    Sign Up
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          <motion.button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
            whileTap={reduceMotion ? undefined : { scale: 0.94 }}
            className="relative inline-flex size-9 items-center justify-center rounded-xl border border-border/70 bg-card/70 text-foreground shadow-soft outline-none backdrop-blur-xl transition-colors duration-200 hover:border-primary/25 hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring/60 md:hidden"
          >
            <Menu
              className={cn(
                "size-4 transition-all duration-300 ease-premium",
                open && "scale-0 opacity-0"
              )}
              aria-hidden="true"
            />
            <X
              className={cn(
                "absolute size-4 transition-all duration-300 ease-premium",
                !open && "scale-0 opacity-0"
              )}
              aria-hidden="true"
            />
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="md:hidden"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={menuTransition}
          >
            <button
              type="button"
              tabIndex={-1}
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="fixed inset-x-0 top-16 bottom-0 z-40 cursor-default bg-foreground/20 backdrop-blur-[2px]"
            />

            <motion.div
              id="mobile-menu"
              initial={
                reduceMotion ? false : { opacity: 0, y: -10, scaleY: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -8, scaleY: 0.98 }}
              transition={menuTransition}
              className="absolute inset-x-0 top-full z-50 origin-top overflow-hidden border-b border-[var(--account-border)] bg-[var(--menu-surface)] shadow-elevated backdrop-blur-2xl"
            >
              <nav
                aria-label="Mobile"
                className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6"
              >
                {primaryItems.map((item, index) => {
                  const active = isActive(pathname, item.href)

                  return (
                    <motion.div
                      key={item.href}
                      initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.04 + index * 0.04,
                        ease: EASE,
                      }}
                    >
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "group/mobile relative isolate flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring/60",
                          active
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {active ? (
                          <motion.span
                            layoutId="premium-nav-active-mobile-primary"
                            aria-hidden="true"
                            className="absolute inset-0 -z-10 rounded-xl border border-brand-orange/25 bg-[linear-gradient(110deg,color-mix(in_oklab,var(--brand-tomato)_12%,transparent),color-mix(in_oklab,var(--brand-orange)_18%,transparent),color-mix(in_oklab,var(--brand-cheese)_24%,transparent))]"
                            transition={
                              reduceMotion
                                ? { duration: 0 }
                                : { type: "spring", stiffness: 420, damping: 34 }
                            }
                          />
                        ) : null}
                        <span className="relative z-10">{item.name}</span>
                        <ArrowRight
                          className="relative z-10 size-4 text-muted-foreground/50 transition-transform duration-200 ease-premium group-hover/mobile:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </motion.div>
                  )
                })}

                <div className="my-3 h-px bg-border/70" aria-hidden="true" />

                {isPending ? (
                  <div className="flex flex-col gap-2">
                    <PremiumSkeleton className="h-10 rounded-xl" />
                    <PremiumSkeleton className="h-10 rounded-xl" />
                  </div>
                ) : user ? (
                  <div className="flex flex-col gap-2">
                    <div className="account-surface flex items-center gap-3 rounded-xl px-3 py-2.5">
                      <span className="relative shrink-0">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.image}
                            alt=""
                            className="size-8 rounded-full object-cover ring-1 ring-border/70"
                          />
                        ) : (
                          <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-brand-orange to-brand-tomato text-[11px] font-bold text-white">
                            {initials}
                          </span>
                        )}
                        {isPremiumVendor ? (
                          <PremiumCrown
                            tooltipPlacement="bottom"
                            className="absolute -top-2 -left-2"
                          />
                        ) : null}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {displayName}
                        </p>
                        {user.email ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        ) : null}
                        {isPremiumVendor ? (
                          <PremiumVendorBadge className="mt-1.5" compact />
                        ) : null}
                      </div>
                      {visibleRoleLabel ? (
                        <span className="role-badge px-2 py-1">
                          {visibleRoleLabel}
                        </span>
                      ) : null}
                    </div>

                    {roleItems.length > 0 ? (
                      <div className="flex flex-col gap-1 pt-1">
                        <p className="px-3 pb-1 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                          {visibleRoleLabel} workspace
                        </p>
                        {roleItems.slice(0, 5).map((item) => {
                          const active = isActive(pathname, item.href)
                          const Icon = item.icon

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              aria-current={active ? "page" : undefined}
                              onClick={() => setOpen(false)}
                              className={cn(
                                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors duration-200",
                                active
                                  ? "bg-accent/70 text-accent-foreground"
                                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                              )}
                            >
                              <Icon className="size-4" aria-hidden="true" />
                              {item.label}
                            </Link>
                          )
                        })}
                      </div>
                    ) : (
                      <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                      >
                        <LayoutDashboard className="size-4" aria-hidden="true" />
                        Dashboard
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                    >
                      <LogOut className="size-4" aria-hidden="true" />
                      {isSigningOut ? "Signing out..." : "Logout"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/sign-in"
                      onClick={() => setOpen(false)}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full"
                      )}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setOpen(false)}
                      className={cn(buttonVariants(), "w-full shadow-soft")}
                    >
                      Sign Up
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                )}
              </nav>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  )
}
