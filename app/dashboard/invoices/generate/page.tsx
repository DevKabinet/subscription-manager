"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import jsPDF from "jspdf"

interface Client {
  id: number
  name: string
  email: string
  address: string
}

interface Subscription {
  id: number
  name: string
  price: number
}

interface CompanySettings {
  companyName: string
  address: string
  phone: string
  email: string
  taxNumber: string
}

export default function GenerateInvoicePage() {
  const [clients, setClients] = useState<Client[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
  const [formData, setFormData] = useState({
    clientId: "",
    subscriptionId: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Load clients
    setClients([
      { id: 1, name: "John Doe", email: "john@example.com", address: "456 Client Ave, City, State 12345" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", address: "789 Customer Blvd, City, State 12345" },
      { id: 3, name: "Alice Johnson", email: "alice@example.com", address: "321 Business St, City, State 12345" },
      { id: 4, name: "Bob Wilson", email: "bob@example.com", address: "654 Commerce Ave, City, State 12345" },
    ])

    // Load subscriptions
    setSubscriptions([
      { id: 1, name: "Basic Plan", price: 29.99 },
      { id: 2, name: "Premium Plan", price: 59.99 },
      { id: 3, name: "Enterprise Plan", price: 99.99 },
    ])

    // Load company settings
    setCompanySettings({
      companyName: "Your Company Name",
      address: "123 Business St\nCity, State 12345",
      phone: "+1 (555) 123-4567",
      email: "contact@yourcompany.com",
      taxNumber: "TAX123456789",
    })

    // Set default due date (30 days from issue date)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)
    setFormData((prev) => ({ ...prev, dueDate: dueDate.toISOString().split("T")[0] }))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    const selectedClient = clients.find((c) => c.id === Number.parseInt(formData.clientId))
    const selectedSubscription = subscriptions.find((s) => s.id === Number.parseInt(formData.subscriptionId))

    if (!selectedClient || !selectedSubscription || !companySettings) {
      alert("Please select both client and subscription")
      setIsGenerating(false)
      return
    }

    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

    // Generate PDF
    const doc = new jsPDF()

    // Company header
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text(companySettings.companyName, 20, 30)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const companyAddressLines = companySettings.address.split("\n")
    companyAddressLines.forEach((line, index) => {
      doc.text(line, 20, 40 + index * 5)
    })
    doc.text(companySettings.phone, 20, 40 + companyAddressLines.length * 5)
    doc.text(companySettings.email, 20, 45 + companyAddressLines.length * 5)
    if (companySettings.taxNumber) {
      doc.text(`Tax ID: ${companySettings.taxNumber}`, 20, 50 + companyAddressLines.length * 5)
    }

    // Invoice title and number
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("INVOICE", 150, 30)

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`#${invoiceNumber}`, 150, 40)

    // Client information
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Bill To:", 20, 80)

    doc.setFont("helvetica", "normal")
    doc.text(selectedClient.name, 20, 90)
    doc.text(selectedClient.email, 20, 95)
    const clientAddressLines = selectedClient.address.split("\n")
    clientAddressLines.forEach((line, index) => {
      doc.text(line, 20, 100 + index * 5)
    })

    // Invoice details
    doc.setFont("helvetica", "bold")
    doc.text("Invoice Details:", 120, 80)

    doc.setFont("helvetica", "normal")
    doc.text(`Issue Date: ${new Date(formData.issueDate).toLocaleDateString()}`, 120, 90)
    doc.text(`Due Date: ${new Date(formData.dueDate).toLocaleDateString()}`, 120, 95)

    // Table header
    doc.setFont("helvetica", "bold")
    doc.text("Description", 20, 130)
    doc.text("Amount", 150, 130)

    // Draw line under header
    doc.line(20, 135, 190, 135)

    // Table content
    doc.setFont("helvetica", "normal")
    doc.text(selectedSubscription.name, 20, 145)
    doc.text(`$${selectedSubscription.price.toFixed(2)}`, 150, 145)

    // Total
    doc.line(20, 155, 190, 155)
    doc.setFont("helvetica", "bold")
    doc.text("Total:", 130, 165)
    doc.text(`$${selectedSubscription.price.toFixed(2)}`, 150, 165)

    // Notes if provided
    if (formData.notes) {
      doc.setFont("helvetica", "bold")
      doc.text("Notes:", 20, 180)
      doc.setFont("helvetica", "normal")
      const notesText = doc.splitTextToSize(formData.notes, 170)
      doc.text(notesText, 20, 190)
    }

    // Payment instructions
    doc.setFont("helvetica", "bold")
    doc.text("Payment Instructions:", 20, formData.notes ? 210 : 190)

    doc.setFont("helvetica", "normal")
    const paymentText = `Please make payment by the due date. Payment can be made via cash, check, or bank transfer. For any questions regarding this invoice, please contact us at ${companySettings.email}.`
    const splitText = doc.splitTextToSize(paymentText, 170)
    doc.text(splitText, 20, formData.notes ? 220 : 200)

    // Footer
    doc.setFont("helvetica", "italic")
    doc.text("Thank you for your business!", 105, 270, { align: "center" })

    // Save the PDF
    doc.save(`${invoiceNumber}.pdf`)

    setIsGenerating(false)

    // Show success message and redirect
    alert(`Invoice ${invoiceNumber} generated successfully!`)
    router.push("/dashboard/invoices")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/invoices">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Invoices
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Generate Invoice</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Create New Invoice
            </CardTitle>
            <CardDescription>Generate a professional invoice for your client</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Select Client</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subscription">Select Subscription</Label>
                  <Select
                    value={formData.subscriptionId}
                    onValueChange={(value) => setFormData({ ...formData, subscriptionId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a subscription" />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptions.map((subscription) => (
                        <SelectItem key={subscription.id} value={subscription.id.toString()}>
                          {subscription.name} - ${subscription.price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional notes or terms..."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isGenerating}>
                <FileText className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating Invoice..." : "Generate & Download Invoice"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
