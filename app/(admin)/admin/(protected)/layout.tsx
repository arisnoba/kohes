import { currentAdmin } from "@/lib/auth/server"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { AdminShell } from "@/components/admin/AdminShell"

interface ProtectedAdminLayoutProps {
  children: ReactNode
}

export default function ProtectedAdminLayout({ children }: ProtectedAdminLayoutProps) {
  if (!currentAdmin()) redirect("/admin/login")
  return <AdminShell>{children}</AdminShell>
}
