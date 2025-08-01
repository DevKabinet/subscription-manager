"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { PlusCircle, Search, Edit, Trash2, Eye } from "lucide-react"
import { getInvoices, createInvoice, updateInvoice, deleteInvoice } from "@/lib/invoices"
import { getClients } from "@/lib/clients"
import { getSubscriptions } from "@/lib/subscriptions"
import type { Invoice, Client, Subscription } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import Link from "next/link"

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [invoicesData, clientsData, subscriptionsData] = await Promise.all([
        getInvoices(),
        getClients(),
        getSubscriptions(),
      ])
      setInvoices(invoicesData)
      setClients(clientsData)
      setSubscriptions(subscriptionsData)
    } catch (err) {
      setError("Failed to fetch data.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddInvoice = () => {
    setCurrentInvoice(null)
    setIsModalOpen(true)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice)
    setIsModalOpen(true)
  }

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteInvoice(id)
        toast({
          title: "Invoice Deleted",
          description: "The invoice has been successfully deleted.",
        })
        fetchData()
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete invoice.",
          variant: "destructive",
        })
        console.error(err)
      }
    }
  }

  const handleSaveInvoice = async (formData: FormData) => {
    const clientId = formData.get("client_id") as string
    const subscriptionId = (formData.get("subscription_id") as string) || null
    const subtotal = Number.parseFloat(formData.get("subtotal") as string)
    const taxRate = Number.parseFloat(formData.get("tax_rate") as string)
    const taxAmount = subtotal * taxRate
    const totalAmount = subtotal + taxAmount

    const client = clients.find((c) => c.id === clientId)
    const companySettings = {
      company_name: "Subscription Manager Inc.",
      company_address: "789 Tech Lane, Silicon Valley, CA 94043",
      company_email: "info@subscriptionmanager.com",
    }

    const invoiceData: Partial<Invoice> = {
      client_id: clientId,
      subscription_id: subscriptionId,
      invoice_number: formData.get("invoice_number") as string,
      issue_date: formData.get("issue_date") as string,
      due_date: formData.get("due_date") as string,
      subtotal: subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      currency: formData.get("currency") as string,
      status: formData.get("status") as string,
      // Company and Client details for the invoice record
      company_name: companySettings.company_name,
      company_address: companySettings.company_address,
      company_email: companySettings.company_email,
      client_name: client?.name || "N/A",
      client_email: client?.email || "N/A",
      client_address: client?.address || "N/A",
      items: [{ description: formData.get("item_description") as string, amount: subtotal }], // Simplified for now
    }

    try {
      if (currentInvoice) {
        await updateInvoice(currentInvoice.id, invoiceData)
        toast({
          title: "Invoice Updated",
          description: "The invoice has been successfully updated.",
        })
      } else {
        await createInvoice(invoiceData as Omit<Invoice, "id" | "created_at" | "updated_at">)
        toast({
          title: "Invoice Added",
          description: "The invoice has been successfully added.",
        })
      }
      fetchData()
      setIsModalOpen(false)
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to ${currentInvoice ? "update" : "add"} invoice.`,
        variant: "destructive",
      })
      console.error(err)
    }
  }

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client ? client.name : "N/A"
  }

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(invoice.client_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading invoices...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Button onClick={handleAddInvoice}>
          <PlusCircle className="mr-2 h-5 w-5" /> Generate Invoice
        </Button>
      </div>

      <div className="relative mb-6">
        <Input
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{getClientName(invoice.client_id)}</TableCell>
                  <TableCell>{format(new Date(invoice.issue_date), "PPP")}</TableCell>
                  <TableCell>{format(new Date(invoice.due_date), "PPP")}</TableCell>
                  <TableCell>
                    {invoice.total_amount.toFixed(2)} {invoice.currency}
                  </TableCell>
                  <TableCell>{invoice.status}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/invoices/preview/${invoice.id}`} passHref>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Preview</span>
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleEditInvoice(invoice)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteInvoice(invoice.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentInvoice ? "Edit Invoice" : "Generate New Invoice"}</DialogTitle>
            <DialogDescription>
              {currentInvoice ? "Edit the invoice details." : "Fill in the details to generate a new invoice."}
            </DialogDescription>
          </DialogHeader>
          <form action={handleSaveInvoice}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client_id" className="text-right">
                  Client
                </Label>
                <select
                  id="client_id"
                  name="client_id"
                  defaultValue={currentInvoice?.client_id || ""}
                  className="col-span-3 p-2 border rounded-md"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subscription_id" className="text-right">
                  Subscription (Optional)
                </Label>
                <select
                  id="subscription_id"
                  name="subscription_id"
                  defaultValue={currentInvoice?.subscription_id || ""}
                  className="col-span-3 p-2 border rounded-md"
                >
                  <option value="">None</option>
                  {subscriptions.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {getClientName(sub.client_id)} - {sub.plan_name} ({sub.amount} {sub.currency})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="invoice_number" className="text-right">
                  Invoice #
                </Label>
                <Input
                  id="invoice_number"
                  name="invoice_number"
                  defaultValue={currentInvoice?.invoice_number || ""}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="issue_date" className="text-right">
                  Issue Date
                </Label>
                <Input
                  id="issue_date"
                  name="issue_date"
                  type="date"
                  defaultValue={
                    currentInvoice?.issue_date ? format(new Date(currentInvoice.issue_date), "yyyy-MM-dd") : ""
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="due_date" className="text-right">
                  Due Date
                </Label>
                <Input
                  id="due_date"
                  name="due_date"
                  type="date"
                  defaultValue={currentInvoice?.due_date ? format(new Date(currentInvoice.due_date), "yyyy-MM-dd") : ""}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="item_description" className="text-right">
                  Item Description
                </Label>
                <Input
                  id="item_description"
                  name="item_description"
                  defaultValue={currentInvoice?.items[0]?.description || ""}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subtotal" className="text-right">
                  Subtotal
                </Label>
                <Input
                  id="subtotal"
                  name="subtotal"
                  type="number"
                  step="0.01"
                  defaultValue={currentInvoice?.subtotal || ""}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tax_rate" className="text-right">
                  Tax Rate (%)
                </Label>
                <Input
                  id="tax_rate"
                  name="tax_rate"
                  type="number"
                  step="0.01"
                  defaultValue={currentInvoice?.tax_rate ? currentInvoice.tax_rate * 100 : 8}
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
                  defaultValue={currentInvoice?.currency || "USD"}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={currentInvoice?.status || "pending"}
                  className="col-span-3 p-2 border rounded-md"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Invoice</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
