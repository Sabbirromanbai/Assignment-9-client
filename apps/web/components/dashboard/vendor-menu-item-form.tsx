"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, Pizza } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { ProfileImageUpload } from "@/components/profile-image-upload"
import { useToast } from "@/components/toast-provider"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { createMenuItem } from "@/lib/api"
import { PIZZA_CATEGORIES, type PizzaCategory } from "@/lib/dashboard-nav"

type MenuItemValues = {
  itemName: string
  category: PizzaCategory
  description: string
  price: string
  location: string
  image: string | null
}

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/

function validate(values: MenuItemValues) {
  const errors: Partial<Record<keyof MenuItemValues, string>> = {}

  if (!values.itemName.trim()) {
    errors.itemName = "Item name is required."
  } else if (values.itemName.trim().length > 100) {
    errors.itemName = "Item name must be 100 characters or fewer."
  }

  if (!values.category) {
    errors.category = "Category is required."
  }

  if (!values.description.trim()) {
    errors.description = "Description is required."
  } else if (values.description.trim().length > 2000) {
    errors.description = "Description must be 2000 characters or fewer."
  }

  if (!values.price) {
    errors.price = "Price is required."
  } else if (!PRICE_PATTERN.test(values.price)) {
    errors.price = "Enter a valid price."
  } else if (parseFloat(values.price) <= 0) {
    errors.price = "Price must be greater than 0."
  }

  if (!values.location.trim()) {
    errors.location = "Location is required."
  } else if (values.location.trim().length > 200) {
    errors.location = "Location must be 200 characters or fewer."
  }

  if (!values.image) {
    errors.image = "A menu item image is required."
  }

  return errors
}

