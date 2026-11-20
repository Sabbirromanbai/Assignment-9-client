"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ArrowRight, ChevronDown, LayoutDashboard, LogOut, Menu, Settings, User, X } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { authClient } from "@/lib/auth-client"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/components/toast-provider"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Browse Menu", href: "/menu" },
] as const

function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`)
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const { data: session, isPending } = authClient.useSession()
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [accountOpen, setAccountOpen] = React.useState(false)
  const [isSigningOut, setIsSigningOut] = React.useState(false)
  const accountRef = React.useRef<HTMLDivElement | null>(null)

  const user = session?.user
  const displayName = user?.name || user?.email || "Account"
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

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
  }, [pathname])

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

  return (
    <motion.header
      initial={reduceMotion ? false : { y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl transition-all duration-300",
        scrolled
          ? "bg-background/90 shadow-soft supports-[backdrop-filter]:bg-background/75"
          : "supports-[backdrop-filter]:bg-background/65"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />

          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => {
              const active = isActive(pathname, item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200 ease-smooth",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />

          <div className="hidden items-center gap-2 md:flex">
            <span className="mx-1 h-5 w-px bg-border/80" aria-hidden="true" />
            {isPending ? (
              <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
            ) : user ? (
              <div ref={accountRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((value) => !value)}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-card/70 px-2.5 py-1.5 text-sm font-medium shadow-soft transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt=""
                      className="size-7 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {initials}
                    </span>
                  )}
                  <span className="max-w-28 truncate">{displayName}</span>
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform",
                      accountOpen && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </button>

                {accountOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-border/70 bg-card/90 p-2 shadow-elevated backdrop-blur-xl"
                  >
                    <div className="border-b border-border/70 px-3 py-2.5">
                      <p className="truncate text-sm font-medium">
                        {displayName}
                      </p>
                      {user.email ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      ) : null}
                      {(user as { role?: string })?.role ? (
                        <p className="mt-1 text-xs font-medium text-primary">
                          {(user as { role?: string })?.role}
                        </p>
                      ) : null}
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <LayoutDashboard
                          className="size-4"
                          aria-hidden="true"
                        />
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <User className="size-4" aria-hidden="true" />
                        Profile Settings
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        role="menuitem"
                        onClick={() => setAccountOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <Settings className="size-4" aria-hidden="true" />
                        Settings
                      </Link>
                    </div>

                    <div className="border-t border-border/70 pt-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <LogOut className="size-4" aria-hidden="true" />
                        {isSigningOut ? "Signing out..." : "Logout"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className={cn(buttonVariants(), "shadow-soft")}
                >
                  Sign Up
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
            className="relative inline-flex size-9 items-center justify-center rounded-lg border border-border/70 bg-card/60 text-foreground shadow-soft transition-colors duration-200 ease-smooth hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 md:hidden"
          >
            <Menu
              className={cn(
                "size-4 transition-all duration-200",
                open && "scale-0 opacity-0"
              )}
              aria-hidden="true"
            />
            <X
              className={cn(
                "absolute size-4 transition-all duration-200",
                !open && "scale-0 opacity-0"
              )}
              aria-hidden="true"
            />
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      {open ? (
        <div className="md:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-x-0 top-16 bottom-0 z-40 cursor-default bg-foreground/20 backdrop-blur-[2px]"
          />

          <div
            id="mobile-menu"
            className="absolute inset-x-0 top-full z-50 border-b border-border/70 bg-background/95 shadow-elevated backdrop-blur-xl animate-in fade-in-0 slide-in-from-top-2 duration-200"
          >
            <nav
              aria-label="Mobile"
              className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6"
            >
              {navigation.map((item) => {
                const active = isActive(pathname, item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-smooth",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    )}
                  >
                    {item.name}
                    <ArrowRight
                      className="size-4 opacity-50"
                      aria-hidden="true"
                    />
                  </Link>
                )
              })}

              <div className="my-3 h-px bg-border/70" aria-hidden="true" />

              {isPending ? (
                <div className="h-10 animate-pulse rounded-xl bg-muted" />
              ) : user ? (
                <div className="flex flex-col gap-2">
                  <div className="rounded-xl border border-border/70 bg-card/70 px-3 py-2.5">
                    <p className="truncate text-sm font-medium">{displayName}</p>
                    {user.email ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    ) : null}
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                  >
                    <LayoutDashboard className="size-4" aria-hidden="true" />
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setOpen(false)}
                    className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                  >
                    <User className="size-4" aria-hidden="true" />
                    Profile Settings
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setOpen(false)}
                    className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                  >
                    <Settings className="size-4" aria-hidden="true" />
                    Settings
                  </Link>
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
                    className={cn(buttonVariants(), "w-full")}
                  >
                    Sign Up
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      ) : null}
    </motion.header>
  )
}
