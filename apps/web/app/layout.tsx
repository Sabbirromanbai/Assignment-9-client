import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { PremiumProvider } from "@/components/premium-provider"
import { SiteChrome } from "@/components/site-chrome"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/components/toast-provider"
import { cn } from "@workspace/ui/lib/utils"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Pizzabari",
    template: "%s | Pizzabari",
  },
  description: "Handcrafted pizza, warm from the oven.",
  applicationName: "Pizzabari",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn(geistSans.variable, geistMono.variable)}
    >
      <body className="flex min-h-svh flex-col">
        <ThemeProvider>
          <ToastProvider>
            <PremiumProvider>
              <SiteChrome>{children}</SiteChrome>
            </PremiumProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
