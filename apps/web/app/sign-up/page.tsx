import type { Metadata } from "next"

import { PagePlaceholder } from "@/components/page-placeholder"

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your PizzaHub account.",
}

export default function SignUpPage() {
  return (
    <PagePlaceholder
      eyebrow="Account"
      title="Create your PizzaHub account soon"
      description="Account creation is not available yet. It will arrive together with the full ordering experience."
    />
  )
}
