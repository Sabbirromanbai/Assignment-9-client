"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2, ShoppingCart, Store } from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { chooseRole, type ChooseRoleInput } from "@/lib/api"
import { useAuthSession } from "@/lib/auth"

type RoleOption = {
  value: ChooseRoleInput["role"]
  label: string
  description: string
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: "true" }>
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "customer",
    label: "Customer",
    description: "Order pizzas",
    icon: ShoppingCart,
  },
  {
    value: "vendor",
    label: "Vendor",
    description: "Sell pizzas",
    icon: Store,
  },
]

export default function ChooseRolePage() {
  const router = useRouter()
  const { isPending, isAuthenticated, roleSelectionPending, refetch } =
    useAuthSession()
  const [selectedRole, setSelectedRole] =
    React.useState<ChooseRoleInput["role"]>("customer")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (isPending) {
      return
    }

    if (!isAuthenticated) {
      router.replace("/sign-in?callbackURL=%2Fchoose-role")
      return
    }

    if (!roleSelectionPending) {
      router.replace("/dashboard")
    }
  }, [isPending, isAuthenticated, roleSelectionPending, router])

  async function handleContinue() {
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await chooseRole(selectedRole)
      await refetch()
      router.replace("/dashboard")
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save your choice. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isPending || !isAuthenticated || !roleSelectionPending) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm">Checking your session...</p>
        </div>
      </div>
    )
  }

  return (
    <section className="mx-auto flex min-h-[60svh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <div className="w-full max-w-xl">
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Welcome to Pizzabari
        </p>
        <h1 className="mt-3 font-heading text-headline text-balance">
          How will you use Pizzabari?
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Pick the option that fits you best. This choice is saved to your
          account.
        </p>

        <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
          {ROLE_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = selectedRole === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setSelectedRole(option.value)
                  setError(null)
                }}
                aria-pressed={isSelected}
                className={cn(
                  "relative rounded-2xl border p-5 shadow-card transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                    : "border-border/70 bg-card/80 hover:border-primary/40 hover:bg-primary/5"
                )}
              >
                {isSelected ? (
                  <CheckCircle2
                    className="absolute right-4 top-4 size-5 text-primary"
                    aria-hidden="true"
                  />
                ) : null}
                <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-brand-tomato/12 to-brand-orange/16 text-brand-orange">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="mt-4 block font-heading text-lg font-semibold tracking-tight">
                  {option.label}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {option.description}
                </span>
              </button>
            )
          })}
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-left text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleContinue}
          disabled={isSubmitting}
          className={cn(
            buttonVariants(),
            "mt-8 h-12 w-full text-sm shadow-glow",
            isSubmitting &&
              "pointer-events-none cursor-not-allowed opacity-60 shadow-none"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </section>
  )
}
