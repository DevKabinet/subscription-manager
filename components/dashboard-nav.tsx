"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, CreditCard, FileText, UserCheck, Shield } from "lucide-react"
import { useAuthStore } from "@/lib/auth"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
  { name: "Subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
  { name: "Client Subscriptions", href: "/dashboard/client-subscriptions", icon: UserCheck },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
]

const adminNavigation = [{ name: "User Management", href: "/dashboard/users", icon: Shield, adminOnly: true }]

export function DashboardNav() {
  const pathname = usePathname()
  const { isAdmin } = useAuthStore()

  const allNavigation = [...navigation, ...(isAdmin() ? adminNavigation : [])]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {allNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors hover-lift",
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
                {item.adminOnly && <Shield className="h-3 w-3 text-red-500" />}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