export function VendorMenuItemForm() {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const { toast } = useToast()
  const [values, setValues] = React.useState<MenuItemValues>({
    itemName: "",
    category: "Classic Pizzas",
    description: "",
    price: "",
    location: "",
    image: null,
  })
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof MenuItemValues, string>>
  >({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isImageUploading, setIsImageUploading] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const image = values.image
    if (!image) {
      return
    }

    setIsSubmitting(true)

    try {
      const created = await createMenuItem({
        itemName: values.itemName.trim(),
        category: values.category,
        description: values.description.trim(),
        price: parseFloat(values.price),
        location: values.location.trim(),
        images: [image],
      })

      toast({
        variant: "success",
        title: "Menu item submitted",
        description:
          created.itemName + " has been submitted for approval.",
      })

      setValues({
        itemName: "",
        category: "Classic Pizzas",
        description: "",
        price: "",
        location: "",
        image: null,
      })
      setErrors({})
      router.push("/dashboard/vendor/menu-items")
    } catch (error) {
      toast({
        variant: "error",
        title: "Failed to create menu item",
        description:
          error instanceof Error
            ? error.message
            : "Unable to create the menu item. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function updateField<K extends keyof MenuItemValues>(
    field: K,
    value: MenuItemValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  return (
    <section
      aria-labelledby="vendor-menu-item-heading"
      className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Vendor dashboard
          </p>
          <h1 id="vendor-menu-item-heading" className="mt-3 font-heading text-3xl font-bold tracking-tight">
            Add menu item
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a new menu item for your kitchen. It will be submitted for
            approval before appearing to customers.
          </p>
        </div>

        <Link
          href="/dashboard/vendor/menu-items"
          className={cn(buttonVariants({ variant: "outline" }), "self-start")}
        >
          <ArrowRight className="size-4" aria-hidden="true" />
          My Menu Items
        </Link>
      </div>

      <motion.div
        className="mt-8 premium-card rounded-3xl p-6 shadow-elevated sm:p-8 lg:p-10"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            <label htmlFor="menu-item-name" className="mb-2 block text-sm font-medium">
              Item name
            </label>
            <input
              id="menu-item-name"
              name="itemName"
              type="text"
              autoComplete="off"
              value={values.itemName}
              onChange={(event) => updateField("itemName", event.target.value)}
              aria-invalid={Boolean(errors.itemName)}
              aria-describedby={errors.itemName ? "menu-item-name-error" : undefined}
              className="premium-input h-11"
              placeholder="e.g. Margherita Classic"
            />
            {errors.itemName ? (
              <p id="menu-item-name-error" className="mt-2 text-sm text-destructive">
                {errors.itemName}
              </p>
            ) : null}
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22 }}
          >
            <label htmlFor="menu-item-category" className="mb-2 block text-sm font-medium">
              Category
            </label>
            <select
              id="menu-item-category"
              name="category"
              value={values.category}
              onChange={(event) =>
                updateField("category", event.target.value as PizzaCategory)
              }
              aria-invalid={Boolean(errors.category)}
              aria-describedby={errors.category ? "menu-item-category-error" : undefined}
              className="premium-input h-11"
            >
              {PIZZA_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category ? (
              <p id="menu-item-category-error" className="mt-2 text-sm text-destructive">
                {errors.category}
              </p>
            ) : null}
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.29 }}
          >
            <label htmlFor="menu-item-description" className="mb-2 block text-sm font-medium">
              Description
            </label>
            <textarea
              id="menu-item-description"
              name="description"
              rows={4}
              value={values.description}
              onChange={(event) => updateField("description", event.target.value)}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "menu-item-description-error" : undefined}
              className="premium-input h-32 resize-y py-3"
              placeholder="Describe your menu item..."
            />
            {errors.description ? (
              <p id="menu-item-description-error" className="mt-2 text-sm text-destructive">
                {errors.description}
              </p>
            ) : null}
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.36 }}
            >
              <label htmlFor="menu-item-price" className="mb-2 block text-sm font-medium">
                Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  $
                </span>
                <input
                  id="menu-item-price"
                  name="price"
                  type="text"
                  inputMode="decimal"
                  value={values.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  aria-invalid={Boolean(errors.price)}
                  aria-describedby={errors.price ? "menu-item-price-error" : undefined}
                  className="premium-input h-11 pl-10"
                  placeholder="0.00"
                />
                {errors.price ? (
                  <p id="menu-item-price-error" className="mt-2 text-sm text-destructive">
                    {errors.price}
                  </p>
                ) : null}
              </div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.43 }}
            >
              <label htmlFor="menu-item-location" className="mb-2 block text-sm font-medium">
                Location
              </label>
              <input
                id="menu-item-location"
                name="location"
                type="text"
                autoComplete="off"
                value={values.location}
                onChange={(event) => updateField("location", event.target.value)}
                aria-invalid={Boolean(errors.location)}
                aria-describedby={errors.location ? "menu-item-location-error" : undefined}
                className="premium-input h-11"
                placeholder="e.g. New York, NY"
              />
              {errors.location ? (
                <p id="menu-item-location-error" className="mt-2 text-sm text-destructive">
                  {errors.location}
                </p>
              ) : null}
            </motion.div>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.5 }}
          >
            <label className="mb-2 block text-sm font-medium">
              Item image
              <span className="ml-1 text-muted-foreground">(required)</span>
            </label>
            <ProfileImageUpload
              value={values.image ?? null}
              disabled={isSubmitting || isImageUploading}
              onUploadingChange={setIsImageUploading}
              onChange={(url) => updateField("image", url ?? "")}
              endpoint="/api/menu/images"
              withAuth
            />
            {errors.image ? (
              <p role="alert" className="mt-2 text-sm text-destructive">
                {errors.image}
              </p>
            ) : null}
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.5 }}
          >
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting || isImageUploading || !values.image}
                className={cn(
                  "h-11 w-full rounded-xl border border-border/70 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-glow transition-all duration-300 hover:from-primary/90 hover:to-primary/70 hover:shadow-elevated",
                  (isSubmitting || isImageUploading || !values.image) &&
                    "cursor-not-allowed opacity-70 border-transparent"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Submitting
                  </>
                ) : (
                  <>
                    <Pizza className="size-4" aria-hidden="true" />
                    Create menu item
                  </>
                )}
              </button>
              {!values.image && !isSubmitting && !isImageUploading && (
                <p className="text-xs text-muted-foreground text-center">
                  Upload an item image to enable this button.
                </p>
              )}
              {isSubmitting && (
                <p className="text-xs text-muted-foreground text-center">
                  Submitting your menu item for approval...
                </p>
              )}
            </div>
          </motion.div>
        </form>
      </motion.div>
    </section>
  )
}
