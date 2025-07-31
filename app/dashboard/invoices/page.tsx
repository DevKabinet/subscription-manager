"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, FileText, Plus } from "lucide-react"
import jsPDF from "jspdf"

interface Invoice {
  id: number
  invoiceNumber: string
  clientName: string
  subscriptionName: string
  amount: number
  issueDate: string
  dueDate: string
  status: "paid" | "pending" | "overdue"
  isSetupInvoice?: boolean
}

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

interface InvoicePreview {
  invoiceNumber: string
  clientName: string
  clientEmail: string
  clientAddress: string
  subscriptionName: string
  amount: number
  issueDate: string
  dueDate: string
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  taxNumber: string
  isSetupInvoice?: boolean
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
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
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoicePreview | null>(null)

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

    // Load existing mock invoices
    const mockInvoices = [
      {
        id: 1,
        invoiceNumber: "INV-2024-001",
        clientName: "John Doe",
        subscriptionName: "Basic Plan",
        amount: 29.99,
        issueDate: "2024-01-01",
        dueDate: "2024-01-15",
        status: "paid" as const,
        isSetupInvoice: false,
      },
      {
        id: 2,
        invoiceNumber: "INV-2024-002",
        clientName: "Jane Smith",
        subscriptionName: "Premium Plan",
        amount: 59.99,
        issueDate: "2024-01-05",
        dueDate: "2024-01-20",
        status: "paid" as const,
        isSetupInvoice: false,
      },
      {
        id: 3,
        invoiceNumber: "INV-2024-003",
        clientName: "Alice Johnson",
        subscriptionName: "Basic Plan",
        amount: 29.99,
        issueDate: "2024-01-10",
        dueDate: "2024-01-25",
        status: "pending" as const,
        isSetupInvoice: false,
      },
      {
        id: 4,
        invoiceNumber: "INV-2024-004",
        clientName: "Bob Wilson",
        subscriptionName: "Premium Plan",
        amount: 59.99,
        issueDate: "2024-01-15",
        dueDate: "2024-01-30",
        status: "overdue" as const,
        isSetupInvoice: false,
      },
    ]

    // Load invoices from localStorage (created from client subscriptions)
    const storedInvoices = JSON.parse(localStorage.getItem("invoices") || "[]")

