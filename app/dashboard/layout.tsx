"use client"

import type React from "react"

import type { ReactNode } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth"
import { DashboardNav } from "@/components/dashboard-nav"
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"
import { UserNav } from "@/components/user-nav"
import { Save } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ExchangeRateModal } from "@/components/exchange-rate-modal"
import { useCompanySettingsStore } from "@/lib/company-settings"
import { useExchangeRateStore } from "@/lib/exchange-rates"
import { useAuthStore } from "@/lib/auth"
import Link from "next/link"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getAuthenticatedUser()
  const router = useRouter()
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isExchangeRateModalOpen, setIsExchangeRateModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { settings, updateSettings, isSetupComplete } = useCompanySettingsStore()
  const { fetchRates, lastFetched } = useExchangeRateStore()
  const { logout } = useAuthStore()

  const [formSettings, setFormSettings] = useState(settings)

  const cookieStore = cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

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

  if (!user) {
    redirect("/login")
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
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar className="hidden md:flex">
          <SidebarContent>
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <span className="">Subscription Manager</span>
              </Link>
            </div>
            <div className="flex-1">
              <DashboardNav isCollapsed={false} userRole={user.role} />
            </div>
            <div className="mt-auto p-4">
              <UserNav user={user} />
            </div>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 lg:h-[60px]">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden bg-transparent">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="sm:max-w-xs">
                <nav className="grid gap-6 text-lg font-medium">
                  <Link href="#" className="flex items-center gap-2 text-lg font-semibold">
                    <span>Subscription Manager</span>
                  </Link>
                  <DashboardNav isCollapsed={false} userRole={user.role} />
                </nav>
              </SheetContent>
            </Sheet>
            <div className="relative ml-auto flex-1 md:grow-0">{/* Search or other header content can go here */}</div>
            <div className="hidden md:block">
              <UserNav user={user} />
            </div>
          </header>
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
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
        </div>
      </div>

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
    </SidebarProvider>
  )
}
