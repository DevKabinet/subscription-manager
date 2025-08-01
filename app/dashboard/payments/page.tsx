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
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react"
import { getPayments, createPayment, updatePayment, deletePayment } from "@/lib/payments"
import { getInvoices } from "@/lib/invoices"
import type { Payment, Invoice } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [paymentsData, invoicesData] = await Promise.all([getPayments(), getInvoices()])
      setPayments(paymentsData)
      setInvoices(invoicesData)
    } catch (err) {
      setError("Failed to fetch data.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPayment = () => {
    setCurrentPayment(null)
    setIsModalOpen(true)
  }

  const handleEditPayment = (payment: Payment) => {
    setCurrentPayment(payment)
    setIsModalOpen(true)
  }

  const handleDeletePayment = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      try {
        await deletePayment(id)
        toast({
          title: "Payment Deleted",
          description: "The payment has been successfully deleted.",
        })
        fetchData()
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete payment.",
          variant: "destructive",
        })
        console.error(err)
      }
    }
  }

  const handleSavePayment = async (formData: FormData) => {
    const paymentData: Partial<Payment> = {
      invoice_id: formData.get("invoice_id") as string,
      amount: Number.parseFloat(formData.get("amount") as string),
      currency: formData.get("currency") as string,
      payment_date: formData.get("payment_date") as string,
      payment_method: formData.get("payment_method") as string,
      transaction_id: formData.get("transaction_id") as string,
      status: formData.get("status") as string,
      customer_id: (formData.get("customer_id") as string) || null,
      subscription_id: (formData.get("subscription_id") as string) || null,
      charge_id: (formData.get("charge_id") as string) || null,
      refund_id: (formData.get("refund_id") as string) || null,
      gateway_status: (formData.get("gateway_status") as string) || null,
      metadata: formData.get("metadata") ? JSON.parse(formData.get("metadata") as string) : null,
    }

    try {
      if (currentPayment) {
        await updatePayment(currentPayment.id, paymentData)
        toast({
          title: "Payment Updated",
          description: "The payment has been successfully updated.",
        })
      } else {
        await createPayment(paymentData as Omit<Payment, "id" | "created_at" | "updated_at">)
        toast({
          title: "Payment Added",
          description: "The payment has been successfully added.",
        })
      }
      fetchData()
      setIsModalOpen(false)
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to ${currentPayment ? "update" : "add"} payment.`,
        variant: "destructive",
      })
      console.error(err)
    }
  }

  const getInvoiceNumber = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId)
    return invoice ? invoice.invoice_number : "N/A"
  }

  const filteredPayments = payments.filter(
    (payment) =>
      getInvoiceNumber(payment.invoice_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payment_method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading payments...</p>
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
        <h1 className="text-3xl font-bold">Payments</h1>
        <Button onClick={handleAddPayment}>
          <PlusCircle className="mr-2 h-5 w-5" /> Record Payment
        </Button>
      </div>

      <div className="relative mb-6">
        <Input
          placeholder="Search payments..."
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
              <TableHead>Amount</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{getInvoiceNumber(payment.invoice_id)}</TableCell>
                  <TableCell>
                    {payment.amount.toFixed(2)} {payment.currency}
                  </TableCell>
                  <TableCell>{format(new Date(payment.payment_date), "PPP")}</TableCell>
                  <TableCell>{payment.payment_method || "N/A"}</TableCell>
                  <TableCell>{payment.transaction_id || "N/A"}</TableCell>
                  <TableCell>{payment.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditPayment(payment)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeletePayment(payment.id)}>
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
            <DialogTitle>{currentPayment ? "Edit Payment" : "Record New Payment"}</DialogTitle>
            <DialogDescription>
              {currentPayment ? "Edit the payment details." : "Fill in the details for the new payment."}
            </DialogDescription>
          </DialogHeader>
          <form action={handleSavePayment}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="invoice_id" className="text-right">
                  Invoice
                </Label>
                <select
                  id="invoice_id"
                  name="invoice_id"
                  defaultValue={currentPayment?.invoice_id || ""}
                  className="col-span-3 p-2 border rounded-md"
                  required
                >
                  <option value="">Select an invoice</option>
                  {invoices.map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoice_number} - {invoice.total_amount.toFixed(2)} {invoice.currency}
                    </option>
                  ))}
                </select>
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
                <Label htmlFor="payment_date" className="text-right">
                  Payment Date
                </Label>
                <Input
                  id="payment_date"
                  name="payment_date"
                  type="date"
                  defaultValue={
                    currentPayment?.payment_date ? format(new Date(currentPayment.payment_date), "yyyy-MM-dd") : ""
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment_method" className="text-right">
                  Payment Method
                </Label>
                <Input
                  id="payment_method"
                  name="payment_method"
                  defaultValue={currentPayment?.payment_method || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="transaction_id" className="text-right">
                  Transaction ID
                </Label>
                <Input
                  id="transaction_id"
                  name="transaction_id"
                  defaultValue={currentPayment?.transaction_id || ""}
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
                  defaultValue={currentPayment?.status || "completed"}
                  className="col-span-3 p-2 border rounded-md"
                  required
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customer_id" className="text-right">
                  Customer ID (Gateway)
                </Label>
                <Input
                  id="customer_id"
                  name="customer_id"
                  defaultValue={currentPayment?.customer_id || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subscription_id" className="text-right">
                  Subscription ID (Gateway)
                </Label>
                <Input
                  id="subscription_id"
                  name="subscription_id"
                  defaultValue={currentPayment?.subscription_id || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="charge_id" className="text-right">
                  Charge ID (Gateway)
                </Label>
                <Input
                  id="charge_id"
                  name="charge_id"
                  defaultValue={currentPayment?.charge_id || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="refund_id" className="text-right">
                  Refund ID (Gateway)
                </Label>
                <Input
                  id="refund_id"
                  name="refund_id"
                  defaultValue={currentPayment?.refund_id || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gateway_status" className="text-right">
                  Gateway Status
                </Label>
                <Input
                  id="gateway_status"
                  name="gateway_status"
                  defaultValue={currentPayment?.gateway_status || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="metadata" className="text-right">
                  Metadata (JSON)
                </Label>
                <Input
                  id="metadata"
                  name="metadata"
                  defaultValue={currentPayment?.metadata ? JSON.stringify(currentPayment.metadata) : ""}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Payment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
