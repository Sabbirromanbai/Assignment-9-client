import type { Metadata } from "next"

import { SignInForm } from "@/components/auth/sign-in-form"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Pizzabari account.",
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackURL?: string }>
}) {
  const params = await searchParams
  const requested = params.callbackURL

  const callbackURL =
    requested?.startsWith("/") && !requested.startsWith("//")
      ? requested
      : "/"

  return <SignInForm callbackURL={callbackURL} />
}
