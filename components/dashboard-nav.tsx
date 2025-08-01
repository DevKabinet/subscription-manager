"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, CreditCard, FileText, BarChart3, Receipt, LinkIcon } from "lucide-react"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: BarChart3 },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
  { name: "Subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
  { name: "Client Subscriptions", href: "/dashboard/client-subscriptions", icon: LinkIcon },
  { name: "Payments", href: "/dashboard/payments", icon: FileText },
  { name: "Invoices", href: "/dashboard/invoices", icon: Receipt },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
