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
import { Download, FileText, Plus, Calculator, DollarSign, Percent, Trash2 } from "lucide-react"
import jsPDF from "jspdf"
import { useExchangeRateStore } from "@/lib/exchange-rates"
import { useCompanySettingsStore } from "@/lib/company-settings"

interface Invoice {
  id: number
  invoiceNumber: string
  clientName: string
  items: InvoiceItem[]
  subtotal: number
  discountAmount: number
  discountPercentage: number
  totalAmount: number
  currency: string
  originalSubtotal: number
  originalDiscountAmount: number
  originalTotalAmount: number
  exchangeRate: number
  issueDate: string
  dueDate: string
  status: "paid" | "pending" | "overdue"
  notes?: string
  isSetupInvoice?: boolean
}

interface InvoiceItem {
  id: string
  type: "subscription" | "custom"
  description: string
  quantity: number
  unitPrice: number
  amount: number
  originalUnitPrice: number
  originalAmount: number
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

interface InvoicePreview {
  invoiceNumber: string
  clientName: string
  clientEmail: string
  clientAddress: string
  items: InvoiceItem[]
  subtotal: number
  discountAmount: number
  discountPercentage: number
  totalAmount: number
  currency: string
  originalSubtotal: number
  originalDiscountAmount: number
  originalTotalAmount: number
  exchangeRate: number
  issueDate: string
  dueDate: string
  notes?: string
  isSetupInvoice?: boolean
}

export default function InvoicesPage() {
  const router = useRouter()
  const { convertAmount, getRate, getCurrencyFlag, getSupportedCurrencies } = useExchangeRateStore()
  const { settings: companySettings } = useCompanySettingsStore()

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedCurrency, setSelectedCurrency] = useState<string>("all")
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [formData, setFormData] = useState({
    clientId: "",
    currency: "USD",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    discountPercentage: 0,
    notes: "",
  })
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoicePreview | null>(null)

