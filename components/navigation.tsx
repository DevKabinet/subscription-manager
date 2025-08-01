"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth"
import { Home, Users, FileText, DollarSign, CreditCard, Settings, UserCog, LogOut, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function MainNav() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
      roles: ["admin", "manager", "viewer"],
    },
    {
      href: "/dashboard/clients",
      label: "Clients",
      icon: Users,
      roles: ["admin", "manager"],
    },
    {
      href: "/dashboard/subscriptions",
      label: "Subscriptions",
      icon: FileText,
      roles: ["admin", "manager"],
    },
    {
      href: "/dashboard/invoices",
      label: "Invoices",
      icon: DollarSign,
      roles: ["admin", "manager", "viewer"],
    },
    {
      href: "/dashboard/payments",
      label: "Payments",
      icon: CreditCard,
      roles: ["admin", "manager", "viewer"],
    },
    {
      href: "/dashboard/users",
      label: "User Management",
      icon: UserCog,
      roles: ["admin"], // Only accessible to admin
    },
  ]

  const filteredNavItems = navItems.filter((item) => (user?.role ? item.roles.includes(user.role) : false))

  return (
    <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
      {filteredNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground",
            pathname === item.href && "text-foreground",
          )}
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

export function UserNav() {
  const { user, logout } = useAuthStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt="@username" />
            <AvatarFallback>{user?.username ? user.username.substring(0, 2).toUpperCase() : "UN"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.username || "Guest"}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email || "N/A"}</p>
            {user?.role && <p className="text-xs leading-none text-muted-foreground capitalize">Role: {user.role}</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              <span>Log in</span>
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
