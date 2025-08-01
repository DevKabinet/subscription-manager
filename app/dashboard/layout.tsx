"use client"

import type React from "react"
import { useState } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Save, DollarSign } from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label, Input, Textarea } from "@/components/ui/form"
import { ExchangeRateModal } from "@/components/exchange-rate-modal"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isExchangeRateModalOpen, setIsExchangeRateModalOpen] = useState(false)
  const [settings, setSettings] = useState({
    companyName: "Your Company Name",
    address: "123 Business St\nCity, State 12345",
    phone: "+1 (555) 123-4567",
    email: "contact@yourcompany.com",
    taxNumber: "TAX123456789",
    logoUrl: "",
  })
  const [isSaving, setIsSaving] = useState(false)

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
  const isTester = localStorage.getItem("isTester") === "true"

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate saving settings
    setTimeout(() => {
      setIsSaving(false)
      setIsSettingsModalOpen(false)
      alert("Company settings saved successfully!")
    }, 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Subscription Manager</h1>
            <div className="flex items-center gap-4">
              {/* Only show badge for tester mode */}
              {isTester && <Badge variant="secondary">Tester Mode</Badge>}

              {/* Exchange Rate Button */}
              <Button
                variant="ghost"
                size="sm"
                className="hover-lift flex items-center gap-2"
                onClick={() => setIsExchangeRateModalOpen(true)}
              >
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="hidden sm:inline">Exchange Rates</span>
              </Button>

              {/* User Info and Settings */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{userEmail}</span>
                </div>
                <Button variant="ghost" size="sm" className="hover-lift" onClick={() => setIsSettingsModalOpen(true)}>
                  <Settings className="h-4 w-4" />
                </Button>
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

      {/* Company Settings Modal */}
      <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Company Settings</DialogTitle>
            <DialogDescription>
              Update your company details that will appear on invoices and other documents
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSettingsSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={settings.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={3}
                placeholder="Enter your company address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contact@yourcompany.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxNumber">Tax Number / ID</Label>
              <Input
                id="taxNumber"
                value={settings.taxNumber}
                onChange={(e) => handleInputChange("taxNumber", e.target.value)}
                placeholder="TAX123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
              <Input
                id="logoUrl"
                type="url"
                value={settings.logoUrl}
                onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Exchange Rate Modal */}
      <ExchangeRateModal isOpen={isExchangeRateModalOpen} onClose={() => setIsExchangeRateModalOpen(false)} />
    </div>
  )
}
