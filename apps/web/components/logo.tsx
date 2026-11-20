import Link from "next/link"
import Image from "next/image"

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
      <span className="flex shrink-0 group-hover:-rotate-6 transition-transform duration-300 ease-smooth">
        <Image
          src="/images/pizza-logo.png"
          alt="Pizzabari"
          width={1774}
          height={887}
          sizes="(min-width: 640px) 120px, 100vw"
          className="h-10 w-auto object-contain"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-heading text-lg font-semibold tracking-tight">
          Pizzabari
        </span>
        <span className="mt-1 text-[0.625rem] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Pizza mood, Deshi attitude!
        </span>
      </span>
    </Link>
  )
}