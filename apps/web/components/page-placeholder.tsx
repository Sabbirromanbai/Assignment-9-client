import Link from "next/link"
import { Flame } from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type PagePlaceholderProps = {
  eyebrow: string
  title: string
  description: string
}

export function PagePlaceholder({
  eyebrow,
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <section className="mx-auto flex min-h-[60svh] w-full max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase shadow-soft">
        <Flame className="size-3 text-primary" aria-hidden="true" />
        {eyebrow}
      </span>
      <h1 className="mt-5 font-heading text-headline text-balance">{title}</h1>
      <p className="mt-4 max-w-xl text-pretty text-muted-foreground">
        {description}
      </p>
      <Link
        href="/"
        className={cn(buttonVariants({ variant: "outline" }), "mt-8")}
      >
        Back to home
      </Link>
    </section>
  )
}
