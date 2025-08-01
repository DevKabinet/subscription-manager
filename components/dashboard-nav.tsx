"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Users, DollarSign, Receipt, CreditCard, Settings } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DashboardNavProps {
  isCollapsed: boolean
  userRole: string
}

export function DashboardNav({ isCollapsed, userRole }: DashboardNavProps) {
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
    <TooltipProvider>
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {navItems.map((item, index) => {
          if (!item.roles.includes(userRole)) {
            return null
          }

          return isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground",
                    pathname === item.href && "bg-accent text-accent-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {item.title}
                {item.label && <span className="ml-auto text-muted-foreground">{item.label}</span>}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === item.href && "bg-accent text-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
              {item.label && (
                <span className={cn("ml-auto", pathname === item.href && "text-background dark:text-white")}>
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </TooltipProvider>
  )
}
