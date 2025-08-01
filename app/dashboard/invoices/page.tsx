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
import Link from "next/link"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  clientName: string
  issueDate: string
  dueDate: string
  totalAmount: number
  currency: string
  status: "pending" | "paid" | "overdue" | "draft"
  subtotal: number
  taxRate: number
  discountAmount: number
  items: InvoiceItem[]
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [issueDate, setIssueDate] = useState<Date | undefined>(undefined)
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])

  useEffect(() => {
    // Simulate fetching data
    const fetchedInvoices: Invoice[] = [
      {
        id: "inv1",
        invoiceNumber: "INV-2023-001",
        clientId: "client1",
        clientName: "Alice Smith",
        issueDate: "2023-01-01",
        dueDate: "2023-01-31",
        totalAmount: 500.0,
        currency: "USD",
        status: "paid",
        subtotal: 500.0,
        taxRate: 0.0,
        discountAmount: 0.0,
        items: [
          { id: "item1", description: "Enterprise Plan Subscription", quantity: 1, unitPrice: 500.0, total: 500.0 },
        ],
      },
      {
        id: "inv2",
        invoiceNumber: "INV-2023-002",
        clientId: "client2",
        clientName: "Bob Johnson",
        issueDate: "2023-02-15",
        dueDate: "2023-03-15",
        totalAmount: 100.0,
        currency: "USD",
        status: "pending",
        subtotal: 100.0,
        taxRate: 0.0,
        discountAmount: 0.0,
        items: [{ id: "item2", description: "Pro Plan Subscription", quantity: 1, unitPrice: 100.0, total: 100.0 }],
      },
      {
        id: "inv3",
        invoiceNumber: "INV-2023-003",
        clientId: "client3",
        clientName: "Charlie Brown",
        issueDate: "2023-03-01",
        dueDate: "2024-03-01",
        totalAmount: 50.0,
        currency: "GBP",
        status: "paid",
        subtotal: 50.0,
        taxRate: 0.0,
        discountAmount: 0.0,
        items: [
          { id: "item3", description: "Basic Plan Annual Subscription", quantity: 1, unitPrice: 50.0, total: 50.0 },
        ],
      },
      {
        id: "inv4",
        invoiceNumber: "INV-2024-004",
        clientId: "client1",
        clientName: "Alice Smith",
        issueDate: "2024-07-01",
        dueDate: "2024-07-31",
        totalAmount: 189.0,
        currency: "USD",
        status: "overdue",
        subtotal: 175.0,
        taxRate: 0.08,
        discountAmount: 0.0,
        items: [
          { id: "item4a", description: "Monthly Subscription Fee", quantity: 1, unitPrice: 100.0, total: 100.0 },
          { id: "item4b", description: "Premium Support (July)", quantity: 1, unitPrice: 25.0, total: 25.0 },
          { id: "item4c", description: "Additional User Licenses", quantity: 5, unitPrice: 10.0, total: 50.0 },
        ],
      },
    ]
    setInvoices(fetchedInvoices)
  }, [])

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const calculateTotals = (items: InvoiceItem[], taxRate: number, discountAmount: number) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const taxAmount = subtotal * taxRate
    const totalAmount = subtotal + taxAmount - discountAmount
    return { subtotal, taxAmount, totalAmount }
  }

  const handleAddItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      { id: String(invoiceItems.length + 1), description: "", quantity: 1, unitPrice: 0, total: 0 },
    ])
  }

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = invoiceItems.map((item, i) => {
      if (i === index) {
        const newItem = { ...item, [field]: value }
        if (field === "quantity" || field === "unitPrice") {
          newItem.total = newItem.quantity * newItem.unitPrice
        }
        return newItem
      }
      return item
    })
    setInvoiceItems(updatedItems)
  }

  const handleRemoveItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index))
  }

  const handleAddOrEditInvoice = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const taxRate = Number.parseFloat(formData.get("taxRate") as string) || 0
    const discountAmount = Number.parseFloat(formData.get("discountAmount") as string) || 0
    const { subtotal, totalAmount } = calculateTotals(invoiceItems, taxRate, discountAmount)

    const newOrUpdatedInvoice: Invoice = {
      id: isEditing && currentInvoice ? currentInvoice.id : `inv${Date.now()}`, // Simple ID generation
      invoiceNumber: formData.get("invoiceNumber") as string,
      clientId: formData.get("clientId") as string, // In a real app, this would link to an actual client
      clientName: formData.get("clientName") as string,
      issueDate: issueDate ? format(issueDate, "yyyy-MM-dd") : "",
      dueDate: dueDate ? format(dueDate, "yyyy-MM-dd") : "",
      totalAmount: totalAmount,
      currency: formData.get("currency") as string,
      status: formData.get("status") as Invoice["status"],
      subtotal: subtotal,
      taxRate: taxRate,
      discountAmount: discountAmount,
      items: invoiceItems,
    }

    if (isEditing) {
      setInvoices(invoices.map((inv) => (inv.id === newOrUpdatedInvoice.id ? newOrUpdatedInvoice : inv)))
    } else {
      setInvoices([...invoices, newOrUpdatedInvoice])
    }
    setIsModalOpen(false)
    resetFormState()
  }

  const handleDeleteInvoice = (id: string) => {
    setInvoices(invoices.filter((invoice) => invoice.id !== id))
  }

  const openAddModal = () => {
    setCurrentInvoice(null)
    setIsEditing(false)
    resetFormState()
    setIsModalOpen(true)
  }

  const openEditModal = (invoice: Invoice) => {
    setCurrentInvoice(invoice)
    setIsEditing(true)
    setIssueDate(invoice.issueDate ? new Date(invoice.issueDate) : undefined)
    setDueDate(invoice.dueDate ? new Date(invoice.dueDate) : undefined)
    setInvoiceItems(invoice.items || [])
    setIsModalOpen(true)
  }

  const resetFormState = () => {
    setIssueDate(undefined)
    setDueDate(undefined)
    setInvoiceItems([])
  }

  const getStatusBadgeColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const currentSubtotal = calculateTotals(
    invoiceItems,
    Number.parseFloat(currentInvoice?.taxRate.toString() || "0"),
    Number.parseFloat(currentInvoice?.discountAmount.toString() || "0"),
  ).subtotal
  const currentTaxAmount = currentSubtotal * Number.parseFloat(currentInvoice?.taxRate.toString() || "0")
  const currentTotalAmount =
    currentSubtotal + currentTaxAmount - Number.parseFloat(currentInvoice?.discountAmount.toString() || "0")

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search invoices..."
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
              <TableHead className="hidden md:table-cell">Issue Date</TableHead>
              <TableHead className="hidden md:table-cell">Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.clientName}</TableCell>
                <TableCell className="hidden md:table-cell">{invoice.issueDate}</TableCell>
                <TableCell className="hidden md:table-cell">{invoice.dueDate}</TableCell>
                <TableCell>
                  {invoice.currency} {invoice.totalAmount.toFixed(2)}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className={getStatusBadgeColor(invoice.status)}>{invoice.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/invoices/preview/${invoice.id}`} passHref>
                    <Button variant="ghost" size="sm" className="mr-1">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(invoice)} className="mr-1">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteInvoice(invoice.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredInvoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Invoice Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Invoice" : "Create New Invoice"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddOrEditInvoice} className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  name="invoiceNumber"
                  defaultValue={currentInvoice?.invoiceNumber || `INV-${Date.now().toString().substring(7)}`}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input id="clientName" name="clientName" defaultValue={currentInvoice?.clientName || ""} required />
                <input type="hidden" name="clientId" defaultValue={currentInvoice?.clientId || "new-client-id"} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !issueDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {issueDate ? format(issueDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={issueDate} onSelect={setIssueDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" name="currency" defaultValue={currentInvoice?.currency || "USD"} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={currentInvoice?.status || "pending"}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-4">Invoice Items</h3>
            {invoiceItems.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end border-b pb-2">
                <div className="md:col-span-2 grid gap-1">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Input
                    id={`description-${index}`}
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor={`quantity-${index}`}>Qty</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", Number.parseInt(e.target.value))}
                    required
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor={`unitPrice-${index}`}>Unit Price</Label>
                  <Input
                    id={`unitPrice-${index}`}
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, "unitPrice", Number.parseFloat(e.target.value))}
                    required
                  />
                </div>
                <div className="grid gap-1">
                  <Label>Total</Label>
                  <Input value={item.total.toFixed(2)} readOnly className="bg-gray-100" />
                </div>
                <Button variant="destructive" size="icon" onClick={() => handleRemoveItem(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddItem} className="mt-2 bg-transparent">
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  name="taxRate"
                  type="number"
                  step="0.01"
                  defaultValue={currentInvoice?.taxRate * 100 || 0}
                  onChange={(e) => {
                    const newTaxRate = Number.parseFloat(e.target.value) / 100 || 0
                    setCurrentInvoice((prev) => (prev ? { ...prev, taxRate: newTaxRate } : null))
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discountAmount">Discount Amount</Label>
                <Input
                  id="discountAmount"
                  name="discountAmount"
                  type="number"
                  step="0.01"
                  defaultValue={currentInvoice?.discountAmount || 0}
                  onChange={(e) => {
                    const newDiscount = Number.parseFloat(e.target.value) || 0
                    setCurrentInvoice((prev) => (prev ? { ...prev, discountAmount: newDiscount } : null))
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Subtotal:</span>
                  <span>
                    {currentInvoice?.currency || "USD"} {currentSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Tax:</span>
                  <span>
                    {currentInvoice?.currency || "USD"} {currentTaxAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Discount:</span>
                  <span>
                    {currentInvoice?.currency || "USD"} {currentInvoice?.discountAmount.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>
                    {currentInvoice?.currency || "USD"} {currentTotalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="submit">{isEditing ? "Save Changes" : "Create Invoice"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
