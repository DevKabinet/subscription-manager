"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Home, Users, DollarSign, Receipt, CreditCard, Settings } from "lucide-react"

interface NavProps {
  isCollapsed: boolean
  userRole: string
}

export function Nav({ isCollapsed, userRole }: NavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      roles: ["admin", "user"],
    },
    {
      title: "Clients",
      href: "/dashboard/clients",
      icon: Users,
      roles: ["admin", "user"],
    },
    {
      title: "Subscriptions",
      href: "/dashboard/subscriptions",
      icon: Receipt,
      roles: ["admin", "user"],
    },
    {
      title: "Payments",
      href: "/dashboard/payments",
      icon: CreditCard,
      roles: ["admin", "user"],
    },
    {
      title: "Invoices",
      href: "/dashboard/invoices",
      icon: DollarSign,
      roles: ["admin", "user"],
    },
    {
      title: "Users",
      href: "/dashboard/users",
      icon: Users,
      roles: ["admin"], // Only accessible to admin
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      roles: ["admin"], // Only accessible to admin
    },
  ]

  return (
    <div data-collapsed={isCollapsed} className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2">
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {navItems.map((item, index) => {
          // Check if the user's role is allowed to see this item
          if (!item.roles.includes(userRole)) {
            return null // Don't render the item if the role is not allowed
          }

          return (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                pathname === item.href && "bg-accent text-accent-foreground",
                isCollapsed && "justify-center",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className={cn(isCollapsed && "hidden")}>{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
