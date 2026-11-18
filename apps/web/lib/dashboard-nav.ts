import type { LucideIcon } from "lucide-react"
import {
  CreditCard,
  Crown,
  LayoutDashboard,
  Package,
  Pizza,
  Plus,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react"

export type DashboardRole = "vendor" | "customer" | "admin"

export type DashboardNavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const DASHBOARD_NAV: Record<DashboardRole, DashboardNavItem[]> = {
  vendor: [
    { label: "Overview", href: "/dashboard/vendor", icon: LayoutDashboard },
    {
      label: "My Menu Items",
      href: "/dashboard/vendor/menu-items",
      icon: Pizza,
    },
    {
      label: "Add Menu Item",
      href: "/dashboard/vendor/menu-items/new",
      icon: Plus,
    },
    {
      label: "Customer Orders",
      href: "/dashboard/vendor/orders",
      icon: ShoppingBag,
    },
    {
      label: "Subscription",
      href: "/dashboard/vendor/subscription",
      icon: Crown,
    },
    {
      label: "Profile Settings",
      href: "/dashboard/profile",
      icon: Settings,
    },
  ],
  customer: [
    { label: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
    { label: "My Orders", href: "/dashboard/customer/orders", icon: Package },
    {
      label: "Profile Settings",
      href: "/dashboard/profile",
      icon: Settings,
    },
  ],
  admin: [
    { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Manage Users", href: "/dashboard/admin/users", icon: Users },
    {
      label: "Manage Menu Items",
      href: "/dashboard/admin/menu-items",
      icon: Pizza,
    },
    {
      label: "Transactions",
      href: "/dashboard/admin/transactions",
      icon: CreditCard,
    },
  ],
}

export const ROLE_HOME: Record<DashboardRole, string> = {
  vendor: "/dashboard/vendor",
  customer: "/dashboard/customer",
  admin: "/dashboard/admin",
}

export function normalizeRole(value: unknown): DashboardRole | null {
  return value === "vendor" || value === "customer" || value === "admin"
    ? value
    : null
}
