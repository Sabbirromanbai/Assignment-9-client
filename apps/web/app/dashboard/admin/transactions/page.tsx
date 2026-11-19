import type { Metadata } from "next"

import { AdminTransactions } from "@/components/dashboard/admin-transactions"

export const metadata: Metadata = {
  title: "Transactions",
  description: "Read-only transaction records for PizzaHub.",
}

export default function AdminTransactionsPage() {
  return <AdminTransactions />
}