"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@workspace/ui/components/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const label = mounted
    ? isDark
      ? "Switch to light mode"
      : "Switch to dark mode"
    : "Toggle theme"

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative text-muted-foreground hover:text-foreground"
      aria-pressed={mounted ? isDark : undefined}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun
        className="size-4 scale-100 rotate-0 transition-transform duration-300 ease-smooth dark:scale-0 dark:-rotate-90"
        aria-hidden="true"
      />
      <Moon
        className="absolute size-4 scale-0 rotate-90 transition-transform duration-300 ease-smooth dark:scale-100 dark:rotate-0"
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </Button>
  )
}