    // Combine mock invoices with stored invoices
    const allInvoices = [...mockInvoices, ...storedInvoices]
    setInvoices(allInvoices)
  }, [router])

  const handleGenerateInvoice = () => {
    setFormData({
      clientId: "",
      subscriptionId: "",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      notes: "",
    })
    // Set default due date (30 days from issue date)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)
    setFormData((prev) => ({ ...prev, dueDate: dueDate.toISOString().split("T")[0] }))
    setIsGenerateModalOpen(true)
  }

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
    setIsGenerateModalOpen(false)

    // Show success message
    alert(`Invoice ${invoiceNumber} generated successfully!`)
  }

  const downloadInvoice = (invoice: Invoice) => {
    const doc = new jsPDF()

    // Company header
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("Your Company Name", 20, 30)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("123 Business St, City, State 12345", 20, 40)
    doc.text("+1 (555) 123-4567", 20, 45)
    doc.text("contact@yourcompany.com", 20, 50)
    doc.text("Tax ID: TAX123456789", 20, 55)

    // Invoice title and number
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("INVOICE", 150, 30)

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`#${invoice.invoiceNumber}`, 150, 40)

    // Client information
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Bill To:", 20, 80)

    doc.setFont("helvetica", "normal")
    doc.text(invoice.clientName, 20, 90)
    doc.text("client@example.com", 20, 95)
    doc.text("456 Client Ave, City, State 12345", 20, 100)

    // Invoice details
    doc.setFont("helvetica", "bold")
    doc.text("Invoice Details:", 120, 80)

    doc.setFont("helvetica", "normal")
    doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 120, 90)

    if (invoice.dueDate && !invoice.isSetupInvoice) {
      doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 120, 95)
    } else {
      doc.text("Type: Subscription Setup", 120, 95)
    }

    // Table header
    doc.setFont("helvetica", "bold")
    doc.text("Description", 20, 130)
    doc.text("Amount", 150, 130)

    // Draw line under header
    doc.line(20, 135, 190, 135)

    // Table content
    doc.setFont("helvetica", "normal")
    const description = invoice.isSetupInvoice
      ? `${invoice.subscriptionName} - Subscription Setup`
      : invoice.subscriptionName
    doc.text(description, 20, 145)
    doc.text(`$${invoice.amount.toFixed(2)}`, 150, 145)

    // Total
    doc.line(20, 155, 190, 155)
    doc.setFont("helvetica", "bold")
    doc.text("Total:", 130, 165)
    doc.text(`$${invoice.amount.toFixed(2)}`, 150, 165)

    // Payment instructions
    doc.setFont("helvetica", "bold")
    doc.text("Payment Instructions:", 20, 190)

    doc.setFont("helvetica", "normal")
    const paymentText = invoice.isSetupInvoice
      ? "Thank you for subscribing! This invoice covers your subscription setup. Future payments will be processed according to your billing cycle."
      : "Please make payment by the due date. Payment can be made via cash, check, or bank transfer."
    const splitText = doc.splitTextToSize(paymentText, 170)
    doc.text(splitText, 20, 200)

    // Footer
    doc.setFont("helvetica", "italic")
    doc.text("Thank you for your business!", 105, 250, { align: "center" })

    // Save the PDF
    doc.save(`${invoice.invoiceNumber}.pdf`)
  }

  const previewInvoice = (invoice: Invoice) => {
    const invoicePreview: InvoicePreview = {
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      clientEmail: `${invoice.clientName.toLowerCase().replace(" ", ".")}@example.com`,
      clientAddress: "456 Client Ave, City, State 12345",
      subscriptionName: invoice.subscriptionName,
      amount: invoice.amount,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      companyName: "Your Company Name",
      companyAddress: "123 Business St\nCity, State 12345",
      companyPhone: "+1 (555) 123-4567",
      companyEmail: "contact@yourcompany.com",
      taxNumber: "TAX123456789",
      isSetupInvoice: invoice.isSetupInvoice,
    }

    setSelectedInvoice(invoicePreview)
    setIsInvoiceModalOpen(true)
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const clientMatch = selectedClient === "all" || invoice.clientName === selectedClient
    const statusMatch = selectedStatus === "all" || invoice.status === selectedStatus
    return clientMatch && statusMatch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-300 text-green-300 hover:bg-green-600">Paid</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const downloadInvoiceFromModal = () => {
    if (!selectedInvoice) return

    const doc = new jsPDF()

    // Company header
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text(selectedInvoice.companyName, 20, 30)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const companyAddressLines = selectedInvoice.companyAddress.split("\n")
    companyAddressLines.forEach((line, index) => {
      doc.text(line, 20, 40 + index * 5)
    })
    doc.text(selectedInvoice.companyPhone, 20, 40 + companyAddressLines.length * 5)
    doc.text(selectedInvoice.companyEmail, 20, 45 + companyAddressLines.length * 5)
    if (selectedInvoice.taxNumber) {
      doc.text(`Tax ID: ${selectedInvoice.taxNumber}`, 20, 50 + companyAddressLines.length * 5)
    }

    // Invoice title and number
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("INVOICE", 150, 30)

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`#${selectedInvoice.invoiceNumber}`, 150, 40)

    // Client information
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Bill To:", 20, 80)

    doc.setFont("helvetica", "normal")
    doc.text(selectedInvoice.clientName, 20, 90)
    doc.text(selectedInvoice.clientEmail, 20, 95)
    const clientAddressLines = selectedInvoice.clientAddress.split("\n")
    clientAddressLines.forEach((line, index) => {
      doc.text(line, 20, 100 + index * 5)
    })

    // Invoice details
    doc.setFont("helvetica", "bold")
    doc.text("Invoice Details:", 120, 80)

    doc.setFont("helvetica", "normal")
    doc.text(`Issue Date: ${new Date(selectedInvoice.issueDate).toLocaleDateString()}`, 120, 90)
    if (selectedInvoice.dueDate) {
      doc.text(`Due Date: ${new Date(selectedInvoice.dueDate).toLocaleDateString()}`, 120, 95)
    }

    // Table header
    doc.setFont("helvetica", "bold")
    doc.text("Description", 20, 130)
    doc.text("Amount", 150, 130)

    // Draw line under header
    doc.line(20, 135, 190, 135)

    // Table content
    doc.setFont("helvetica", "normal")
    doc.text(selectedInvoice.subscriptionName, 20, 145)
    doc.text(`$${selectedInvoice.amount.toFixed(2)}`, 150, 145)

    // Total
    doc.line(20, 155, 190, 155)
    doc.setFont("helvetica", "bold")
    doc.text("Total:", 130, 165)
    doc.text(`$${selectedInvoice.amount.toFixed(2)}`, 150, 165)

    // Payment instructions
    doc.setFont("helvetica", "bold")
    doc.text("Payment Instructions:", 20, 190)

    doc.setFont("helvetica", "normal")
    const paymentText = "Please make payment by the due date. Payment can be made via cash, check, or bank transfer."
    const splitText = doc.splitTextToSize(paymentText, 170)
    doc.text(splitText, 20, 200)

    // Footer
    doc.setFont("helvetica", "italic")
    doc.text("Thank you for your business!", 105, 250, { align: "center" })

    // Save the PDF
    doc.save(`${selectedInvoice.invoiceNumber}.pdf`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Manage and download your invoices</p>
        </div>
        <Button className="bg-red-500 text-white text-center" onClick={handleGenerateInvoice}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Invoice
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  <SelectItem value="John Doe">John Doe</SelectItem>
                  <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                  <SelectItem value="Alice Johnson">Alice Johnson</SelectItem>
                  <SelectItem value="Bob Wilson">Bob Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>Manage and download your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.invoiceNumber}
                    {invoice.isSetupInvoice && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Setup
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {invoice.subscriptionName}
                    </Badge>
                  </TableCell>
                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "No due date"}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => previewInvoice(invoice)}>
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => downloadInvoice(invoice)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Preview Modal */}
      <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Invoice Preview - {selectedInvoice?.invoiceNumber}</span>
              <Button onClick={downloadInvoiceFromModal} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </DialogTitle>
            <DialogDescription>Preview and download invoice</DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="bg-white p-8 border rounded-lg">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                  <p className="text-lg font-semibold text-gray-600">#{selectedInvoice.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold text-gray-900">{selectedInvoice.companyName}</h2>
                  <p className="text-gray-600 whitespace-pre-line">{selectedInvoice.companyAddress}</p>
                  <p className="text-gray-600">{selectedInvoice.companyPhone}</p>
                  <p className="text-gray-600">{selectedInvoice.companyEmail}</p>
                  {selectedInvoice.taxNumber && <p className="text-gray-600">Tax ID: {selectedInvoice.taxNumber}</p>}
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
                  <div className="text-gray-600">
                    <p className="font-medium">{selectedInvoice.clientName}</p>
                    <p>{selectedInvoice.clientEmail}</p>
                    <p className="whitespace-pre-line">{selectedInvoice.clientAddress}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Invoice Details:</h3>
                  <div className="text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Issue Date:</span>{" "}
                      {new Date(selectedInvoice.issueDate).toLocaleDateString()}
                    </p>
                    {selectedInvoice.dueDate && (
                      <p>
                        <span className="font-medium">Due Date:</span>{" "}
                        {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 font-semibold text-gray-900">Description</th>
                      <th className="text-right py-3 font-semibold text-gray-900">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-4 text-gray-600">{selectedInvoice.subscriptionName}</td>
                      <td className="py-4 text-right text-gray-600">${selectedInvoice.amount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Invoice Total */}
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-t-2 border-gray-300">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-xl text-gray-900">${selectedInvoice.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Instructions</h3>
                <p className="text-gray-600">
                  Please make payment by the due date. Payment can be made via cash, check, or bank transfer. For any
                  questions regarding this invoice, please contact us at {selectedInvoice.companyEmail}.
                </p>
              </div>

              {/* Footer */}
              <div className="text-center text-gray-500 text-sm mt-8 pt-6 border-t border-gray-200">
                <p>Thank you for your business!</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Invoice Modal */}
      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate New Invoice
            </DialogTitle>
            <DialogDescription>Create a professional invoice for your client</DialogDescription>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    </div>
  )
}
