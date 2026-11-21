"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { PremiumVendorChip } from "@/components/premium-vendor-mark"
import { usePremiumVendor } from "@/components/premium-provider"
import { ProfileImageUpload } from "@/components/profile-image-upload"
import { useToast } from "@/components/toast-provider"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { API_BASE_URL, fetchWithAuth, updateVendorProfile, updateCustomerProfile, type VendorProfile } from "@/lib/api"
import { useAuthSession } from "@/lib/auth"

type ProfileValues = {
  name: string
  businessName: string
  image: string | null
}

function validate(values: ProfileValues, isVendor: boolean) {
  const errors: Partial<Record<keyof ProfileValues, string>> = {}

  if (!values.name.trim()) {
    errors.name = "Name is required."
  } else if (values.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters."
  } else if (values.name.trim().length > 100) {
    errors.name = "Name must be 100 characters or fewer."
  }

  if (isVendor) {
    if (values.businessName.trim() && values.businessName.trim().length > 150) {
      errors.businessName = "Business name must be 150 characters or fewer."
    }
  }

  return errors
}

export function ProfileManagement() {
  const { isPending, isAuthenticated, user, role } = useAuthSession()
  const reduceMotion = useReducedMotion()
  const { toast } = useToast()
  const { isPremiumVendor } = usePremiumVendor()

  const isVendor = role === "vendor"

  const [values, setValues] = React.useState<ProfileValues>({
    name: "",
    businessName: "",
    image: null,
  })
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof ProfileValues, string>>
  >({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isImageUploading, setIsImageUploading] = React.useState(false)
  const [vendorProfile, setVendorProfile] = React.useState<VendorProfile | null>(
    null
  )
  const [profileLoading, setProfileLoading] = React.useState(false)

  React.useEffect(() => {
    if (!user) return
    setValues((current) => ({
      ...current,
      name: user.name ?? "",
      image: user.image ?? null,
    }))
  }, [user])

  React.useEffect(() => {
    if (!isVendor || !user?.id) return
    const controller = new AbortController()
    setProfileLoading(true)
    fetchWithAuth<VendorProfile>("/api/vendors/profile", {}, controller.signal)
      .then((response) => {
        const profile = response.data
        setVendorProfile(profile)
        setValues((current) => ({
          ...current,
          name: profile.name ?? current.name,
          businessName: profile.businessName ?? "",
          image: profile.image ?? current.image,
        }))
      })
      .catch(() => {
        // fall back to session data
      })
      .finally(() => setProfileLoading(false))
    return () => controller.abort()
  }, [isVendor, user?.id])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate(values, isVendor)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      if (isVendor) {
        await updateVendorProfile({
          name: values.name.trim(),
          businessName: values.businessName.trim() || undefined,
          image: values.image ?? undefined,
        })
      } else {
        await updateCustomerProfile({
          name: values.name.trim(),
          image: values.image ?? undefined,
        })
      }

      toast({
        variant: "success",
        title: "Profile updated",
        description: "Your profile has been saved.",
      })

      // Allow the success toast to render before reloading the session
      window.setTimeout(() => window.location.reload(), 800)
    } catch (error) {
      toast({
        variant: "error",
        title: "Update failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to update your profile. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function updateField<K extends keyof ProfileValues>(
    field: K,
    value: ProfileValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  if (isPending || profileLoading) {
    return (
      <div className="flex min-h-[40svh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[40svh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Please sign in to continue.</p>
      </div>
    )
  }

  return (
    <section
      aria-labelledby="profile-heading"
      className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
    >
      <div className="max-w-xl">
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Account
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1
            id="profile-heading"
            className="font-heading text-3xl font-bold tracking-tight"
          >
            Profile settings
          </h1>
          {isVendor && isPremiumVendor ? <PremiumVendorChip /> : null}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Update your name, photo
          {isVendor ? ", and business name" : ""}.
        </p>
      </div>

      <motion.div
        className="mt-8 premium-card account-surface rounded-3xl p-6 shadow-elevated sm:p-8 lg:p-10"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
            <div className="w-full sm:w-40">
              <label className="mb-2 block text-sm font-medium">
                Profile image
              </label>
              <ProfileImageUpload
                value={values.image}
                disabled={isSubmitting || isImageUploading}
                onUploadingChange={setIsImageUploading}
                onChange={(url) => updateField("image", url)}
                withAuth
              />
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Full name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  autoComplete="name"
                  value={values.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "profile-name-error" : undefined}
                  className="premium-input h-11"
                  placeholder="Your name"
                />
                {errors.name ? (
                  <p id="profile-name-error" className="mt-2 text-sm text-destructive">
                    {errors.name}
                  </p>
                ) : null}
              </div>

              {isVendor ? (
                <div>
                  <label
                    htmlFor="profile-business"
                    className="mb-2 block text-sm font-medium"
                  >
                    Business name
                  </label>
                  <input
                    id="profile-business"
                    type="text"
                    autoComplete="organization"
                    value={values.businessName}
                    onChange={(event) =>
                      updateField("businessName", event.target.value)
                    }
                    aria-invalid={Boolean(errors.businessName)}
                    aria-describedby={
                      errors.businessName ? "profile-business-error" : undefined
                    }
                    className="premium-input h-11"
                    placeholder="Your business name"
                  />
                  {errors.businessName ? (
                    <p
                      id="profile-business-error"
                      className="mt-2 text-sm text-destructive"
                    >
                      {errors.businessName}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email ?? ""}
                  readOnly
                  className="read-only-field"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Email cannot be changed.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Role
                </label>
                <input
                  type="text"
                  value={role ?? ""}
                  readOnly
                  className="read-only-field capitalize"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || isImageUploading}
              className={cn(
                "h-11 rounded-lg bg-gradient-to-r from-primary to-primary/80 px-6 text-primary-foreground shadow-glow transition-all duration-300 hover:from-primary/90 hover:to-primary/70 hover:shadow-elevated",
                (isSubmitting || isImageUploading) && "cursor-not-allowed opacity-70"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </section>
  )
}