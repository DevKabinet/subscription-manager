"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Unlink, Edit } from "lucide-react"
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
  billingCycle: string
}

interface ClientSubscription {
  id: number
  clientId: number
  subscriptionId: number
  clientName: string
  subscriptionName: string
  price: number
  startDate: string
  endDate?: string
  status: "active" | "paused" | "cancelled" | "expired"
  invoiceNumber?: string
}

export default function ClientSubscriptionsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [clientSubscriptions, setClientSubscriptions] = useState<ClientSubscription[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<ClientSubscription | null>(null)
  const [formData, setFormData] = useState({
    clientId: "",
    subscriptionId: "",
    startDate: new Date().toISOString().split("T")[0],
  })
  const [statusForm, setStatusForm] = useState({
    status: "active" as ClientSubscription["status"],
    endDate: "",
  })

  useEffect(() => {
    // Load clients
    setClients([
      { id: 1, name: "John Doe", email: "john@example.com", address: "456 Client Ave, City, State 12345" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", address: "789 Customer Blvd, City, State 12345" },
      { id: 3, name: "Alice Johnson", email: "alice@example.com", address: "321 Business St, City, State 12345" },
      { id: 4, name: "Bob Wilson", email: "bob@example.com", address: "654 Commerce Ave, City, State 12345" },
    ])

    // Load subscriptions
    setSubscriptions([
      { id: 1, name: "Basic Plan", price: 29.99, billingCycle: "monthly" },
      { id: 2, name: "Premium Plan", price: 59.99, billingCycle: "monthly" },
      { id: 3, name: "Enterprise Plan", price: 99.99, billingCycle: "monthly" },
    ])

    // Load existing client subscriptions
    setClientSubscriptions([
      {
        id: 1,
        clientId: 1,
        subscriptionId: 1,
        clientName: "John Doe",
        subscriptionName: "Basic Plan",
        price: 29.99,
        startDate: "2024-01-01",
        status: "active",
        invoiceNumber: "INV-2024-001",
      },
      {
        id: 2,
        clientId: 2,
        subscriptionId: 2,
        clientName: "Jane Smith",
        subscriptionName: "Premium Plan",
        price: 59.99,
        startDate: "2024-01-05",
        status: "cancelled",
        endDate: "2024-02-05",
        invoiceNumber: "INV-2024-002",
      },
      {
        id: 3,
        clientId: 3,
        subscriptionId: 1,
        clientName: "Alice Johnson",
        subscriptionName: "Basic Plan",
        price: 29.99,
        startDate: "2024-01-10",
        status: "paused",
        invoiceNumber: "INV-2024-003",
      },
    ])
  }, [])

  const generateInvoice = (clientSubscription: ClientSubscription) => {
    const client = clients.find((c) => c.id === clientSubscription.clientId)
    if (!client) return

    const doc = new jsPDF()
    const invoiceNumber =
      clientSubscription.invoiceNumber || `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

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
    doc.text(`#${invoiceNumber}`, 150, 40)

    // Client information
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Bill To:", 20, 80)

    doc.setFont("helvetica", "normal")
    doc.text(client.name, 20, 90)
    doc.text(client.email, 20, 95)
    const clientAddressLines = client.address.split("\n")
    clientAddressLines.forEach((line, index) => {
      doc.text(line, 20, 100 + index * 5)
    })

    // Invoice details
    doc.setFont("helvetica", "bold")
    doc.text("Invoice Details:", 120, 80)

    doc.setFont("helvetica", "normal")
    doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 120, 90)
    doc.text(`Subscription Start: ${new Date(clientSubscription.startDate).toLocaleDateString()}`, 120, 95)

    // Table header
    doc.setFont("helvetica", "bold")
    doc.text("Description", 20, 130)
    doc.text("Amount", 150, 130)

    // Draw line under header
    doc.line(20, 135, 190, 135)

    // Table content
    doc.setFont("helvetica", "normal")
    doc.text(`${clientSubscription.subscriptionName} - Subscription Setup`, 20, 145)
    doc.text(`$${clientSubscription.price.toFixed(2)}`, 150, 145)

    // Total
    doc.line(20, 155, 190, 155)
    doc.setFont("helvetica", "bold")
    doc.text("Total:", 130, 165)
    doc.text(`$${clientSubscription.price.toFixed(2)}`, 150, 165)

    // Payment instructions
    doc.setFont("helvetica", "bold")
    doc.text("Payment Instructions:", 20, 190)

    doc.setFont("helvetica", "normal")
    const paymentText =
      "Thank you for subscribing! This invoice covers your subscription setup. Future payments will be processed according to your billing cycle."
    const splitText = doc.splitTextToSize(paymentText, 170)
    doc.text(splitText, 20, 200)

    // Footer
    doc.setFont("helvetica", "italic")
    doc.text("Thank you for your business!", 105, 250, { align: "center" })

    // Save the PDF
    doc.save(`${invoiceNumber}.pdf`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedClient = clients.find((c) => c.id === Number.parseInt(formData.clientId))
    const selectedSubscription = subscriptions.find((s) => s.id === Number.parseInt(formData.subscriptionId))

    if (!selectedClient || !selectedSubscription) return

    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

    const newClientSubscription: ClientSubscription = {
      id: Date.now(),
      clientId: selectedClient.id,
      subscriptionId: selectedSubscription.id,
      clientName: selectedClient.name,
      subscriptionName: selectedSubscription.name,
      price: selectedSubscription.price,
      startDate: formData.startDate,
      status: "active",
      invoiceNumber,
    }

    setClientSubscriptions([...clientSubscriptions, newClientSubscription])

    // Add invoice to the invoice list (simulate adding to database)
    const newInvoice = {
      id: Date.now(),
      invoiceNumber,
      clientName: selectedClient.name,
      subscriptionName: selectedSubscription.name,
      amount: selectedSubscription.price,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: "", // No due date for setup invoices
      status: "pending" as const,
      isSetupInvoice: true,
    }

    // Store in localStorage to simulate database
    const existingInvoices = JSON.parse(localStorage.getItem("invoices") || "[]")
    localStorage.setItem("invoices", JSON.stringify([...existingInvoices, newInvoice]))

    setFormData({
      clientId: "",
      subscriptionId: "",
      startDate: new Date().toISOString().split("T")[0],
    })
    setIsDialogOpen(false)

    // Show success message
    alert(`Client subscription created! Invoice ${invoiceNumber} has been added to your invoice list.`)
  }

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSubscription) return

    const updatedSubscription = {
      ...editingSubscription,
      status: statusForm.status,
      endDate: statusForm.endDate || undefined,
    }

    setClientSubscriptions(
      clientSubscriptions.map((cs) => (cs.id === editingSubscription.id ? updatedSubscription : cs)),
    )

    setIsStatusDialogOpen(false)
    setEditingSubscription(null)
    setStatusForm({ status: "active", endDate: "" })
  }

  const handleUnlink = (id: number) => {
    setClientSubscriptions(clientSubscriptions.filter((cs) => cs.id !== id))
  }

  const handleAddNew = () => {
    setFormData({
      clientId: "",
      subscriptionId: "",
      startDate: new Date().toISOString().split("T")[0],
    })
    setIsDialogOpen(true)
  }

  const handleEditStatus = (subscription: ClientSubscription) => {
    setEditingSubscription(subscription)
    setStatusForm({
      status: subscription.status,
      endDate: subscription.endDate || "",
    })
    setIsStatusDialogOpen(true)
  }

  const getStatusBadge = (status: ClientSubscription["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 text-green-100 hover:bg-green-600">Active</Badge>
      case "paused":
        return <Badge variant="secondary">Paused</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      case "expired":
        return <Badge variant="outline">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Subscriptions</h1>
          <p className="text-gray-600">Link clients to subscriptions and manage their plans</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Link Client to Subscription
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link Client to Subscription</DialogTitle>
              <DialogDescription>
                Connect a client to a subscription plan. An invoice will be created and added to your invoice list.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                        {subscription.name} - ${subscription.price.toFixed(2)}/{subscription.billingCycle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Link & Create Invoice
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Subscription Status</DialogTitle>
            <DialogDescription>
              Change the status of {editingSubscription?.clientName}'s {editingSubscription?.subscriptionName}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStatusUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={statusForm.status}
                onValueChange={(value) =>
                  setStatusForm({ ...statusForm, status: value as ClientSubscription["status"] })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(statusForm.status === "cancelled" || statusForm.status === "expired") && (
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={statusForm.endDate}
                  onChange={(e) => setStatusForm({ ...statusForm, endDate: e.target.value })}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full">
              Update Status
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Client Subscriptions</CardTitle>
          <CardDescription>Manage client subscription relationships and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientSubscriptions.map((cs) => (
                <TableRow key={cs.id}>
                  <TableCell className="font-medium">{cs.clientName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{cs.subscriptionName}</span>
                      <Badge variant="outline" className="text-xs">
                        ${cs.price.toFixed(2)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>${cs.price.toFixed(2)}</TableCell>
                  <TableCell>{new Date(cs.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{cs.endDate ? new Date(cs.endDate).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{getStatusBadge(cs.status)}</TableCell>
                  <TableCell>
                    {cs.invoiceNumber && (
                      <Button variant="ghost" size="sm" onClick={() => generateInvoice(cs)}>
                        <FileText className="h-4 w-4 mr-2" />
                        {cs.invoiceNumber}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditStatus(cs)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleUnlink(cs.id)}>
                        <Unlink className="h-4 w-4" />
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
