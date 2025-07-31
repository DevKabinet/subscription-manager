"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Download, Plus, Paperclip, Filter, Edit } from "lucide-react"
import jsPDF from "jspdf"

interface Payment {
  id: number
  clientSubscriptionId: number
  clientName: string
  subscriptionName: string
  amount: number
  paymentDate: string
  dueDate: string
  status: "pending" | "paid" | "overdue" | "cancelled"
  paymentMethod?: string
  paymentReference?: string
  notes?: string
  attachmentUrl?: string
  attachmentName?: string
  invoiceNumber?: string
}

interface InvoicePreview {
  invoiceNumber: string
  clientName: string
  clientEmail: string
  clientAddress: string
  subscriptionName: string
  amount: number
  issueDate: string
  dueDate?: string
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  taxNumber: string
  isSetupInvoice?: boolean
}

interface PaymentFormData {
  clientSubscriptionId: string
  paymentDate: string
  dueDate: string
  amount: string
  paymentMethod: string
  paymentReference: string
  notes: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7))
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterClient, setFilterClient] = useState<string>("all")
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoicePreview | null>(null)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    clientSubscriptionId: "",
    paymentDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    amount: "",
    paymentMethod: "",
    paymentReference: "",
    notes: "",
  })
  const router = useRouter()

  // Mock client subscriptions for the form
  const clientSubscriptions = [
    { id: 1, clientName: "John Doe", subscriptionName: "Basic Plan", price: 29.99 },
    { id: 2, clientName: "Jane Smith", subscriptionName: "Premium Plan", price: 59.99 },
    { id: 3, clientName: "Alice Johnson", subscriptionName: "Basic Plan", price: 29.99 },
    { id: 4, clientName: "Bob Wilson", subscriptionName: "Premium Plan", price: 59.99 },
  ]

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Load payments with recurring schedule
    const allPayments: Payment[] = [
      // Past payments
      {
        id: 1,
        clientSubscriptionId: 1,
        clientName: "John Doe",
        subscriptionName: "Basic Plan",
        amount: 29.99,
        paymentDate: "2024-01-01",
        dueDate: "2024-01-15",
        status: "paid",
        paymentMethod: "Cash",
        invoiceNumber: "INV-2024-001",
      },
      {
        id: 2,
        clientSubscriptionId: 2,
        clientName: "Jane Smith",
        subscriptionName: "Premium Plan",
        amount: 59.99,
        paymentDate: "2024-01-05",
        dueDate: "2024-01-20",
        status: "paid",
        paymentMethod: "Bank Transfer",
        paymentReference: "TXN-20240105-001",
        attachmentUrl: "/mock-receipt.pdf",
        attachmentName: "bank_transfer_receipt.pdf",
        invoiceNumber: "INV-2024-002",
      },
      // Current month payments
      {
        id: 3,
        clientSubscriptionId: 1,
        clientName: "John Doe",
        subscriptionName: "Basic Plan",
        amount: 29.99,
        paymentDate: "2025-01-01",
        dueDate: "2025-01-15",
        status: "pending",
        invoiceNumber: "INV-2025-001",
      },
      {
        id: 4,
        clientSubscriptionId: 2,
        clientName: "Jane Smith",
        subscriptionName: "Premium Plan",
        amount: 59.99,
        paymentDate: "2025-01-05",
        dueDate: "2025-01-20",
        status: "pending",
        invoiceNumber: "INV-2025-002",
      },
      {
        id: 5,
        clientSubscriptionId: 3,
        clientName: "Alice Johnson",
        subscriptionName: "Basic Plan",
        amount: 29.99,
        paymentDate: "2025-01-10",
        dueDate: "2025-01-25",
        status: "overdue",
        invoiceNumber: "INV-2025-003",
      },
      // Future payments (automatically generated)
      {
        id: 6,
        clientSubscriptionId: 1,
        clientName: "John Doe",
        subscriptionName: "Basic Plan",
        amount: 29.99,
        paymentDate: "2025-02-01",
        dueDate: "2025-02-15",
        status: "pending",
        invoiceNumber: "INV-2025-004",
      },
      {
        id: 7,
        clientSubscriptionId: 2,
        clientName: "Jane Smith",
        subscriptionName: "Premium Plan",
        amount: 59.99,
        paymentDate: "2025-02-05",
        dueDate: "2025-02-20",
        status: "pending",
        invoiceNumber: "INV-2025-005",
      },
      {
        id: 8,
        clientSubscriptionId: 1,
        clientName: "John Doe",
        subscriptionName: "Basic Plan",
        amount: 29.99,
        paymentDate: "2025-03-01",
        dueDate: "2025-03-15",
        status: "pending",
        invoiceNumber: "INV-2025-006",
      },
    ]

    setPayments(allPayments)
  }, [router])

  // Filter payments based on selected criteria
  useEffect(() => {
    let filtered = payments

    // Filter by month
    if (filterMonth !== "all") {
      filtered = filtered.filter((payment) => payment.paymentDate.startsWith(filterMonth))
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((payment) => payment.status === filterStatus)
    }

    // Filter by client
    if (filterClient !== "all") {
      filtered = filtered.filter((payment) => payment.clientName === filterClient)
    }

    setFilteredPayments(filtered)
  }, [payments, filterMonth, filterStatus, filterClient])

  const handlePaymentToggle = (paymentId: number, isPaid: boolean) => {
    setPayments(
      payments.map((payment) =>
        payment.id === paymentId
          ? {
              ...payment,
              status: isPaid ? "paid" : "pending",
              paymentMethod: isPaid ? "Cash" : undefined,
            }
          : payment,
      ),
    )
  }

  const handleInvoiceClick = (payment: Payment) => {
    if (!payment.invoiceNumber) return

    const invoicePreview: InvoicePreview = {
      invoiceNumber: payment.invoiceNumber,
      clientName: payment.clientName,
      clientEmail: `${payment.clientName.toLowerCase().replace(" ", ".")}@example.com`,
      clientAddress: "456 Client Ave, City, State 12345",
      subscriptionName: payment.subscriptionName,
      amount: payment.amount,
      issueDate: payment.paymentDate,
      dueDate: payment.dueDate,
      companyName: "Your Company Name",
      companyAddress: "123 Business St\nCity, State 12345",
      companyPhone: "+1 (555) 123-4567",
      companyEmail: "contact@yourcompany.com",
      taxNumber: "TAX123456789",
      isSetupInvoice: false,
    }

    setSelectedInvoice(invoicePreview)
    setIsInvoiceModalOpen(true)
  }

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment)
    setPaymentForm({
      clientSubscriptionId: payment.clientSubscriptionId.toString(),
      paymentDate: payment.paymentDate,
      dueDate: payment.dueDate,
      amount: payment.amount.toString(),
      paymentMethod: payment.paymentMethod || "",
      paymentReference: payment.paymentReference || "",
      notes: payment.notes || "",
    })
    setIsEditModalOpen(true)
  }

  const handleAddPayment = () => {
    setEditingPayment(null)
    setPaymentForm({
      clientSubscriptionId: "",
      paymentDate: new Date().toISOString().split("T")[0],
      dueDate: "",
      amount: "",
      paymentMethod: "",
      paymentReference: "",
      notes: "",
    })
    setSelectedFile(null)
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedSubscription = clientSubscriptions.find(
      (cs) => cs.id === Number.parseInt(paymentForm.clientSubscriptionId),
    )
    if (!selectedSubscription) return

    const newPayment: Payment = {
      id: Date.now(),
      clientSubscriptionId: Number.parseInt(paymentForm.clientSubscriptionId),
      clientName: selectedSubscription.clientName,
      subscriptionName: selectedSubscription.subscriptionName,
      amount: Number.parseFloat(paymentForm.amount),
      paymentDate: paymentForm.paymentDate,
      dueDate: paymentForm.dueDate,
      status: "pending",
      paymentMethod: paymentForm.paymentMethod || undefined,
      paymentReference: paymentForm.paymentReference || undefined,
      notes: paymentForm.notes || undefined,
      attachmentUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
      attachmentName: selectedFile?.name,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    }

    setPayments([...payments, newPayment])
    setIsPaymentModalOpen(false)
    setSelectedFile(null)
  }

  const handlePaymentUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPayment) return

    const updatedPayment: Payment = {
      ...editingPayment,
      paymentDate: paymentForm.paymentDate,
      dueDate: paymentForm.dueDate,
      amount: Number.parseFloat(paymentForm.amount),
      paymentMethod: paymentForm.paymentMethod || undefined,
      paymentReference: paymentForm.paymentReference || undefined,
      notes: paymentForm.notes || undefined,
      attachmentUrl: selectedFile ? URL.createObjectURL(selectedFile) : editingPayment.attachmentUrl,
      attachmentName: selectedFile?.name || editingPayment.attachmentName,
    }

    setPayments(payments.map((p) => (p.id === editingPayment.id ? updatedPayment : p)))
    setIsEditModalOpen(false)
    setEditingPayment(null)
    setSelectedFile(null)
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

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500 text-green-100 hover:bg-green-600">Paid</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const paidAmount = filteredPayments
    .filter((p) => p.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0)
  const pendingAmount = filteredPayments
    .filter((p) => p.status === "pending")
    .reduce((sum, payment) => sum + payment.amount, 0)
  const overdueAmount = filteredPayments
    .filter((p) => p.status === "overdue")
    .reduce((sum, payment) => sum + payment.amount, 0)

  // Get unique clients for filter
  const uniqueClients = Array.from(new Set(payments.map((p) => p.clientName)))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Tracking</h1>
          <p className="text-gray-600">Monitor and manage recurring payments for your clients</p>
        </div>
        <Button onClick={handleAddPayment}>
          <Plus className="h-4 w-4 mr-2" />
          Add Payment
        </Button>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Month</Label>
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value="2024-12">December 2024</SelectItem>
                  <SelectItem value="2025-01">January 2025</SelectItem>
                  <SelectItem value="2025-02">February 2025</SelectItem>
                  <SelectItem value="2025-03">March 2025</SelectItem>
                  <SelectItem value="2025-04">April 2025</SelectItem>
                  <SelectItem value="2025-05">May 2025</SelectItem>
                  <SelectItem value="2025-06">June 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Client</Label>
              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {uniqueClients.map((client) => (
                    <SelectItem key={client} value={client}>
                      {client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilterMonth("all")
                  setFilterStatus("all")
                  setFilterClient("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{filteredPayments.length} payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${paidAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredPayments.filter((p) => p.status === "paid").length} payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredPayments.filter((p) => p.status === "pending").length} payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${overdueAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredPayments.filter((p) => p.status === "overdue").length} payments
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Schedule</CardTitle>
          <CardDescription>
            Recurring payments with attachments and detailed tracking ({filteredPayments.length} of {payments.length}{" "}
            payments shown)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Attachment</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.clientName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{payment.subscriptionName}</span>
                      <Badge variant="outline" className="text-xs">
                        ${payment.amount.toFixed(2)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>{payment.paymentMethod || "-"}</TableCell>
                  <TableCell>{payment.paymentReference || "-"}</TableCell>
                  <TableCell>
                    {payment.attachmentName ? (
                      <Button variant="ghost" size="sm" onClick={() => window.open(payment.attachmentUrl, "_blank")}>
                        <Paperclip className="h-4 w-4 mr-1" />
                        {payment.attachmentName}
                      </Button>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="flex items-center justify-center">
                    {payment.invoiceNumber ? (
                      <Button variant="ghost" size="sm" onClick={() => handleInvoiceClick(payment)}>
                        <FileText className="h-4 w-4 mr-2" />
                        {payment.invoiceNumber}
                      </Button>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-row items-center">
                      <Button variant="ghost" size="sm" onClick={() => handleEditPayment(payment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Checkbox
                        checked={payment.status === "paid"}
                        onCheckedChange={(checked) => handlePaymentToggle(payment.id, checked as boolean)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Payment</DialogTitle>
            <DialogDescription>Create a new payment entry for a client subscription</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Subscription</Label>
                <Select
                  value={paymentForm.clientSubscriptionId}
                  onValueChange={(value) => {
                    const subscription = clientSubscriptions.find((cs) => cs.id === Number.parseInt(value))
                    setPaymentForm({
                      ...paymentForm,
                      clientSubscriptionId: value,
                      amount: subscription?.price.toString() || "",
                    })
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client subscription" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientSubscriptions.map((cs) => (
                      <SelectItem key={cs.id} value={cs.id.toString()}>
                        {cs.clientName} - {cs.subscriptionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={paymentForm.dueDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, dueDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={paymentForm.paymentMethod}
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Reference</Label>
                <Input
                  value={paymentForm.paymentReference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })}
                  placeholder="Transaction ID, Check number, etc."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Attachment (Receipt/Proof)</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              {selectedFile && (
                <p className="text-sm text-gray-600">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="Additional notes about this payment..."
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full">
              Add Payment
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
            <DialogDescription>Update payment details and attachments</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePaymentUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={paymentForm.paymentMethod}
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Reference</Label>
              <Input
                value={paymentForm.paymentReference}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })}
                placeholder="Transaction ID, Check number, etc."
              />
            </div>

            <div className="space-y-2">
              <Label>Update Attachment</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              {editingPayment?.attachmentName && !selectedFile && (
                <p className="text-sm text-gray-600">Current: {editingPayment.attachmentName}</p>
              )}
              {selectedFile && (
                <p className="text-sm text-gray-600">
                  New file: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="Additional notes about this payment..."
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full">
              Update Payment
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
    </div>
  )
}
