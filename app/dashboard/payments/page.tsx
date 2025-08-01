"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface PaymentHistoryEntry {
  status: string
  timestamp: string
  notes: string
}

interface Payment {
  id: string
  invoiceId: string
  invoiceNumber: string
  clientName: string
  amount: number
  currency: string
  paymentDate: string
  paymentMethod?: string
  transactionId?: string
  status: "completed" | "failed" | "refunded" | "pending"
  referenceNumber?: string
  fees: number
  notes?: string
  paymentGateway?: string
  statusHistory: PaymentHistoryEntry[]
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    // Simulate fetching data
    const fetchedPayments: Payment[] = [
      {
        id: "pay1",
        invoiceId: "inv1",
        invoiceNumber: "INV-2023-001",
        clientName: "Alice Smith",
        amount: 500.0,
        currency: "USD",
        paymentDate: "2023-01-01T10:30:00Z",
        paymentMethod: "Credit Card",
        transactionId: "TXN-001",
        status: "completed",
        fees: 15.0,
        notes: "Payment for Q1 Enterprise subscription.",
        paymentGateway: "Stripe",
        statusHistory: [
          { status: "pending", timestamp: "2023-01-01T10:00:00Z", notes: "Initial status" },
          { status: "completed", timestamp: "2023-01-01T10:30:00Z", notes: "Payment processed" },
        ],
      },
      {
        id: "pay2",
        invoiceId: "inv3",
        invoiceNumber: "INV-2023-003",
        clientName: "Charlie Brown",
        amount: 50.0,
        currency: "GBP",
        paymentDate: "2023-03-01T14:00:00Z",
        paymentMethod: "Bank Transfer",
        transactionId: "TXN-002",
        status: "completed",
        fees: 0.0,
        notes: "Annual basic plan payment.",
        paymentGateway: "PayPal",
        statusHistory: [
          { status: "pending", timestamp: "2023-03-01T13:00:00Z", notes: "Initial status" },
          { status: "completed", timestamp: "2023-03-01T14:00:00Z", notes: "Payment received" },
        ],
      },
      {
        id: "pay3",
        invoiceId: "inv2",
        invoiceNumber: "INV-2023-002",
        clientName: "Bob Johnson",
        amount: 100.0,
        currency: "USD",
        paymentDate: "2023-02-15T09:00:00Z",
        paymentMethod: "Credit Card",
        transactionId: "TXN-003",
        status: "pending",
        fees: 0.0,
        notes: "Monthly Pro plan payment.",
        paymentGateway: "Stripe",
        statusHistory: [{ status: "pending", timestamp: "2023-02-15T09:00:00Z", notes: "Initial status" }],
      },
      {
        id: "pay4",
        invoiceId: "inv4",
        invoiceNumber: "INV-2024-004",
        clientName: "Alice Smith",
        amount: 189.0,
        currency: "USD",
        paymentDate: "2024-07-01T11:00:00Z",
        paymentMethod: "Credit Card",
        transactionId: "TXN-004",
        status: "failed",
        fees: 0.0,
        notes: "Payment failed due to insufficient funds.",
        paymentGateway: "Stripe",
        statusHistory: [
          { status: "pending", timestamp: "2024-07-01T10:50:00Z", notes: "Initial status" },
          { status: "failed", timestamp: "2024-07-01T11:00:00Z", notes: "Payment failed" },
        ],
      },
    ]
    setPayments(fetchedPayments)
  }, [])

  const filteredPayments = payments.filter(
    (payment) =>
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddOrEditPayment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const newStatus = formData.get("status") as Payment["status"]
    const currentStatusHistory = isEditing && currentPayment ? [...currentPayment.statusHistory] : []

    if (isEditing && currentPayment && newStatus !== currentPayment.status) {
      currentStatusHistory.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        notes: `Status changed to ${newStatus}`,
      })
    } else if (!isEditing) {
      currentStatusHistory.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        notes: "Initial status",
      })
    }

    const newOrUpdatedPayment: Payment = {
      id: isEditing && currentPayment ? currentPayment.id : `pay${Date.now()}`, // Simple ID generation
      invoiceId: formData.get("invoiceId") as string,
      invoiceNumber: formData.get("invoiceNumber") as string,
      clientName: formData.get("clientName") as string,
      amount: Number.parseFloat(formData.get("amount") as string),
      currency: formData.get("currency") as string,
      paymentDate: paymentDate ? paymentDate.toISOString() : new Date().toISOString(),
      paymentMethod: formData.get("paymentMethod") as string,
      transactionId: formData.get("transactionId") as string,
      status: newStatus,
      referenceNumber: formData.get("referenceNumber") as string,
      fees: Number.parseFloat(formData.get("fees") as string) || 0,
      notes: formData.get("notes") as string,
      paymentGateway: formData.get("paymentGateway") as string,
      statusHistory: currentStatusHistory,
    }

    if (isEditing) {
      setPayments(payments.map((pay) => (pay.id === newOrUpdatedPayment.id ? newOrUpdatedPayment : pay)))
    } else {
      setPayments([...payments, newOrUpdatedPayment])
    }
    setIsModalOpen(false)
    resetFormState()
  }

  const handleDeletePayment = (id: string) => {
    setPayments(payments.filter((payment) => payment.id !== id))
  }

  const openAddModal = () => {
    setCurrentPayment(null)
    setIsEditing(false)
    resetFormState()
    setIsModalOpen(true)
  }

  const openEditModal = (payment: Payment) => {
    setCurrentPayment(payment)
    setIsEditing(true)
    setPaymentDate(payment.paymentDate ? new Date(payment.paymentDate) : undefined)
    setIsModalOpen(true)
  }

  const openViewModal = (payment: Payment) => {
    setCurrentPayment(payment)
    setIsViewModalOpen(true)
  }

  const resetFormState = () => {
    setPaymentDate(undefined)
  }

  const getStatusBadgeColor = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" /> Record Payment
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search payments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-4 py-2 border rounded-md w-full"
        />
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden md:table-cell">Payment Date</TableHead>
              <TableHead className="hidden sm:table-cell">Method</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.invoiceNumber}</TableCell>
                <TableCell>{payment.clientName}</TableCell>
                <TableCell>
                  {payment.currency} {payment.amount.toFixed(2)}
                </TableCell>
                <TableCell className="hidden md:table-cell">{format(new Date(payment.paymentDate), "PPP")}</TableCell>
                <TableCell className="hidden sm:table-cell">{payment.paymentMethod || "N/A"}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className={getStatusBadgeColor(payment.status)}>{payment.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openViewModal(payment)} className="mr-1">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(payment)} className="mr-1">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeletePayment(payment.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredPayments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No payments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Payment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Payment" : "Record New Payment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddOrEditPayment} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invoiceNumber" className="text-right">
                Invoice #
              </Label>
              <Input
                id="invoiceNumber"
                name="invoiceNumber"
                defaultValue={currentPayment?.invoiceNumber || ""}
                className="col-span-3"
                required
              />
              <input type="hidden" name="invoiceId" defaultValue={currentPayment?.invoiceId || "new-invoice-id"} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientName" className="text-right">
                Client Name
              </Label>
              <Input
                id="clientName"
                name="clientName"
                defaultValue={currentPayment?.clientName || ""}
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
                defaultValue={currentPayment?.amount || ""}
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
                defaultValue={currentPayment?.currency || "USD"}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentDate" className="text-right">
                Payment Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !paymentDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {paymentDate ? format(paymentDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={paymentDate} onSelect={setPaymentDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentMethod" className="text-right">
                Payment Method
              </Label>
              <Input
                id="paymentMethod"
                name="paymentMethod"
                defaultValue={currentPayment?.paymentMethod || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="transactionId" className="text-right">
                Transaction ID
              </Label>
              <Input
                id="transactionId"
                name="transactionId"
                defaultValue={currentPayment?.transactionId || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <select
                id="status"
                name="status"
                defaultValue={currentPayment?.status || "pending"}
                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="referenceNumber" className="text-right">
                Reference Number
              </Label>
              <Input
                id="referenceNumber"
                name="referenceNumber"
                defaultValue={currentPayment?.referenceNumber || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fees" className="text-right">
                Fees
              </Label>
              <Input
                id="fees"
                name="fees"
                type="number"
                step="0.01"
                defaultValue={currentPayment?.fees || 0}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentGateway" className="text-right">
                Payment Gateway
              </Label>
              <Input
                id="paymentGateway"
                name="paymentGateway"
                defaultValue={currentPayment?.paymentGateway || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input id="notes" name="notes" defaultValue={currentPayment?.notes || ""} className="col-span-3" />
            </div>
            <DialogFooter>
              <Button type="submit">{isEditing ? "Save Changes" : "Record Payment"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Payment Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {currentPayment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Invoice #:</span>
                <span>{currentPayment.invoiceNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Client Name:</span>
                <span>{currentPayment.clientName}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Amount:</span>
                <span>
                  {currentPayment.currency} {currentPayment.amount.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Payment Date:</span>
                <span>{format(new Date(currentPayment.paymentDate), "PPP p")}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Payment Method:</span>
                <span>{currentPayment.paymentMethod || "N/A"}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Transaction ID:</span>
                <span>{currentPayment.transactionId || "N/A"}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Status:</span>
                <span>
                  <Badge className={getStatusBadgeColor(currentPayment.status)}>{currentPayment.status}</Badge>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Reference Number:</span>
                <span>{currentPayment.referenceNumber || "N/A"}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Fees:</span>
                <span>
                  {currentPayment.currency} {currentPayment.fees.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Payment Gateway:</span>
                <span>{currentPayment.paymentGateway || "N/A"}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Notes:</span>
                <span>{currentPayment.notes || "N/A"}</span>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Status History:</h4>
                {currentPayment.statusHistory.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm">
                    {currentPayment.statusHistory.map((entry, index) => (
                      <li key={index}>
                        <span className="font-medium capitalize">{entry.status}</span> on{" "}
                        {format(new Date(entry.timestamp), "PPP p")} - {entry.notes}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No status history available.</p>
                )}
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
