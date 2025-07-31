"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, User } from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("isTester")
    router.push("/login")
  }

  const userEmail = localStorage.getItem("userEmail") || "user@example.com"

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Subscription Manager</h1>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{localStorage.getItem("isTester") ? "Tester Mode" : "Live Mode"}</Badge>

              {/* User Info and Settings */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{userEmail}</span>
                </div>
                <Link href="/dashboard/settings">
                  <Button variant="ghost" size="sm" className="hover-lift">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <Button variant="outline" onClick={handleLogout} className="hover-lift bg-transparent">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <DashboardNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
