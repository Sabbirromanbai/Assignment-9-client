import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-black"
    >
      <Image
        src="/images/hero-pizza.jpg"
        alt="Wood-fired pizza with bubbling cheese, basil and a charred crust on a dark surface"
        fill
        priority
        quality={85}
        sizes="100vw"
        className="object-cover object-center motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-1000"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent"
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl animate-in fade-in-0 slide-in-from-bottom-6 duration-700 ease-smooth motion-reduce:animate-none">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-[0.18em] text-white/90 uppercase backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            Wood fired · Fresh daily
          </span>

          <h1
            id="hero-heading"
            className="mt-6 font-heading text-5xl leading-[1.02] font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Taste the fire,
            <br />
            <span className="text-primary">delivered warm.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            Slow-fermented dough, hand-stretched crusts and generous toppings —
            fired to order and brought to your door while the cheese is still
            bubbling.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/menu"
              className={cn(buttonVariants(), "shadow-glow")}
            >
              Browse Menu
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-white/35 bg-white/5 text-white hover:bg-white/15 hover:text-white"
              )}
            >
              Become a Vendor
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
