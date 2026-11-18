import Link from "next/link"
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react"

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
  { name: "Instagram", href: "https://www.instagram.com/" },
  { name: "Facebook", href: "https://www.facebook.com/" },
] as const

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
    <footer className="border-t border-border/70 bg-secondary/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
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
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors duration-200 ease-smooth hover:text-primary"
                >
                  {social.name}
                  <ArrowUpRight className="size-3" aria-hidden="true" />
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
                  href="https://www.google.com/maps/search/?api=1&query=123+Ember+Street+New+York+NY+10001"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="transition-colors duration-200 ease-smooth hover:text-foreground"
                >
                  123 Ember Street
                  <br />
                  New York, NY 10001
                </a>
              </li>
              <li className="flex gap-3">
                <Phone
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <a
                  href="tel:+15550102030"
                  className="transition-colors duration-200 ease-smooth hover:text-foreground"
                >
                  +1 (555) 010-2030
                </a>
              </li>
              <li className="flex gap-3">
                <Mail
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <a
                  href="mailto:hello@pizzahub.example"
                  className="transition-colors duration-200 ease-smooth hover:text-foreground"
                >
                  hello@pizzahub.example
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
          <p>© {year} PizzaHub. All rights reserved.</p>
          <p>Fired fresh, served warm.</p>
        </div>
      </div>
    </footer>
  )
}
