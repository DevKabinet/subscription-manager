"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const router = useRouter()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

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

  const generateNewInvoice = () => {
    router.push("/dashboard/invoices/generate")
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
    // In a real app, this would open a preview modal
    router.push(`/dashboard/invoices/preview/${invoice.id}`)
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const clientMatch = selectedClient === "all" || invoice.clientName === selectedClient
    const statusMatch = selectedStatus === "all" || invoice.status === selectedStatus
    return clientMatch && statusMatch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default">Paid</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Manage and download your invoices</p>
        </div>
        <Button onClick={generateNewInvoice}>
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
                  <TableCell>{invoice.subscriptionName}</TableCell>
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
    </div>
  )
}
