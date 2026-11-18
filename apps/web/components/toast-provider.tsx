"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { CheckCircle2, X, XCircle } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

type ToastVariant = "success" | "error"

type Toast = {
  id: number
  title: string
  description?: string
  variant: ToastVariant
}

type ToastContextValue = {
  toast: (options: Omit<Toast, "id">) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = React.useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }

  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const reduceMotion = useReducedMotion()

  const dismiss = React.useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = React.useCallback(
    (options: Omit<Toast, "id">) => {
      const id = Date.now() + Math.random()
      setToasts((current) => [...current, { id, ...options }])

      window.setTimeout(() => {
        dismiss(id)
      }, 4500)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-3 px-4 sm:items-end sm:px-6"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toastItem) => {
            const isSuccess = toastItem.variant === "success"

            return (
              <motion.div
                key={toastItem.id}
                role={isSuccess ? "status" : "alert"}
                initial={reduceMotion ? false : { opacity: 0, y: -18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border bg-card/80 p-4 shadow-elevated backdrop-blur-2xl",
                  isSuccess ? "border-primary/25" : "border-destructive/25"
                )}
              >
                <div className="flex items-start gap-3">
                  {isSuccess ? (
                    <CheckCircle2
                      className="mt-0.5 size-5 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  ) : (
                    <XCircle
                      className="mt-0.5 size-5 shrink-0 text-destructive"
                      aria-hidden="true"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{toastItem.title}</p>
                    {toastItem.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {toastItem.description}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(toastItem.id)}
                    className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Dismiss notification"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
