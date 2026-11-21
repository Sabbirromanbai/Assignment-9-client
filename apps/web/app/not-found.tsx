import type { Metadata } from "next"
import Link from "next/link"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The Pizzabari page you are looking for does not exist.",
}

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60svh] w-full max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <p className="font-heading text-7xl font-bold tracking-tight text-primary/20 sm:text-8xl">
        404
      </p>
      <h1 className="mt-4 font-heading text-headline text-balance">
        This slice is missing
      </h1>
      <p className="mt-4 max-w-md text-sm text-muted-foreground">
        The Pizzabari page you are looking for does not exist or may have moved.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={cn(buttonVariants(), "shadow-soft")}>
          Back to home
        </Link>
        <Link
          href="/menu"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Browse menu
        </Link>
      </div>
    </section>
  )
}
