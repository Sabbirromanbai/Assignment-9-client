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
        "group inline-flex items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      <span className="relative flex shrink-0 [perspective:600px] [transform-style:preserve-3d]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-1 rounded-2xl bg-brand-orange/30 opacity-0 blur-lg transition-opacity duration-500 ease-premium group-hover:opacity-100"
        />
        <Image
          src="/images/pizza-logo.png"
          alt="Pizzabari"
          width={1774}
          height={887}
          sizes="(min-width: 640px) 120px, 100vw"
          className="pizzabari-logo-mark relative h-10 w-auto object-contain drop-shadow-[0_6px_12px_rgba(239,68,56,0.22)] transition-[transform,filter] duration-500 ease-premium animate-[pizzabari-logo-float_6s_ease-in-out_infinite] group-hover:scale-105 group-hover:drop-shadow-[0_8px_18px_rgba(239,68,56,0.38)] motion-reduce:animate-none"
        />
      </span>

      <span className="flex flex-col leading-none">
        <span className="bg-gradient-to-r from-brand-tomato via-brand-orange to-brand-cheese bg-clip-text font-heading text-lg font-bold tracking-tight text-transparent drop-shadow-[0_1px_0_rgba(255,255,255,0.18)]">
          Pizzabari
        </span>
        <span className="mt-1 text-[0.625rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase transition-colors duration-300 group-hover:text-brand-orange">
          Pizza mood, Deshi attitude!
        </span>
      </span>
    </Link>
  )
}
