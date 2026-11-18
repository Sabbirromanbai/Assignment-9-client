"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { ProfileImageUpload } from "@/components/profile-image-upload"
import { authClient } from "@/lib/auth-client"
import { useToast } from "@/components/toast-provider"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type SignUpValues = {
  name: string
  email: string
  password: string
  image: string
  role: "customer" | "vendor"
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values: SignUpValues) {
  const errors: Partial<Record<keyof SignUpValues, string>> = {}

  if (!values.name.trim()) {
    errors.name = "Full name is required."
  } else if (values.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters."
  }

  if (!values.email.trim()) {
    errors.email = "Email is required."
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address."
  }

  if (!values.password) {
    errors.password = "Password is required."
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters."
  } else if (!/[A-Z]/.test(values.password)) {
    errors.password = "Password must include an uppercase letter."
  } else if (!/[a-z]/.test(values.password)) {
    errors.password = "Password must include a lowercase letter."
  }

  if (!values.role) {
    errors.role = "Select an account type."
  }

  return errors
}

export function SignUpForm() {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const { toast } = useToast()
  const [values, setValues] = React.useState<SignUpValues>({
    name: "",
    email: "",
    password: "",
    image: "",
    role: "customer",
  })
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof SignUpValues, string>>
  >({})
  const [showPassword, setShowPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isImageUploading, setIsImageUploading] = React.useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await authClient.signUp.email({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
        image: values.image.trim() || undefined,
      } as any)

      if (error) {
        toast({
          variant: "error",
          title: "Account creation failed",
          description: error.message || "Unable to create your account.",
        })
        return
      }

      toast({
        variant: "success",
        title: "Account created",
        description: "Welcome to PizzaHub. Redirecting now.",
      })
      router.push("/")
      router.refresh()
    } catch {
      toast({
        variant: "error",
        title: "Account creation failed",
        description: "Unable to create your account. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleSignUp() {
    if (isSubmitting || isGoogleLoading) {
      return
    }

    setIsGoogleLoading(true)

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/`,
      })

      if (error) {
        toast({
          variant: "error",
          title: "Google sign-up failed",
          description: error.message || "Unable to continue with Google.",
        })
        setIsGoogleLoading(false)
      }
    } catch {
      toast({
        variant: "error",
        title: "Google sign-up failed",
        description: "Unable to continue with Google. Please try again.",
      })
      setIsGoogleLoading(false)
    }
  }

  function updateField<K extends keyof SignUpValues>(
    field: K,
    value: SignUpValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  return (
    <section
      aria-labelledby="sign-up-heading"
      className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden bg-black"
    >
      <Image
        src="/images/hero-pizza.jpg"
        alt="Wood-fired pizza with bubbling cheese and basil"
        fill
        priority
        quality={85}
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/55 to-black/20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent"
      />

      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-16">
        <motion.div
          className="max-w-xl"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-medium tracking-[0.2em] text-white/75 uppercase">
            Join PizzaHub
          </p>
          <h1
            id="sign-up-heading"
            className="mt-4 font-heading text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl"
          >
            Create your
            <br />
            <span className="text-primary">kitchen account.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/82">
            Order from trusted local pizzerias or publish your own menu and
            manage orders as a vendor.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/82">
            <li className="flex items-center gap-3">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              Customer and vendor accounts
            </li>
            <li className="flex items-center gap-3">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              Passwords with uppercase and lowercase letters
            </li>
            <li className="flex items-center gap-3">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              Optional profile image URL
            </li>
          </ul>
        </motion.div>

        <motion.div
          className="rounded-3xl border border-white/20 bg-background/78 p-6 shadow-elevated backdrop-blur-2xl sm:p-8"
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-8">
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Account
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight">
              Sign up
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a customer or vendor account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
            >
              <label htmlFor="sign-up-name" className="mb-2 block text-sm font-medium">
                Full name
              </label>
              <input
                id="sign-up-name"
                name="name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "sign-up-name-error" : undefined}
                className="h-11 w-full rounded-lg border border-border/70 bg-background/70 px-3 text-sm outline-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/25"
                placeholder="Your name"
              />
              {errors.name ? (
                <p id="sign-up-name-error" className="mt-2 text-sm text-destructive">
                  {errors.name}
                </p>
              ) : null}
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.26 }}
            >
              <label htmlFor="sign-up-email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <input
                id="sign-up-email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(event) => updateField("email", event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "sign-up-email-error" : undefined}
                className="h-11 w-full rounded-lg border border-border/70 bg-background/70 px-3 text-sm outline-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/25"
                placeholder="you@example.com"
              />
              {errors.email ? (
                <p id="sign-up-email-error" className="mt-2 text-sm text-destructive">
                  {errors.email}
                </p>
              ) : null}
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.32 }}
            >
              <label
                htmlFor="sign-up-password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="sign-up-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={values.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "sign-up-password-error" : undefined
                  }
                  className="h-11 w-full rounded-lg border border-border/70 bg-background/70 px-3 pr-11 text-sm outline-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/25"
                  placeholder="At least 6 characters"
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
                  id="sign-up-password-error"
                  className="mt-2 text-sm text-destructive"
                >
                  {errors.password}
                </p>
              ) : null}
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.38 }}
            >
              <label
                htmlFor="sign-up-role"
                className="mb-2 block text-sm font-medium"
              >
                Account type
              </label>
              <select
                id="sign-up-role"
                name="role"
                value={values.role}
                onChange={(event) =>
                  updateField("role", event.target.value as SignUpValues["role"])
                }
                aria-invalid={Boolean(errors.role)}
                aria-describedby={errors.role ? "sign-up-role-error" : undefined}
                className="h-11 w-full rounded-lg border border-border/70 bg-background/70 px-3 text-sm outline-none backdrop-blur-sm transition-colors focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/25"
              >
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
              </select>
              {errors.role ? (
                <p id="sign-up-role-error" className="mt-2 text-sm text-destructive">
                  {errors.role}
                </p>
              ) : null}
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.44 }}
            >
              <label className="mb-2 block text-sm font-medium">
                Profile image
                <span className="ml-1 text-muted-foreground">(optional)</span>
              </label>
              <ProfileImageUpload
                value={values.image || null}
                disabled={isSubmitting || isGoogleLoading}
                onUploadingChange={setIsImageUploading}
                onChange={(url) => updateField("image", url ?? "")}
              />
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.5 }}
            >
              <button
                type="submit"
                disabled={isSubmitting || isGoogleLoading || isImageUploading}
                className={cn(
                  "h-11 w-full rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-glow transition-all duration-300 hover:from-primary/90 hover:to-primary/70 hover:shadow-elevated",
                  (isSubmitting || isGoogleLoading || isImageUploading) && "cursor-not-allowed opacity-70"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                    Creating account
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.56 }}
              className="relative"
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-1/2 h-px bg-border/70"
              />
              <span className="relative mx-auto block w-fit bg-background/78 px-3 text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                or continue with
              </span>
            </motion.div>

            <motion.button
              type="button"
              disabled={isSubmitting || isGoogleLoading}
              onClick={handleGoogleSignUp}
              className={cn(
                "flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-border/70 bg-background/70 text-sm font-medium shadow-soft backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:shadow-elevated",
                (isSubmitting || isGoogleLoading) && "cursor-not-allowed opacity-70"
              )}
              whileHover={reduceMotion ? undefined : { y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.99 }}
            >
              {isGoogleLoading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-primary transition-colors hover:text-primary/80"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  )
}

function GoogleIcon() {
  return (
    <svg
      className="size-5"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
