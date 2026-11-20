import type { Metadata } from "next"

import { SettingsPage as SettingsPageComponent } from "@/components/dashboard/settings"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your Pizzabari account settings.",
}

export default function SettingsPage() {
  return <SettingsPageComponent />
}