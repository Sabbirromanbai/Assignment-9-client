import Link from "next/link"
import { Clock, Mail, MapPin, Phone } from "lucide-react"

import { Logo } from "@/components/logo"

const exploreLinks = [
  { name: "Home", href: "/" },
  { name: "Browse Menu", href: "/menu" },
] as const

const accountLinks = [
  { name: "Sign In", href: "/sign-in" },
  { name: "Sign Up", href: "/sign-up" },
] as const

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/",
    hoverShadow:
      "motion-safe:hover:shadow-[0_6px_16px_-4px_rgba(24,119,242,0.55)]",
  },
  {
    name: "X",
    href: "https://x.com/",
    hoverShadow:
      "motion-safe:hover:shadow-[0_6px_16px_-4px_color-mix(in_oklab,var(--foreground)_35%,transparent)]",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/",
    hoverShadow:
      "motion-safe:hover:shadow-[0_6px_16px_-4px_rgba(255,1,105,0.55)]",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/",
    hoverShadow:
      "motion-safe:hover:shadow-[0_6px_16px_-4px_rgba(255,0,0,0.5)]",
  },
] as const

const GLYPH_CLASS =
  "size-[18px] transition-transform duration-300 ease-smooth motion-safe:group-hover:scale-110"

type SocialPlatform = (typeof socialLinks)[number]["name"]

function SocialGlyph({ platform }: { platform: SocialPlatform }) {
  switch (platform) {
    case "Facebook":
      return (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          className={GLYPH_CLASS}
        >
          <path
            fill="#1877F2"
            d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
          />
        </svg>
      )
    case "X":
      return (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          className={`${GLYPH_CLASS} text-black dark:text-white`}
        >
          <path
            fill="currentColor"
            d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
          />
        </svg>
      )
    case "Instagram":
      return (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          className={GLYPH_CLASS}
        >
          <defs>
            <linearGradient
              id="instagram-brand-gradient"
              x1="0%"
              y1="100%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#FFD600" />
              <stop offset="25%" stopColor="#FF7A00" />
              <stop offset="50%" stopColor="#FF0169" />
              <stop offset="75%" stopColor="#D300C5" />
              <stop offset="100%" stopColor="#7638FA" />
            </linearGradient>
          </defs>
          <path
            fill="url(#instagram-brand-gradient)"
            d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
          />
        </svg>
      )
    case "YouTube":
      return (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          className={GLYPH_CLASS}
        >
          <path
            fill="#FF0000"
            d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
          />
        </svg>
      )
  }
}

function FooterNav({
  title,
  links,
}: {
  title: string
  links: ReadonlyArray<{ name: string; href: string }>
}) {
  return (
    <nav aria-label={title}>
      <h2 className="font-heading text-sm font-semibold tracking-tight">
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors duration-200 ease-smooth hover:text-primary"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden border-t border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--brand-orange)_6%,transparent),transparent_45%)]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-orange/50 to-transparent"
      />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr] lg:gap-12">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Slow-fermented dough, wood-fired crusts and generous toppings —
              made fresh for every order.
            </p>
            <div className="mt-4 flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={social.name}
                  className={`group inline-flex size-9 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-all duration-300 ease-smooth hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-95 ${social.hoverShadow}`}
                >
                  <SocialGlyph platform={social.name} />
                </a>
              ))}
            </div>
          </div>

          <FooterNav title="Explore" links={exploreLinks} />
          <FooterNav title="Account" links={accountLinks} />

          <div>
            <h2 className="font-heading text-sm font-semibold tracking-tight">
              Contact
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=GEC+Circle+Chittagong"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="transition-colors duration-200 ease-smooth hover:text-foreground"
                >
                  GEC Circle
                  <br />
                  Chittagong, Bangladesh
                </a>
              </li>
              <li className="flex gap-3">
                <Phone
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <a
                  href="tel:+8801608941748"
                  className="transition-colors duration-200 ease-smooth hover:text-foreground"
                >
                  +880 1608-941748
                </a>
              </li>
              <li className="flex gap-3">
                <Mail
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <a
                  href="mailto:sabbirroman650@gmail.com"
                  className="transition-colors duration-200 ease-smooth hover:text-foreground"
                >
                  sabbirroman650@gmail.com
                </a>
              </li>
              <li className="flex gap-3">
                <Clock
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>Daily · 11:00 – 23:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Pizzabari. All rights reserved.</p>
          <p>Fired fresh, served warm.</p>
        </div>
      </div>
    </footer>
  )
}
