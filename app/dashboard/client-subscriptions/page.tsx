"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import jsPDF from "jspdf"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface Client {
  id: string
  name: string
  email: string
}

interface Subscription {
  id: string
  clientId: string
  planName: string
  amount: number
  currency: string
  billingCycle: "monthly" | "annually" | "quarterly"
  startDate: string
  endDate?: string
  nextBillingDate?: string
  status: "active" | "cancelled" | "paused" | "trialing" | "expired"
  autoRenew: boolean
  cancellationDate?: string
  cancellationReason?: string
  paymentMethodDetails?: string
}

interface ClientSubscription extends Client {
  subscriptions: Subscription[]
}

export default function ClientSubscriptionsPage() {
  const [clientSubscriptions, setClientSubscriptions] = useState<ClientSubscription[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentClientSubscription, setCurrentClientSubscription] = useState<ClientSubscription | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [nextBillingDate, setNextBillingDate] = useState<Date | undefined>(undefined)
  const [cancellationDate, setCancellationDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    // Simulate fetching data
    const fetchedData: ClientSubscription[] = [
      {
        id: "client1",
        name: "Alice Smith",
        email: "alice@example.com",
        subscriptions: [
          {
            id: "sub1",
            clientId: "client1",
            planName: "Premium Monthly",
            amount: 99.99,
            currency: "USD",
            billingCycle: "monthly",
            startDate: "2023-01-01",
            nextBillingDate: "2024-08-01",
            status: "active",
            autoRenew: true,
          },
          {
            id: "sub4",
            clientId: "client1",
            planName: "Trial Plan",
            amount: 0.0,
            currency: "USD",
            billingCycle: "monthly",
            startDate: "2024-07-10",
            endDate: "2024-07-24",
            status: "trialing",
            autoRenew: true,
          },
        ],
      },
      {
        id: "client2",
        name: "Bob Johnson",
        email: "bob@example.com",
        subscriptions: [
          {
            id: "sub2",
            clientId: "client2",
            planName: "Annual Pro",
            amount: 999.0,
            currency: "USD",
            billingCycle: "annually",
            startDate: "2023-03-15",
            endDate: "2024-03-14",
            nextBillingDate: "2025-03-15",
            status: "active",
            autoRenew: true,
          },
        ],
      },
      {
        id: "client3",
        name: "Charlie Brown",
        email: "charlie@example.com",
        subscriptions: [
          {
            id: "sub3",
            clientId: "client3",
            planName: "Basic Monthly",
            amount: 29.99,
            currency: "USD",
            billingCycle: "monthly",
            startDate: "2023-05-01",
            cancellationDate: "2024-06-30",
            cancellationReason: "Budget cuts",
            status: "cancelled",
            autoRenew: false,
          },
        ],
      },
    ]
    setClientSubscriptions(fetchedData)
  }, [])

  const filteredClientSubscriptions = clientSubscriptions.filter(
    (cs) =>
      cs.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cs.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cs.subscriptions.some((sub) => sub.planName.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleAddOrEditSubscription = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const newOrUpdatedSubscription: Subscription = {
      id: isEditing && currentClientSubscription ? (formData.get("subscriptionId") as string) : String(Date.now()), // Simple ID generation
      clientId: currentClientSubscription?.id || (formData.get("clientId") as string),
      planName: formData.get("planName") as string,
      amount: Number.parseFloat(formData.get("amount") as string),
      currency: formData.get("currency") as string,
      billingCycle: formData.get("billingCycle") as Subscription["billingCycle"],
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : "",
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      nextBillingDate: nextBillingDate ? format(nextBillingDate, "yyyy-MM-dd") : undefined,
      status: formData.get("status") as Subscription["status"],
      autoRenew: formData.get("autoRenew") === "on",
      cancellationDate: cancellationDate ? format(cancellationDate, "yyyy-MM-dd") : undefined,
      cancellationReason: formData.get("cancellationReason") as string,
      paymentMethodDetails: formData.get("paymentMethodDetails") as string,
    }

    setClientSubscriptions((prev) =>
      prev.map((client) => {
        if (client.id === newOrUpdatedSubscription.clientId) {
          const existingSubIndex = client.subscriptions.findIndex((sub) => sub.id === newOrUpdatedSubscription.id)
          if (existingSubIndex !== -1) {
            // Edit existing subscription
            client.subscriptions[existingSubIndex] = newOrUpdatedSubscription
          } else {
            // Add new subscription to this client
            client.subscriptions.push(newOrUpdatedSubscription)
          }
        }
        return client
      }),
    )

    setIsModalOpen(false)
    resetFormState()
  }

  const handleDeleteSubscription = (clientId: string, subscriptionId: string) => {
    setClientSubscriptions((prev) =>
      prev.map((client) => {
        if (client.id === clientId) {
          client.subscriptions = client.subscriptions.filter((sub) => sub.id !== subscriptionId)
        }
        return client
      }),
    )
  }

  const openAddSubscriptionModal = (client: ClientSubscription) => {
    setCurrentClientSubscription(client)
    setIsEditing(false)
    resetFormState()
    setIsModalOpen(true)
  }

  const openEditSubscriptionModal = (client: ClientSubscription, sub: Subscription) => {
    setCurrentClientSubscription({ ...client, subscriptions: [sub] }) // Temporarily store the specific sub for editing
    setIsEditing(true)
    setStartDate(sub.startDate ? new Date(sub.startDate) : undefined)
    setEndDate(sub.endDate ? new Date(sub.endDate) : undefined)
    setNextBillingDate(sub.nextBillingDate ? new Date(sub.nextBillingDate) : undefined)
    setCancellationDate(sub.cancellationDate ? new Date(sub.cancellationDate) : undefined)
    setIsModalOpen(true)
  }

  const openViewClientSubscriptionsModal = (client: ClientSubscription) => {
    setCurrentClientSubscription(client)
    setIsViewModalOpen(true)
  }

  const resetFormState = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setNextBillingDate(undefined)
    setCancellationDate(undefined)
  }

  const getStatusBadgeColor = (status: Subscription["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "trialing":
        return "bg-blue-100 text-blue-800"
      case "expired":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const generateInvoice = (clientSubscription: Subscription) => {
    const client = clientSubscriptions.find((c) => c.id === clientSubscription.clientId)
    if (!client) return

    const doc = new jsPDF()
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

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
    doc.text(`${clientSubscription.planName} - Subscription Setup`, 20, 145)
    doc.text(`$${clientSubscription.amount.toFixed(2)}`, 150, 145)

    // Total
    doc.line(20, 155, 190, 155)
    doc.setFont("helvetica", "bold")
    doc.text("Total:", 130, 165)
    doc.text(`$${clientSubscription.amount.toFixed(2)}`, 150, 165)

    // Payment instructions
    doc.setFont("helvetica", "bold")
    doc.text("Payment Instructions:", 20, 190)

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

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Client Subscriptions</h1>
        {/* Add Client button if needed, or focus on adding subscriptions to existing clients */}
      </div>

      <div className="relative mb-6">
        <Eye className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search clients or plans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-4 py-2 border rounded-md w-full"
        />
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Total Subscriptions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClientSubscriptions.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell className="text-right">{client.subscriptions.length}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openViewClientSubscriptionsModal(client)}
                    className="mr-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View Subscriptions</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openAddSubscriptionModal(client)}>
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add Subscription</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredClientSubscriptions.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No clients with subscriptions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Subscription Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Subscription" : `Add New Subscription for ${currentClientSubscription?.name}`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddOrEditSubscription} className="grid gap-4 py-4">
            {isEditing && currentClientSubscription?.subscriptions[0]?.id && (
              <input type="hidden" name="subscriptionId" value={currentClientSubscription.subscriptions[0].id} />
            )}
            <input type="hidden" name="clientId" value={currentClientSubscription?.id} />
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="planName" className="text-right">
                Plan Name
              </Label>
              <Input
                id="planName"
                name="planName"
                defaultValue={currentClientSubscription?.subscriptions[0]?.planName || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                defaultValue={currentClientSubscription?.subscriptions[0]?.amount || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currency" className="text-right">
                Currency
              </Label>
              <Input
                id="currency"
                name="currency"
                defaultValue={currentClientSubscription?.subscriptions[0]?.currency || "USD"}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="billingCycle" className="text-right">
                Billing Cycle
              </Label>
              <select
                id="billingCycle"
                name="billingCycle"
                defaultValue={currentClientSubscription?.subscriptions[0]?.billingCycle || "monthly"}
                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nextBillingDate" className="text-right">
                Next Billing Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !nextBillingDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {nextBillingDate ? format(nextBillingDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={nextBillingDate} onSelect={setNextBillingDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <select
                id="status"
                name="status"
                defaultValue={currentClientSubscription?.subscriptions[0]?.status || "active"}
                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="paused">Paused</option>
                <option value="trialing">Trialing</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="autoRenew" className="text-right">
                Auto Renew
              </Label>
              <input
                id="autoRenew"
                name="autoRenew"
                type="checkbox"
                defaultChecked={currentClientSubscription?.subscriptions[0]?.autoRenew || true}
                className="col-span-3 h-4 w-4"
              />
            </div>
            {(currentClientSubscription?.subscriptions[0]?.status === "cancelled" ||
              currentClientSubscription?.subscriptions[0]?.status === "expired") && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cancellationDate" className="text-right">
                    Cancellation Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "col-span-3 justify-start text-left font-normal",
                          !cancellationDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {cancellationDate ? format(cancellationDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={cancellationDate} onSelect={setCancellationDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cancellationReason" className="text-right">
                    Cancellation Reason
                  </Label>
                  <Input
                    id="cancellationReason"
                    name="cancellationReason"
                    defaultValue={currentClientSubscription?.subscriptions[0]?.cancellationReason || ""}
                    className="col-span-3"
                  />
                </div>
              </>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentMethodDetails" className="text-right">
                Payment Method Details
              </Label>
              <Input
                id="paymentMethodDetails"
                name="paymentMethodDetails"
                defaultValue={currentClientSubscription?.subscriptions[0]?.paymentMethodDetails || ""}
                className="col-span-3"
              />
            </div>
            <DialogFooter>
              <Button type="submit">{isEditing ? "Save Changes" : "Add Subscription"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Client Subscriptions Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscriptions for {currentClientSubscription?.name}</DialogTitle>
          </DialogHeader>
          {currentClientSubscription && (
            <div className="py-4">
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Billing Cycle</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Billing</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentClientSubscription.subscriptions.length > 0 ? (
                      currentClientSubscription.subscriptions.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">{sub.planName}</TableCell>
                          <TableCell>
                            {sub.currency} {sub.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="capitalize">{sub.billingCycle}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeColor(sub.status)}>{sub.status}</Badge>
                          </TableCell>
                          <TableCell>{sub.nextBillingDate || "N/A"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditSubscriptionModal(currentClientSubscription, sub)}
                              className="mr-1"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSubscription(currentClientSubscription.id, sub.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No subscriptions for this client.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
