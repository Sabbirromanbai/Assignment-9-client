"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith("/dashboard")

  if (isDashboard) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
