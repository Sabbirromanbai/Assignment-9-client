import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your PizzaHub account.",
}

export default function SignInPage() {
  return (
    <PagePlaceholder
      eyebrow="Account"
      title="Sign in is almost ready"
      description="PizzaHub accounts are not connected yet. Sign-in will open together with the full ordering experience."
    />
  )
}
