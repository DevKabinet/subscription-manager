"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Save, DollarSign } from "lucide-react"
import { DashboardNav } from "@/components/dashboard-nav"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ExchangeRateModal } from "@/components/exchange-rate-modal"
import { useCompanySettingsStore } from "@/lib/company-settings"
import { useExchangeRateStore } from "@/lib/exchange-rates"
import { useAuthStore } from "@/lib/auth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isExchangeRateModalOpen, setIsExchangeRateModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { settings, updateSettings, isSetupComplete } = useCompanySettingsStore()
  const { fetchRates, lastFetched } = useExchangeRateStore()
  const { user, isAuthenticated, logout } = useAuthStore()

  const [formSettings, setFormSettings] = useState(settings)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login")
      return
    }

    // Initialize global exchange rates on app load
    const shouldFetch = !lastFetched || new Date().getTime() - new Date(lastFetched).getTime() > 24 * 60 * 60 * 1000 // 24 hours

    if (shouldFetch) {
      fetchRates()
    }
  }, [router, fetchRates, lastFetched, isAuthenticated, user])

  useEffect(() => {
    setFormSettings(settings)
  }, [settings])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate saving settings
    setTimeout(() => {
      updateSettings(formSettings)
      setIsSaving(false)
      setIsSettingsModalOpen(false)
      alert("Company settings saved successfully!")
    }, 1000)
  }

  const handleInputChange = (field: keyof typeof formSettings, value: string) => {
    setFormSettings((prev) => ({ ...prev, [field]: value }))
  }

  if (!isAuthenticated || !user) {
    return null // Will redirect to login
  }

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case "admin":
        return "bg-red-500"
      case "manager":
        return "bg-blue-500"
      case "user":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Subscription Manager</h1>
              {!isSetupComplete && (
                <Badge variant="destructive" className="text-xs">
                  Setup Required
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Role Badge */}
              <Badge className={`text-white text-xs ${getRoleBadgeColor(user.roleName)}`}>
                {user.roleName.toUpperCase()}
              </Badge>

              {/* Exchange Rate Button */}
              <Button
                variant="ghost"
                size="sm"
                className="hover-lift flex items-center gap-2"
                onClick={() => setIsExchangeRateModalOpen(true)}
              >
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="hidden sm:inline">Global Rates</span>
              </Button>

              {/* User Info and Settings */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-gray-400">({user.email})</span>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isSetupComplete && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600 font-medium">⚠️ Setup Required</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Please complete your company settings to generate professional invoices.
            </p>
          </div>
        )}
        {children}
      </main>

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
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formSettings.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formSettings.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={3}
                placeholder="Enter your company address"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formSettings.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formSettings.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contact@yourcompany.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxNumber">Tax Number / ID</Label>
                <Input
                  id="taxNumber"
                  value={formSettings.taxNumber}
                  onChange={(e) => handleInputChange("taxNumber", e.target.value)}
                  placeholder="TAX123456789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formSettings.website || ""}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
              <Input
                id="logoUrl"
                type="url"
                value={formSettings.logoUrl}
                onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankDetails">Bank Details (Optional)</Label>
              <Textarea
                id="bankDetails"
                value={formSettings.bankDetails || ""}
                onChange={(e) => handleInputChange("bankDetails", e.target.value)}
                rows={3}
                placeholder="Bank name, account number, routing number, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Textarea
                id="paymentTerms"
                value={formSettings.paymentTerms || ""}
                onChange={(e) => handleInputChange("paymentTerms", e.target.value)}
                rows={2}
                placeholder="Payment is due within 30 days of invoice date."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footerText">Invoice Footer Text</Label>
              <Input
                id="footerText"
                value={formSettings.footerText || ""}
                onChange={(e) => handleInputChange("footerText", e.target.value)}
                placeholder="Thank you for your business!"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Company Settings"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Exchange Rate Modal */}
      <ExchangeRateModal isOpen={isExchangeRateModalOpen} onClose={() => setIsExchangeRateModalOpen(false)} />
    </div>
  )
}
