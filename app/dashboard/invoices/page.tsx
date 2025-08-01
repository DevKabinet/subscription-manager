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
import { Download, FileText, Plus, X, Calculator, DollarSign } from "lucide-react"
import jsPDF from "jspdf"

interface Invoice {
  id: number
  invoiceNumber: string
  clientName: string
  items: InvoiceItem[]
  totalAmount: number
  currency: string
  originalAmount: number
  exchangeRate: number
  issueDate: string
  dueDate: string
  status: "paid" | "pending" | "overdue"
  isSetupInvoice?: boolean
}

interface InvoiceItem {
  id: string
  type: "subscription" | "custom"
  description: string
  amount: number
  originalAmount: number // USD amount
  subscriptionId?: number
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

interface ExchangeRate {
  base_currency: string
  target_currency: string
  rate: number
  last_updated: string
  is_manual: boolean
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
  items: InvoiceItem[]
  totalAmount: number
  currency: string
  originalAmount: number
  exchangeRate: number
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
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedCurrency, setSelectedCurrency] = useState<string>("all")
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
  const [formData, setFormData] = useState({
    clientId: "",
    currency: "USD",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
  })
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
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

    fetchExchangeRates()
    loadData()
  }, [router])

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch("/api/exchange-rates")
      const result = await response.json()
      if (result.success) {
        setExchangeRates(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error)
    }
  }

  const loadData = () => {
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

    // Load existing mock invoices with multi-currency support
    const mockInvoices: Invoice[] = [
      {
        id: 1,
        invoiceNumber: "INV-2024-001",
        clientName: "John Doe",
        items: [
          {
            id: "1",
            type: "subscription",
            description: "Basic Plan",
            amount: 29.99,
            originalAmount: 29.99,
            subscriptionId: 1,
          },
        ],
        totalAmount: 29.99,
        currency: "USD",
        originalAmount: 29.99,
        exchangeRate: 1.0,
        issueDate: "2024-01-01",
        dueDate: "2024-01-15",
        status: "paid",
        isSetupInvoice: false,
      },
      {
        id: 2,
        invoiceNumber: "INV-2024-002",
        clientName: "Jane Smith",
        items: [
          {
            id: "1",
            type: "subscription",
            description: "Premium Plan",
            amount: 1063.82, // 59.99 * 17.74
            originalAmount: 59.99,
            subscriptionId: 2,
          },
          {
            id: "2",
            type: "custom",
            description: "Setup Fee",
            amount: 177.4, // 10 * 17.74
            originalAmount: 10,
          },
        ],
        totalAmount: 1241.22,
        currency: "SRD",
        originalAmount: 69.99,
        exchangeRate: 17.74,
        issueDate: "2024-01-05",
        dueDate: "2024-01-20",
        status: "paid",
        isSetupInvoice: false,
      },
      {
        id: 3,
        invoiceNumber: "INV-2024-003",
        clientName: "Alice Johnson",
        items: [
          {
            id: "1",
            type: "subscription",
            description: "Basic Plan",
            amount: 25.49, // 29.99 * 0.85
            originalAmount: 29.99,
            subscriptionId: 1,
          },
        ],
        totalAmount: 25.49,
        currency: "EUR",
        originalAmount: 29.99,
        exchangeRate: 0.85,
        issueDate: "2024-01-10",
        dueDate: "2024-01-25",
        status: "pending",
        isSetupInvoice: false,
      },
    ]

    setInvoices(mockInvoices)
  }

  // Calculate amount based on selected currency
  const calculateAmount = (originalAmount: number, currency: string): { amount: number; rate: number } => {
    if (currency === "USD") {
      return { amount: originalAmount, rate: 1.0 }
    }

    const exchangeRate = exchangeRates.find((rate) => rate.target_currency === currency)
    if (exchangeRate) {
      return {
        amount: originalAmount * exchangeRate.rate,
        rate: exchangeRate.rate,
      }
    }

    return { amount: originalAmount, rate: 1.0 }
  }

  const addSubscriptionItem = (subscriptionId: number) => {
    const subscription = subscriptions.find((s) => s.id === subscriptionId)
    if (!subscription) return

    const { amount } = calculateAmount(subscription.price, formData.currency)

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      type: "subscription",
      description: subscription.name,
      amount: amount,
      originalAmount: subscription.price,
      subscriptionId: subscription.id,
    }

    setInvoiceItems([...invoiceItems, newItem])
  }

  const addCustomItem = (description: string, usdAmount: number) => {
    if (!description || usdAmount <= 0) return

    const { amount } = calculateAmount(usdAmount, formData.currency)

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      type: "custom",
      description: description,
      amount: amount,
      originalAmount: usdAmount,
    }

    setInvoiceItems([...invoiceItems, newItem])
  }

  const removeItem = (itemId: string) => {
    setInvoiceItems(invoiceItems.filter((item) => item.id !== itemId))
  }

  const updateItemsForCurrency = (newCurrency: string) => {
    const updatedItems = invoiceItems.map((item) => {
      const { amount } = calculateAmount(item.originalAmount, newCurrency)
      return { ...item, amount }
    })
    setInvoiceItems(updatedItems)
  }

  const handleCurrencyChange = (currency: string) => {
    setFormData({ ...formData, currency })
    updateItemsForCurrency(currency)
  }

  const getTotalAmount = () => {
    return invoiceItems.reduce((sum, item) => sum + item.amount, 0)
  }

  const getTotalOriginalAmount = () => {
    return invoiceItems.reduce((sum, item) => sum + item.originalAmount, 0)
  }

  const getCurrentExchangeRate = () => {
    if (formData.currency === "USD") return 1.0
    const rate = exchangeRates.find((r) => r.target_currency === formData.currency)
    return rate?.rate || 1.0
  }

  const handleGenerateInvoice = () => {
    setFormData({
      clientId: "",
      currency: "USD",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      notes: "",
    })
    setInvoiceItems([])
    // Set default due date (30 days from issue date)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)
    setFormData((prev) => ({ ...prev, dueDate: dueDate.toISOString().split("T")[0] }))
    setIsGenerateModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (invoiceItems.length === 0) {
      alert("Please add at least one item to the invoice")
      return
    }

    setIsGenerating(true)

    const selectedClient = clients.find((c) => c.id === Number.parseInt(formData.clientId))
    if (!selectedClient || !companySettings) {
      alert("Please select a client")
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
    doc.text(`Currency: ${formData.currency}`, 120, 100)
    if (formData.currency !== "USD") {
      doc.text(`Exchange Rate: 1 USD = ${getCurrentExchangeRate().toFixed(6)} ${formData.currency}`, 120, 105)
    }

    // Table header
    doc.setFont("helvetica", "bold")
    doc.text("Description", 20, 130)
    doc.text("Amount", 150, 130)

    // Draw line under header
    doc.line(20, 135, 190, 135)

    // Table content
    doc.setFont("helvetica", "normal")
    let yPosition = 145
    invoiceItems.forEach((item, index) => {
      doc.text(item.description, 20, yPosition)
      doc.text(`${item.amount.toFixed(2)} ${formData.currency}`, 150, yPosition)
      if (formData.currency !== "USD") {
        doc.text(`(${item.originalAmount.toFixed(2)} USD)`, 150, yPosition + 5)
        yPosition += 10
      } else {
        yPosition += 10
      }
    })

    // Total
    yPosition += 5
    doc.line(20, yPosition, 190, yPosition)
    yPosition += 10
    doc.setFont("helvetica", "bold")
    doc.text("Total:", 130, yPosition)
    doc.text(`${getTotalAmount().toFixed(2)} ${formData.currency}`, 150, yPosition)

    // Notes if provided
    if (formData.notes) {
      yPosition += 20
      doc.setFont("helvetica", "bold")
      doc.text("Notes:", 20, yPosition)
      yPosition += 10
      doc.setFont("helvetica", "normal")
      const notesText = doc.splitTextToSize(formData.notes, 170)
      doc.text(notesText, 20, yPosition)
      yPosition += notesText.length * 5
    }

    // Payment instructions
    yPosition += 20
    doc.setFont("helvetica", "bold")
    doc.text("Payment Instructions:", 20, yPosition)

    yPosition += 10
    doc.setFont("helvetica", "normal")
    const paymentText = `Please make payment by the due date in ${formData.currency}. Payment can be made via cash, check, or bank transfer. For any questions regarding this invoice, please contact us at ${companySettings.email}.`
    const splitText = doc.splitTextToSize(paymentText, 170)
    doc.text(splitText, 20, yPosition)

    // Footer
    doc.setFont("helvetica", "italic")
    doc.text("Thank you for your business!", 105, 270, { align: "center" })

    // Save the PDF
    doc.save(`${invoiceNumber}.pdf`)

    // Create new invoice record
    const newInvoice: Invoice = {
      id: Date.now(),
      invoiceNumber,
      clientName: selectedClient.name,
      items: [...invoiceItems],
      totalAmount: getTotalAmount(),
      currency: formData.currency,
      originalAmount: getTotalOriginalAmount(),
      exchangeRate: getCurrentExchangeRate(),
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      status: "pending",
    }

    setInvoices([...invoices, newInvoice])

    setIsGenerating(false)
    setIsGenerateModalOpen(false)

    // Show success message
    alert(`Multi-currency invoice ${invoiceNumber} generated successfully!`)
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
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 120, 95)
    doc.text(`Currency: ${invoice.currency}`, 120, 100)
    if (invoice.currency !== "USD") {
      doc.text(`Exchange Rate: 1 USD = ${invoice.exchangeRate.toFixed(6)} ${invoice.currency}`, 120, 105)
    }

    // Table header
    doc.setFont("helvetica", "bold")
    doc.text("Description", 20, 130)
    doc.text("Amount", 150, 130)

    // Draw line under header
    doc.line(20, 135, 190, 135)

    // Table content
    doc.setFont("helvetica", "normal")
    let yPosition = 145
    invoice.items.forEach((item) => {
      doc.text(item.description, 20, yPosition)
      doc.text(`${item.amount.toFixed(2)} ${invoice.currency}`, 150, yPosition)
      if (invoice.currency !== "USD") {
        doc.text(`(${item.originalAmount.toFixed(2)} USD)`, 150, yPosition + 5)
        yPosition += 10
      } else {
        yPosition += 10
      }
    })

    // Total
    yPosition += 5
    doc.line(20, yPosition, 190, yPosition)
    yPosition += 10
    doc.setFont("helvetica", "bold")
    doc.text("Total:", 130, yPosition)
    doc.text(`${invoice.totalAmount.toFixed(2)} ${invoice.currency}`, 150, yPosition)

    // Payment instructions
    yPosition += 20
    doc.setFont("helvetica", "bold")
    doc.text("Payment Instructions:", 20, yPosition)

    yPosition += 10
    doc.setFont("helvetica", "normal")
    const paymentText = `Please make payment by the due date in ${invoice.currency}. Payment can be made via cash, check, or bank transfer.`
    const splitText = doc.splitTextToSize(paymentText, 170)
    doc.text(splitText, 20, yPosition)

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
      items: invoice.items,
      totalAmount: invoice.totalAmount,
      currency: invoice.currency,
      originalAmount: invoice.originalAmount,
      exchangeRate: invoice.exchangeRate,
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
    const currencyMatch = selectedCurrency === "all" || invoice.currency === selectedCurrency
    return clientMatch && statusMatch && currencyMatch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500 text-green-100 hover:bg-green-600">Paid</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCurrencyFlag = (currency: string) => {
    const flags: { [key: string]: string } = {
      USD: "🇺🇸",
      EUR: "🇪🇺",
      SRD: "🇸🇷",
    }
    return flags[currency] || "💱"
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
    doc.text(`Due Date: ${new Date(selectedInvoice.dueDate).toLocaleDateString()}`, 120, 95)
    doc.text(`Currency: ${selectedInvoice.currency}`, 120, 100)
    if (selectedInvoice.currency !== "USD") {
      doc.text(
        `Exchange Rate: 1 USD = ${selectedInvoice.exchangeRate.toFixed(6)} ${selectedInvoice.currency}`,
        120,
        105,
      )
    }

    // Table header
    doc.setFont("helvetica", "bold")
    doc.text("Description", 20, 130)
    doc.text("Amount", 150, 130)

    // Draw line under header
    doc.line(20, 135, 190, 135)

    // Table content
    doc.setFont("helvetica", "normal")
    let yPosition = 145
    selectedInvoice.items.forEach((item) => {
      doc.text(item.description, 20, yPosition)
      doc.text(`${item.amount.toFixed(2)} ${selectedInvoice.currency}`, 150, yPosition)
      if (selectedInvoice.currency !== "USD") {
        doc.text(`(${item.originalAmount.toFixed(2)} USD)`, 150, yPosition + 5)
        yPosition += 10
      } else {
        yPosition += 10
      }
    })

    // Total
    yPosition += 5
    doc.line(20, yPosition, 190, yPosition)
    yPosition += 10
    doc.setFont("helvetica", "bold")
    doc.text("Total:", 130, yPosition)
    doc.text(`${selectedInvoice.totalAmount.toFixed(2)} ${selectedInvoice.currency}`, 150, yPosition)

    // Payment instructions
    yPosition += 20
    doc.setFont("helvetica", "bold")
    doc.text("Payment Instructions:", 20, yPosition)

    yPosition += 10
    doc.setFont("helvetica", "normal")
    const paymentText = `Please make payment by the due date in ${selectedInvoice.currency}. Payment can be made via cash, check, or bank transfer.`
    const splitText = doc.splitTextToSize(paymentText, 170)
    doc.text(splitText, 20, yPosition)

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
          <h1 className="text-2xl font-bold text-gray-900">Multi-Currency Invoices</h1>
          <p className="text-gray-600">Generate and manage invoices with multiple items and currencies</p>
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
            <div className="flex-1">
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Currencies</SelectItem>
                  <SelectItem value="USD">🇺🇸 USD</SelectItem>
                  <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
                  <SelectItem value="SRD">🇸🇷 SRD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>Manage and download your multi-currency invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>USD Equivalent</TableHead>
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
                    <div className="space-y-1">
                      {invoice.items.slice(0, 2).map((item) => (
                        <Badge key={item.id} variant="outline" className="text-xs mr-1">
                          {item.description}
                        </Badge>
                      ))}
                      {invoice.items.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{invoice.items.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1">
                      {getCurrencyFlag(invoice.currency)}
                      {invoice.totalAmount.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      {getCurrencyFlag(invoice.currency)}
                      {invoice.currency}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {invoice.currency !== "USD" ? (
                      <div>
                        <div>🇺🇸 ${invoice.originalAmount.toFixed(2)}</div>
                        <div className="text-xs">Rate: {invoice.exchangeRate.toFixed(4)}</div>
                      </div>
                    ) : (
                      "🇺🇸 " + invoice.totalAmount.toFixed(2)
                    )}
                  </TableCell>
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

      {/* Generate Invoice Modal */}
      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Generate Multi-Currency Invoice
            </DialogTitle>
            <DialogDescription>
              Create a professional invoice with multiple items and currency conversion
            </DialogDescription>
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
                <Label htmlFor="currency">Invoice Currency</Label>
                <Select value={formData.currency} onValueChange={handleCurrencyChange} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {exchangeRates.map((rate) => (
                      <SelectItem key={rate.target_currency} value={rate.target_currency}>
                        <span className="flex items-center gap-2">
                          {getCurrencyFlag(rate.target_currency)} {rate.target_currency}
                          {rate.target_currency !== "USD" && (
                            <span className="text-xs text-gray-500">
                              (1 USD = {rate.rate.toFixed(4)} {rate.target_currency})
                            </span>
                          )}
                        </span>
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

            {/* Invoice Items Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Items</CardTitle>
                <CardDescription>Add subscriptions or custom items to your invoice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Subscription Item */}
                <div className="flex gap-2">
                  <Select
                    onValueChange={(value) => {
                      addSubscriptionItem(Number.parseInt(value))
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Add subscription..." />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptions.map((subscription) => (
                        <SelectItem key={subscription.id} value={subscription.id.toString()}>
                          {subscription.name} - ${subscription.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Add Custom Item */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Custom item description..."
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        const description = (e.target as HTMLInputElement).value
                        const amountInput = document.getElementById("customAmount") as HTMLInputElement
                        const amount = Number.parseFloat(amountInput.value)
                        if (description && amount > 0) {
                          addCustomItem(description, amount)
                          ;(e.target as HTMLInputElement).value = ""
                          amountInput.value = ""
                        }
                      }
                    }}
                  />
                  <Input
                    id="customAmount"
                    type="number"
                    step="0.01"
                    placeholder="USD Amount"
                    className="w-32"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        const amount = Number.parseFloat((e.target as HTMLInputElement).value)
                        const descInput = (e.target as HTMLInputElement).parentElement?.querySelector(
                          "input",
                        ) as HTMLInputElement
                        const description = descInput.value
                        if (description && amount > 0) {
                          addCustomItem(description, amount)
                          descInput.value = ""
                          ;(e.target as HTMLInputElement).value = ""
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const descInput = document.querySelector(
                        'input[placeholder="Custom item description..."]',
                      ) as HTMLInputElement
                      const amountInput = document.getElementById("customAmount") as HTMLInputElement
                      const description = descInput.value
                      const amount = Number.parseFloat(amountInput.value)
                      if (description && amount > 0) {
                        addCustomItem(description, amount)
                        descInput.value = ""
                        amountInput.value = ""
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Items List */}
                {invoiceItems.length > 0 && (
                  <div className="space-y-2">
                    <Label>Invoice Items:</Label>
                    <div className="border rounded-lg p-4 space-y-2">
                      {invoiceItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <div className="font-medium">{item.description}</div>
                            <div className="text-sm text-gray-600">
                              {getCurrencyFlag(formData.currency)} {item.amount.toFixed(2)} {formData.currency}
                              {formData.currency !== "USD" && (
                                <span className="ml-2 text-gray-500">(${item.originalAmount.toFixed(2)} USD)</span>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total Display */}
                {invoiceItems.length > 0 && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calculator className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Invoice Total</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total ({formData.currency}):</span>
                          <div className="font-bold text-lg text-blue-700">
                            {getCurrencyFlag(formData.currency)} {getTotalAmount().toFixed(2)} {formData.currency}
                          </div>
                        </div>
                        {formData.currency !== "USD" && (
                          <>
                            <div>
                              <span className="text-gray-600">USD Equivalent:</span>
                              <div className="font-medium">🇺🇸 ${getTotalOriginalAmount().toFixed(2)}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Exchange Rate:</span>
                              <div className="font-medium">
                                1 USD = {getCurrentExchangeRate().toFixed(6)} {formData.currency}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

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

            <Button type="submit" className="w-full" disabled={isGenerating || invoiceItems.length === 0}>
              <FileText className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating Invoice..." : "Generate & Download Invoice"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

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
            <DialogDescription>Preview and download multi-currency invoice</DialogDescription>
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
                    <p>
                      <span className="font-medium">Due Date:</span>{" "}
                      {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Currency:</span> {getCurrencyFlag(selectedInvoice.currency)}{" "}
                      {selectedInvoice.currency}
                    </p>
                    {selectedInvoice.currency !== "USD" && (
                      <p>
                        <span className="font-medium">Exchange Rate:</span> 1 USD ={" "}
                        {selectedInvoice.exchangeRate.toFixed(6)} {selectedInvoice.currency}
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
                    {selectedInvoice.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-200">
                        <td className="py-4 text-gray-600">
                          <div>{item.description}</div>
                          {selectedInvoice.currency !== "USD" && (
                            <div className="text-sm text-gray-500">Original: ${item.originalAmount.toFixed(2)} USD</div>
                          )}
                        </td>
                        <td className="py-4 text-right text-gray-600">
                          <div className="flex items-center justify-end gap-1">
                            {getCurrencyFlag(selectedInvoice.currency)}
                            {item.amount.toFixed(2)} {selectedInvoice.currency}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invoice Total */}
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-t-2 border-gray-300">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-xl text-gray-900 flex items-center gap-1">
                      {getCurrencyFlag(selectedInvoice.currency)}
                      {selectedInvoice.totalAmount.toFixed(2)} {selectedInvoice.currency}
                    </span>
                  </div>
                  {selectedInvoice.currency !== "USD" && (
                    <div className="flex justify-between py-1 text-sm text-gray-600">
                      <span>USD Equivalent:</span>
                      <span>🇺🇸 ${selectedInvoice.originalAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Instructions */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Instructions</h3>
                <p className="text-gray-600">
                  Please make payment by the due date in {selectedInvoice.currency}. Payment can be made via cash,
                  check, or bank transfer. For any questions regarding this invoice, please contact us at{" "}
                  {selectedInvoice.companyEmail}.
                </p>
                {selectedInvoice.currency !== "USD" && (
                  <p className="text-gray-600 mt-2">
                    <strong>Note:</strong> This invoice is billed in {selectedInvoice.currency} based on the exchange
                    rate of 1 USD = {selectedInvoice.exchangeRate.toFixed(6)} {selectedInvoice.currency} at the time of
                    invoice generation.
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="text-center text-gray-500 text-sm mt-8 pt-6 border-t border-gray-200">
                <p>Thank you for your business!</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
