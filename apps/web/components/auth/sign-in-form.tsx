"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { authClient } from "@/lib/auth-client"
import { useToast } from "@/components/toast-provider"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type SignInValues = {
  email: string
  password: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values: SignInValues) {
  const errors: Partial<Record<keyof SignInValues, string>> = {}

  if (!values.email.trim()) {
    errors.email = "Email is required."
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address."
  }

  if (!values.password) {
    errors.password = "Password is required."
  }

  return errors
}

export function SignInForm() {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const { toast } = useToast()
  const [values, setValues] = React.useState<SignInValues>({
    email: "",
    password: "",
  })
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof SignInValues, string>>
  >({})
  const [showPassword, setShowPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await authClient.signIn.email({
        email: values.email.trim(),
        password: values.password,
      })

      if (error) {
        toast({
          variant: "error",
          title: "Sign in failed",
          description: error.message || "Unable to sign in. Please try again.",
        })
        return
      }

      toast({
        variant: "success",
        title: "Welcome back",
        description: "Signing you in to PizzaHub.",
      })
      router.push("/")
      router.refresh()
    } catch {
      toast({
        variant: "error",
        title: "Sign in failed",
        description: "Unable to sign in. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function updateField<K extends keyof SignInValues>(
    field: K,
    value: SignInValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  return (
    <div className="grid min-h-[calc(100svh-4rem)] lg:grid-cols-[1.05fr_0.95fr]">
      <motion.section
        aria-labelledby="sign-in-heading"
        className="relative isolate overflow-hidden bg-black"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src="/images/hero-pizza.jpg"
          alt="Wood-fired pizza with bubbling cheese and basil"
          fill
          priority
          quality={85}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"
        />

        <div className="relative z-10 flex h-full min-h-[40svh] flex-col justify-end p-6 sm:p-10 lg:min-h-full lg:p-14">
          <motion.p
            className="text-xs font-medium tracking-[0.2em] text-white/75 uppercase"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            Welcome back
          </motion.p>
          <motion.h1
            id="sign-in-heading"
            className="mt-4 max-w-md font-heading text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
          >
            The table is set. Sign in to continue.
          </motion.h1>
          <motion.p
            className="mt-5 max-w-md text-base leading-relaxed text-white/80"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
          >
            Track orders, revisit favorites, and pick up where your last slice
            left off.
          </motion.p>
          <motion.div
            className="mt-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur-md"
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.38 }}
          >
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            Wood-fired daily
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        aria-label="Sign in form"
        className="relative flex items-center justify-center overflow-hidden bg-background/85 px-4 py-12 backdrop-blur-2xl sm:px-6 lg:px-12"
        initial={reduceMotion ? false : { opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.545_0.21_27.5/0.08),transparent_45%)]" aria-hidden="true" />
        <div className="relative w-full max-w-md rounded-3xl border border-border/60 bg-card/72 p-6 shadow-elevated backdrop-blur-2xl sm:p-8">
          <div className="mb-8">
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Account
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight">
              Sign in
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use your email and password to access PizzaHub.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
            >
              <label
                htmlFor="sign-in-email"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>
              <input
                id="sign-in-email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(event) => updateField("email", event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "sign-in-email-error" : undefined}
                className="h-11 w-full rounded-lg border border-border/70 bg-background/70 px-3 text-sm outline-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/25"
                placeholder="you@example.com"
              />
              {errors.email ? (
                <p
                  id="sign-in-email-error"
                  className="mt-2 text-sm text-destructive"
                >
                  {errors.email}
                </p>
              ) : null}
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.28 }}
            >
              <label
                htmlFor="sign-in-password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="sign-in-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={values.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "sign-in-password-error" : undefined
                  }
                  className="h-11 w-full rounded-lg border border-border/70 bg-background/70 px-3 pr-11 text-sm outline-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/25"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password ? (
                <p
                  id="sign-in-password-error"
                  className="mt-2 text-sm text-destructive"
                >
                  {errors.password}
                </p>
              ) : null}
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.36 }}
            >
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "h-11 w-full rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-glow transition-all duration-300 hover:from-primary/90 hover:to-primary/70 hover:shadow-elevated",
                  isSubmitting && "cursor-not-allowed opacity-70"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                    Signing in
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </motion.div>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            New to PizzaHub?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-primary transition-colors hover:text-primary/80"
            >
              Create an account
            </Link>
          </p>
        </div>
      </motion.section>
    </div>
  )
}
