"use client"

import * as React from "react"
import { Moon, Sparkles, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@workspace/ui/lib/utils"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const reduceMotion = useReducedMotion()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  const label = mounted
    ? isDark
      ? "Switch to light mode"
      : "Switch to dark mode"
    : "Toggle theme"

  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={mounted ? isDark : undefined}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      whileHover={reduceMotion ? undefined : { y: -1, scale: 1.03 }}
      whileTap={reduceMotion ? undefined : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={cn(
        "relative inline-flex h-8 w-[3.25rem] shrink-0 items-center rounded-full border p-0.5 outline-none transition-[background-color,border-color,box-shadow] duration-500 ease-premium focus-visible:ring-2 focus-visible:ring-ring/60",
        isDark
          ? "border-[var(--premium-gold-border)] bg-[linear-gradient(110deg,var(--background)_0%,var(--card)_55%,var(--premium-gold-wash)_100%)] shadow-[0_0_0_1px_var(--premium-gold-border),0_8px_22px_-12px_var(--premium-glow)]"
          : "border-border/70 bg-[linear-gradient(110deg,var(--background)_0%,var(--card)_55%,color-mix(in_oklab,var(--brand-cheese)_55%,transparent)_100%)] shadow-soft"
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
      >
        <span
          className={cn(
            "absolute -inset-y-2 w-6 bg-gradient-to-r from-transparent via-white/55 to-transparent blur-[2px] transition-transform duration-700 ease-premium",
            isDark
              ? "translate-x-11 opacity-40"
              : "-translate-x-6 opacity-30"
          )}
        />
      </span>

      <Sun
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-[7px] size-3.5 transition-all duration-500 ease-premium",
          isDark
            ? "scale-75 text-[var(--premium-gold)] opacity-60"
            : "scale-100 text-brand-orange opacity-100"
        )}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute right-[7px] size-3.5 transition-all duration-500 ease-premium",
          isDark
            ? "scale-100 text-[var(--premium-gold-soft)] opacity-100"
            : "scale-75 text-muted-foreground opacity-45"
        )}
      />

      <motion.span
        aria-hidden="true"
        animate={reduceMotion ? undefined : { x: isDark ? 26 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn(
          "relative z-10 grid size-6 place-items-center rounded-full shadow-elevated ring-1 ring-white/40 transition-colors duration-500",
          isDark
            ? "premium-gold-surface text-[var(--premium-gold-ink)]"
            : "bg-[linear-gradient(140deg,#ffffff_0%,var(--card)_55%,color-mix(in_oklab,var(--brand-cheese)_60%,transparent)_100%)] text-brand-orange"
        )}
      >
        {isDark ? (
          <Moon className="size-3.5" aria-hidden="true" />
        ) : (
          <Sparkles className="size-3.5" aria-hidden="true" />
        )}
      </motion.span>
    </motion.button>
  )
}
