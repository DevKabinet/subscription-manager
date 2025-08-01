"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  UserCheck,
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useAuthStore } from "@/lib/auth"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  requiredRole?: string[]
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clients",
    href: "/dashboard/clients",
    icon: Building2,
  },
  {
    title: "Subscriptions",
    href: "/dashboard/subscriptions",
    icon: Calendar,
  },
  {
    title: "Client Subscriptions",
    href: "/dashboard/client-subscriptions",
    icon: UserCheck,
  },
  {
    title: "Invoices",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    title: "Payments",
    href: "/dashboard/payments",
    icon: DollarSign,
  },
  {
    title: "User Management",
    href: "/dashboard/users",
    icon: Users,
    requiredRole: ["admin"],
    badge: "Admin Only",
  },
]

export function DashboardNav() {
  const pathname = usePathname()
  const { user, hasPermission } = useAuthStore()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const canAccessItem = (item: NavItem) => {
    if (!item.requiredRole) return true
    if (!user) return false

    return item.requiredRole.includes(user.roleName)
  }

  const renderNavItem = (item: NavItem, level = 0) => {
    if (!canAccessItem(item)) return null

    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.title)
    const active = isActive(item.href)

    return (
      <div key={item.title}>
        <div className="relative">
          {hasChildren ? (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 h-9 px-3",
                level > 0 && "ml-4 w-[calc(100%-1rem)]",
                active && "bg-accent text-accent-foreground",
              )}
              onClick={() => toggleExpanded(item.title)}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          ) : (
            <Link href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 h-9 px-3",
                  level > 0 && "ml-4 w-[calc(100%-1rem)]",
                  active && "bg-accent text-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">{item.children?.map((child) => renderNavItem(child, level + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto py-2">{navItems.map((item) => renderNavItem(item))}</div>
      </div>
    </nav>
  )
}
