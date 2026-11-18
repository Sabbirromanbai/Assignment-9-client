"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight, Menu, X } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

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
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 12)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
            </nav>
          </div>
        </div>
      ) : null}
    </motion.header>
  )
}
