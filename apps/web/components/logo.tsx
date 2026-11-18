import Link from "next/link"
import { Pizza } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"

type LogoProps = {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft transition-transform duration-300 ease-smooth group-hover:-rotate-6">
        <Pizza className="size-5" strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-heading text-lg font-semibold tracking-tight">
          PizzaHub
        </span>
        <span className="mt-1 text-[0.625rem] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Wood fired
        </span>
      </span>
    </Link>
  )
}
