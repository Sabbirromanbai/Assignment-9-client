import type { Metadata } from "next"

import { ProfileManagement } from "@/components/dashboard/profile-management"

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Manage your Pizzabari profile.",
}

export default function ProfilePage() {
  return <ProfileManagement />
}