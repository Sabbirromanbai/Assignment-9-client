import type { Metadata } from "next"

import { AdminUsers } from "@/components/dashboard/admin-users"

export const metadata: Metadata = {
  title: "Manage Users",
  description: "Admin user management for Pizzabari.",
}

export default function AdminUsersPage() {
  return <AdminUsers />
}