  // Client subscriptions for multi-subscription support
  const [clientSubscriptions, setClientSubscriptions] = useState<{ [key: number]: number[] }>({
    1: [1], // John Doe has Basic Plan
    2: [2, 3], // Jane Smith has Premium and Enterprise
    3: [1], // Alice Johnson has Basic Plan
    4: [2], // Bob Wilson has Premium Plan
  })

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    loadData()
  }, [router])

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
            quantity: 1,
            unitPrice: 29.99,
            amount: 29.99,
            originalUnitPrice: 29.99,
            originalAmount: 29.99,
            subscriptionId: 1,
          },
        ],
        subtotal: 29.99,
        discountAmount: 0,
        discountPercentage: 0,
        totalAmount: 29.99,
        currency: "USD",
        originalSubtotal: 29.99,
        originalDiscountAmount: 0,
        originalTotalAmount: 29.99,
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
            quantity: 1,
            unitPrice: 1063.82,
            amount: 1063.82,
            originalUnitPrice: 59.99,
            originalAmount: 59.99,
            subscriptionId: 2,
          },
          {
            id: "2",
            type: "subscription",
            description: "Enterprise Plan",
            quantity: 1,
            unitPrice: 1774.65,
            amount: 1774.65,
            originalUnitPrice: 99.99,
            originalAmount: 99.99,
            subscriptionId: 3,
          },
          {
            id: "3",
            type: "custom",
            description: "Setup Fee",
            quantity: 1,
            unitPrice: 177.4,
            amount: 177.4,
            originalUnitPrice: 10,
            originalAmount: 10,
          },
        ],
        subtotal: 3015.87,
        discountAmount: 301.59, // 10% discount
        discountPercentage: 10,
        totalAmount: 2714.28,
        currency: "SRD",
        originalSubtotal: 169.98,
        originalDiscountAmount: 16.998,
        originalTotalAmount: 152.982,
        exchangeRate: 17.74,
        issueDate: "2024-01-05",
        dueDate: "2024-01-20",
        status: "paid",
        isSetupInvoice: false,
      },
    ]

    setInvoices(mockInvoices)
  }

  const addSubscriptionItem = (subscriptionId: number) => {
    const subscription = subscriptions.find((s) => s.id === subscriptionId)
    if (!subscription) return

    // Check if item already exists
    const existingItem = invoiceItems.find(
      (item) => item.type === "subscription" && item.subscriptionId === subscriptionId,
    )
    if (existingItem) {
      // Increase quantity
      updateItemQuantity(existingItem.id, existingItem.quantity + 1)
      return
    }

    const convertedPrice = convertAmount(subscription.price, "USD", formData.currency)

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      type: "subscription",
      description: subscription.name,
      quantity: 1,
      unitPrice: convertedPrice,
      amount: convertedPrice,
      originalUnitPrice: subscription.price,
      originalAmount: subscription.price,
      subscriptionId: subscription.id,
    }

    setInvoiceItems([...invoiceItems, newItem])
  }

  const addCustomItem = (description: string, usdPrice: number, quantity = 1) => {
    if (!description || usdPrice <= 0 || quantity <= 0) return

    const convertedPrice = convertAmount(usdPrice, "USD", formData.currency)

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      type: "custom",
      description: description,
      quantity: quantity,
      unitPrice: convertedPrice,
      amount: convertedPrice * quantity,
      originalUnitPrice: usdPrice,
      originalAmount: usdPrice * quantity,
    }

    setInvoiceItems([...invoiceItems, newItem])
  }

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }

    setInvoiceItems((items) =>
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              amount: item.unitPrice * newQuantity,
              originalAmount: item.originalUnitPrice * newQuantity,
            }
          : item,
      ),
    )
  }

  const removeItem = (itemId: string) => {
    setInvoiceItems(invoiceItems.filter((item) => item.id !== itemId))
  }

  const updateItemsForCurrency = (newCurrency: string) => {
    const updatedItems = invoiceItems.map((item) => {
      const convertedUnitPrice = convertAmount(item.originalUnitPrice, "USD", newCurrency)
      return {
        ...item,
        unitPrice: convertedUnitPrice,
        amount: convertedUnitPrice * item.quantity,
      }
    })
    setInvoiceItems(updatedItems)
  }

  const handleCurrencyChange = (currency: string) => {
    setFormData({ ...formData, currency })
    updateItemsForCurrency(currency)
  }

  const getSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.amount, 0)
  }

  const getOriginalSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.originalAmount, 0)
  }

  const getDiscountAmount = () => {
    return (getSubtotal() * formData.discountPercentage) / 100
  }

  const getOriginalDiscountAmount = () => {
    return (getOriginalSubtotal() * formData.discountPercentage) / 100
  }

  const getTotalAmount = () => {
    return getSubtotal() - getDiscountAmount()
  }

  const getOriginalTotalAmount = () => {
    return getOriginalSubtotal() - getOriginalDiscountAmount()
  }

  const getCurrentExchangeRate = () => {
    return getRate("USD", formData.currency)
  }

  const getClientSubscriptions = (clientId: number) => {
    const subscriptionIds = clientSubscriptions[clientId] || []
    return subscriptions.filter((sub) => subscriptionIds.includes(sub.id))
  }

  const handleGenerateInvoice = () => {
    setFormData({
      clientId: "",
      currency: "USD",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      discountPercentage: 0,
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
    if (!selectedClient) {
      alert("Please select a client")
      setIsGenerating(false)
      return
    }

    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

    // Create new invoice record
    const newInvoice: Invoice = {
      id: Date.now(),
      invoiceNumber,
      clientName: selectedClient.name,
      items: [...invoiceItems],
      subtotal: getSubtotal(),
      discountAmount: getDiscountAmount(),
      discountPercentage: formData.discountPercentage,
      totalAmount: getTotalAmount(),
      currency: formData.currency,
      originalSubtotal: getOriginalSubtotal(),
      originalDiscountAmount: getOriginalDiscountAmount(),
      originalTotalAmount: getOriginalTotalAmount(),
      exchangeRate: getCurrentExchangeRate(),
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      status: "pending",
      notes: formData.notes,
    }

    setInvoices([...invoices, newInvoice])

    setIsGenerating(false)
    setIsGenerateModalOpen(false)

    // Show success message instead of auto-download
    alert(
      `Multi-currency invoice ${invoiceNumber} generated successfully! You can preview and download it from the invoice list.`,
    )
  }

  const generatePDF = (invoice: Invoice | InvoicePreview, download = true) => {
    const doc = new jsPDF()

    // Company header
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text(companySettings.companyName, 20, 30)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const companyAddressLines = companySettings.address.split("\n")
    let yPos = 40
    companyAddressLines.forEach((line, index) => {
      doc.text(line, 20, yPos + index * 5)
    })
    yPos += companyAddressLines.length * 5
    doc.text(companySettings.phone, 20, yPos)
    doc.text(companySettings.email, 20, yPos + 5)
    if (companySettings.taxNumber) {
      doc.text(`Tax ID: ${companySettings.taxNumber}`, 20, yPos + 10)
    }
    if (companySettings.website) {
      doc.text(`Website: ${companySettings.website}`, 20, yPos + 15)
    }

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
    doc.text("Bill To:", 20, 90)

    doc.setFont("helvetica", "normal")
    const clientName = "clientName" in invoice ? invoice.clientName : invoice.clientName
    const clientEmail =
      "clientEmail" in invoice ? invoice.clientEmail : `${clientName.toLowerCase().replace(" ", ".")}@example.com`
    const clientAddress = "clientAddress" in invoice ? invoice.clientAddress : "456 Client Ave, City, State 12345"

    doc.text(clientName, 20, 100)
    doc.text(clientEmail, 20, 105)
    const clientAddressLines = clientAddress.split("\n")
    clientAddressLines.forEach((line, index) => {
      doc.text(line, 20, 110 + index * 5)
    })

    // Invoice details
    doc.setFont("helvetica", "bold")
    doc.text("Invoice Details:", 120, 90)

    doc.setFont("helvetica", "normal")
    doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 120, 100)
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 120, 105)
    doc.text(`Currency: ${invoice.currency}`, 120, 110)
    if (invoice.currency !== "USD") {
      doc.text(`Exchange Rate: 1 USD = ${invoice.exchangeRate.toFixed(6)} ${invoice.currency}`, 120, 115)
    }

    // Table header
    doc.setFont("helvetica", "bold")
    doc.text("Description", 20, 140)
    doc.text("Qty", 120, 140)
    doc.text("Unit Price", 140, 140)
    doc.text("Amount", 170, 140)

    // Draw line under header
    doc.line(20, 145, 190, 145)

    // Table content
    doc.setFont("helvetica", "normal")
    let yPosition = 155
    invoice.items.forEach((item) => {
      doc.text(item.description, 20, yPosition)
      doc.text(item.quantity.toString(), 120, yPosition)
      doc.text(`${getCurrencyFlag(invoice.currency)} ${item.unitPrice.toFixed(2)}`, 140, yPosition)
      doc.text(`${getCurrencyFlag(invoice.currency)} ${item.amount.toFixed(2)}`, 170, yPosition)

      if (invoice.currency !== "USD") {
        yPosition += 5
        doc.setFontSize(8)
        doc.text(`(${item.originalUnitPrice.toFixed(2)} USD each)`, 140, yPosition)
        doc.setFontSize(10)
      }
      yPosition += 10
    })

    // Subtotal, Discount, Total
    yPosition += 5
    doc.line(20, yPosition, 190, yPosition)
    yPosition += 10

    doc.setFont("helvetica", "normal")
    doc.text("Subtotal:", 130, yPosition)
    doc.text(`${getCurrencyFlag(invoice.currency)} ${invoice.subtotal.toFixed(2)}`, 170, yPosition)
    yPosition += 10

    if (invoice.discountPercentage > 0) {
      doc.text(`Discount (${invoice.discountPercentage}%):`, 130, yPosition)
      doc.text(`-${getCurrencyFlag(invoice.currency)} ${invoice.discountAmount.toFixed(2)}`, 170, yPosition)
      yPosition += 10
    }

    doc.setFont("helvetica", "bold")
    doc.text("Total:", 130, yPosition)
    doc.text(`${getCurrencyFlag(invoice.currency)} ${invoice.totalAmount.toFixed(2)}`, 170, yPosition)

    if (invoice.currency !== "USD") {
      yPosition += 8
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.text(`USD Equivalent: $${invoice.originalTotalAmount.toFixed(2)}`, 130, yPosition)
      doc.setFontSize(10)
    }

    // Notes if provided
    if (invoice.notes) {
      yPosition += 20
      doc.setFont("helvetica", "bold")
      doc.text("Notes:", 20, yPosition)
      yPosition += 10
      doc.setFont("helvetica", "normal")
      const notesText = doc.splitTextToSize(invoice.notes, 170)
      doc.text(notesText, 20, yPosition)
      yPosition += notesText.length * 5
    }

    // Payment instructions
    yPosition += 20
    doc.setFont("helvetica", "bold")
    doc.text("Payment Instructions:", 20, yPosition)

    yPosition += 10
    doc.setFont("helvetica", "normal")
    const paymentText =
      companySettings.paymentTerms ||
      `Please make payment by the due date in ${invoice.currency}. Payment can be made via cash, check, or bank transfer.`
    const splitText = doc.splitTextToSize(paymentText, 170)
    doc.text(splitText, 20, yPosition)

    // Bank details if provided
    if (companySettings.bankDetails) {
      yPosition += splitText.length * 5 + 10
      doc.setFont("helvetica", "bold")
      doc.text("Bank Details:", 20, yPosition)
      yPosition += 10
      doc.setFont("helvetica", "normal")
      const bankText = doc.splitTextToSize(companySettings.bankDetails, 170)
      doc.text(bankText, 20, yPosition)
    }

    // Footer
    doc.setFont("helvetica", "italic")
    const footerText = companySettings.footerText || "Thank you for your business!"
    doc.text(footerText, 105, 270, { align: "center" })

    if (download) {
      doc.save(`${invoice.invoiceNumber}.pdf`)
    }

    return doc
  }

  const downloadInvoice = (invoice: Invoice) => {
    generatePDF(invoice, true)
  }

  const previewInvoice = (invoice: Invoice) => {
    const invoicePreview: InvoicePreview = {
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.clientName,
      clientEmail: `${invoice.clientName.toLowerCase().replace(" ", ".")}@example.com`,
      clientAddress: "456 Client Ave, City, State 12345",
      items: invoice.items,
      subtotal: invoice.subtotal,
      discountAmount: invoice.discountAmount,
      discountPercentage: invoice.discountPercentage,
      totalAmount: invoice.totalAmount,
      currency: invoice.currency,
      originalSubtotal: invoice.originalSubtotal,
      originalDiscountAmount: invoice.originalDiscountAmount,
      originalTotalAmount: invoice.originalTotalAmount,
      exchangeRate: invoice.exchangeRate,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      notes: invoice.notes,
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

  const downloadInvoiceFromModal = () => {
    if (!selectedInvoice) return
    generatePDF(selectedInvoice, true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multi-Currency Invoices</h1>
          <p className="text-gray-600">Generate and manage invoices with multiple items, discounts, and currencies</p>
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
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.name}>
                      {client.name}
                    </SelectItem>
                  ))}
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
                  {getSupportedCurrencies().map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {getCurrencyFlag(currency)} {currency}
                    </SelectItem>
                  ))}
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
                          {item.description} {item.quantity > 1 && `(${item.quantity}x)`}
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
                    {invoice.discountPercentage > 0 && (
                      <div className="text-xs text-green-600">{invoice.discountPercentage}% discount applied</div>
                    )}
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
                        <div>🇺🇸 ${invoice.originalTotalAmount.toFixed(2)}</div>
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
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Generate Multi-Currency Invoice
            </DialogTitle>
            <DialogDescription>
              Create a professional invoice with multiple items, discounts, and currency conversion
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
                    {getSupportedCurrencies().map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        <span className="flex items-center gap-2">
                          {getCurrencyFlag(currency)} {currency}
                          {currency !== "USD" && (
                            <span className="text-xs text-gray-500">
                              (1 USD = {getRate("USD", currency).toFixed(4)} {currency})
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.discountPercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, discountPercentage: Number.parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            {/* Invoice Items Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Items</CardTitle>
                <CardDescription>Add client subscriptions or custom items to your invoice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Client Subscriptions */}
                {formData.clientId && (
                  <div className="space-y-2">
                    <Label>Client Subscriptions</Label>
                    <div className="flex flex-wrap gap-2">
                      {getClientSubscriptions(Number.parseInt(formData.clientId)).map((subscription) => (
                        <Button
                          key={subscription.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addSubscriptionItem(subscription.id)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-3 w-3" />
                          {subscription.name} - ${subscription.price}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add All Subscriptions */}
                <div className="space-y-2">
                  <Label>All Available Subscriptions</Label>
                  <Select
                    onValueChange={(value) => {
                      addSubscriptionItem(Number.parseInt(value))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add any subscription..." />
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <Input placeholder="Custom item description..." className="md:col-span-2" id="customDescription" />
                  <Input type="number" step="0.01" placeholder="USD Price" id="customPrice" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const descInput = document.getElementById("customDescription") as HTMLInputElement
                      const priceInput = document.getElementById("customPrice") as HTMLInputElement
                      const description = descInput.value
                      const price = Number.parseFloat(priceInput.value)
                      if (description && price > 0) {
                        addCustomItem(description, price)
                        descInput.value = ""
                        priceInput.value = ""
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>

                {/* Items List */}
                {invoiceItems.length > 0 && (
                  <div className="space-y-2">
                    <Label>Invoice Items:</Label>
                    <div className="border rounded-lg p-4 space-y-3">
                      {invoiceItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{item.description}</div>
                            <div className="text-sm text-gray-600 flex items-center gap-4">
                              <span>
                                {getCurrencyFlag(formData.currency)} {item.unitPrice.toFixed(2)} {formData.currency}{" "}
                                each
                                {formData.currency !== "USD" && (
                                  <span className="ml-2 text-gray-500">(${item.originalUnitPrice.toFixed(2)} USD)</span>
                                )}
                              </span>
                              <span className="font-medium">
                                Total: {getCurrencyFlag(formData.currency)} {item.amount.toFixed(2)} {formData.currency}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                className="h-8 w-8 p-0"
                              >
                                -
                              </Button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                className="h-8 w-8 p-0"
                              >
                                +
                              </Button>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total Display */}
                {invoiceItems.length > 0 && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Invoice Summary</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">
                            {getCurrencyFlag(formData.currency)} {getSubtotal().toFixed(2)} {formData.currency}
                          </span>
                        </div>
                        {formData.discountPercentage > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span className="flex items-center gap-1">
                              <Percent className="h-3 w-3" />
                              Discount ({formData.discountPercentage}%):
                            </span>
                            <span className="font-medium">
                              -{getCurrencyFlag(formData.currency)} {getDiscountAmount().toFixed(2)} {formData.currency}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold text-blue-700 pt-2 border-t">
                          <span>Total:</span>
                          <span>
                            {getCurrencyFlag(formData.currency)} {getTotalAmount().toFixed(2)} {formData.currency}
                          </span>
                        </div>
                        {formData.currency !== "USD" && (
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>USD Equivalent:</span>
                            <span>🇺🇸 ${getOriginalTotalAmount().toFixed(2)}</span>
                          </div>
                        )}
                        {formData.currency !== "USD" && (
                          <div className="text-xs text-gray-500 text-center">
                            Exchange Rate: 1 USD = {getCurrentExchangeRate().toFixed(6)} {formData.currency}
                          </div>
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
              {isGenerating ? "Generating Invoice..." : "Generate Invoice"}
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
                  <h2 className="text-xl font-bold text-gray-900">{companySettings.companyName}</h2>
                  <div className="text-gray-600">
                    {companySettings.address.split("\n").map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                  <p className="text-gray-600">{companySettings.phone}</p>
                  <p className="text-gray-600">{companySettings.email}</p>
                  {companySettings.taxNumber && <p className="text-gray-600">Tax ID: {companySettings.taxNumber}</p>}
                  {companySettings.website && <p className="text-gray-600">{companySettings.website}</p>}
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
                      <th className="text-center py-3 font-semibold text-gray-900">Qty</th>
                      <th className="text-right py-3 font-semibold text-gray-900">Unit Price</th>
                      <th className="text-right py-3 font-semibold text-gray-900">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-200">
                        <td className="py-4 text-gray-600">
                          <div>{item.description}</div>
                          {selectedInvoice.currency !== "USD" && (
                            <div className="text-sm text-gray-500">
                              Original: ${item.originalUnitPrice.toFixed(2)} USD each
                            </div>
                          )}
                        </td>
                        <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                        <td className="py-4 text-right text-gray-600">
                          <div className="flex items-center justify-end gap-1">
                            {getCurrencyFlag(selectedInvoice.currency)}
                            {item.unitPrice.toFixed(2)} {selectedInvoice.currency}
                          </div>
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
                <div className="w-80">
                  <div className="flex justify-between py-2">
                    <span className="font-medium text-gray-900">Subtotal:</span>
                    <span className="flex items-center gap-1">
                      {getCurrencyFlag(selectedInvoice.currency)}
                      {selectedInvoice.subtotal.toFixed(2)} {selectedInvoice.currency}
                    </span>
                  </div>
                  {selectedInvoice.discountPercentage > 0 && (
                    <div className="flex justify-between py-2 text-green-600">
                      <span className="font-medium">Discount ({selectedInvoice.discountPercentage}%):</span>
                      <span className="flex items-center gap-1">
                        -{getCurrencyFlag(selectedInvoice.currency)}
                        {selectedInvoice.discountAmount.toFixed(2)} {selectedInvoice.currency}
                      </span>
                    </div>
                  )}
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
                      <span>🇺🇸 ${selectedInvoice.originalTotalAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes:</h3>
                  <p className="text-gray-600 whitespace-pre-line">{selectedInvoice.notes}</p>
                </div>
              )}

              {/* Payment Instructions */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Instructions</h3>
                <p className="text-gray-600 mb-4">
                  {companySettings.paymentTerms ||
                    `Please make payment by the due date in ${selectedInvoice.currency}. Payment can be made via cash, check, or bank transfer.`}
                </p>
                {companySettings.bankDetails && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Bank Details:</h4>
                    <p className="text-gray-600 whitespace-pre-line">{companySettings.bankDetails}</p>
                  </div>
                )}
                {selectedInvoice.currency !== "USD" && (
                  <p className="text-gray-600 mt-4">
                    <strong>Note:</strong> This invoice is billed in {selectedInvoice.currency} based on the exchange
                    rate of 1 USD = {selectedInvoice.exchangeRate.toFixed(6)} {selectedInvoice.currency} at the time of
                    invoice generation.
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="text-center text-gray-500 text-sm mt-8 pt-6 border-t border-gray-200">
                <p>{companySettings.footerText || "Thank you for your business!"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
