"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useToast } from "@/components/toast-provider"
import { useAuthSession } from "@/lib/auth"
import { useTheme } from "next-themes"

type ThemeOption = {
  value: "light" | "dark"
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "light",
    label: "Light",
    description: "Use light theme",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Use dark theme",
    icon: Moon,
  },
]

export function SettingsPage() {
  const reduceMotion = useReducedMotion()
  const { isAuthenticated, user } = useAuthSession()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[40svh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Please sign in to continue.</p>
      </div>
    )
  }

  const handleThemeChange = (value: ThemeOption["value"]) => {
    setTheme(value)
    toast({
      variant: "success",
      title: "Theme updated",
      description: `Theme set to ${value}.`,
    })
  }

  return (
    <section
      aria-labelledby="settings-heading"
      className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
    >
      <div className="max-w-xl">
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Account settings
        </p>
        <h1 id="settings-heading" className="mt-3 font-heading text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <motion.div
        className="mt-8 rounded-3xl border border-border/70 bg-card/80 p-6 shadow-elevated backdrop-blur-2xl sm:p-8 lg:p-10"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="mb-6 font-heading text-lg font-semibold tracking-tight">
          Appearance
        </h2>
        <div className="space-y-3">
          {THEME_OPTIONS.map((option) => (
            <motion.div
              key={option.value}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: THEME_OPTIONS.indexOf(option) * 0.1,
              }}
            >
              <button
                type="button"
                onClick={() => handleThemeChange(option.value)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors duration-300",
                  mounted && theme === option.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <option.icon className="size-5 shrink-0" />
                <span className="flex-1 text-left">{option.label}</span>
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
                {mounted && theme === option.value && (
                  <span className="ml-auto text-xs font-semibold text-primary-foreground">
                    Selected
                  </span>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="mt-8 rounded-3xl border border-border/70 bg-card/80 p-6 shadow-elevated backdrop-blur-2xl sm:p-8 lg:p-10"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="mb-6 font-heading text-lg font-semibold tracking-tight">
          Account
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="" className="size-10 rounded-full object-cover" />
              ) : (
                <span className="grid size-10 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {(user.name?.[0] || user.email?.[0] || "U").toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}