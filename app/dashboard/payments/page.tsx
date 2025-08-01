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
import { Plus, CreditCard, DollarSign, Calendar, User } from "lucide-react"
import { useExchangeRateStore } from "@/lib/exchange-rates"

interface Payment {
  id: number
  clientName: string
  amount: number
  originalAmount: number
  currency: string
  exchangeRate: number
  paymentMethod: "cash" | "check" | "bank_transfer" | "credit_card"
  paymentDate: string
  invoiceNumber?: string
  notes?: string
  status: "completed" | "pending" | "failed"
}

interface Client {
  id: number
  name: string
  email: string
}

export default function PaymentsPage() {
  const router = useRouter()
  const { convertAmount, getRate, getCurrencyFlag, getSupportedCurrencies } = useExchangeRateStore()

  const [payments, setPayments] = useState<Payment[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("all")
  const [selectedCurrency, setSelectedCurrency] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    clientId: "",
    amount: "",
    currency: "USD",
    paymentMethod: "cash" as const,
    paymentDate: new Date().toISOString().split("T")[0],
    invoiceNumber: "",
    notes: "",
  })
  const [isRecording, setIsRecording] = useState(false)

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
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" },
      { id: 3, name: "Alice Johnson", email: "alice@example.com" },
      { id: 4, name: "Bob Wilson", email: "bob@example.com" },
    ])

    // Load existing mock payments with multi-currency support
    const mockPayments: Payment[] = [
      {
        id: 1,
        clientName: "John Doe",
        amount: 29.99,
        originalAmount: 29.99,
        currency: "USD",
        exchangeRate: 1.0,
        paymentMethod: "credit_card",
        paymentDate: "2024-01-15",
        invoiceNumber: "INV-2024-001",
        status: "completed",
      },
      {
        id: 2,
        clientName: "Jane Smith",
        amount: 2714.28,
        originalAmount: 152.982,
        currency: "SRD",
        exchangeRate: 17.74,
        paymentMethod: "bank_transfer",
        paymentDate: "2024-01-20",
        invoiceNumber: "INV-2024-002",
        status: "completed",
      },
      {
        id: 3,
        clientName: "Alice Johnson",
        amount: 500.0,
        originalAmount: 500.0,
        currency: "USD",
        exchangeRate: 1.0,
        paymentMethod: "cash",
        paymentDate: "2024-01-25",
        notes: "Partial payment for services",
        status: "completed",
      },
    ]

    setPayments(mockPayments)
  }

  const handleRecordPayment = () => {
    setFormData({
      clientId: "",
      amount: "",
      currency: "USD",
      paymentMethod: "cash",
      paymentDate: new Date().toISOString().split("T")[0],
      invoiceNumber: "",
      notes: "",
    })
    setIsRecordModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    setIsRecording(true)

    const selectedClient = clients.find((c) => c.id === Number.parseInt(formData.clientId))
    if (!selectedClient) {
      alert("Please select a client")
      setIsRecording(false)
      return
    }

    const amount = Number.parseFloat(formData.amount)
    const originalAmount = convertAmount(amount, formData.currency, "USD")
    const exchangeRate = getRate("USD", formData.currency)

    // Create new payment record
    const newPayment: Payment = {
      id: Date.now(),
      clientName: selectedClient.name,
      amount: amount,
      originalAmount: originalAmount,
      currency: formData.currency,
      exchangeRate: exchangeRate,
      paymentMethod: formData.paymentMethod,
      paymentDate: formData.paymentDate,
      invoiceNumber: formData.invoiceNumber || undefined,
      notes: formData.notes || undefined,
      status: "completed",
    }

    setPayments([...payments, newPayment])

    setIsRecording(false)
    setIsRecordModalOpen(false)

    // Show success message
    alert(
      `Payment of ${getCurrencyFlag(formData.currency)} ${amount.toFixed(2)} ${formData.currency} recorded successfully!`,
    )
  }

  const filteredPayments = payments.filter((payment) => {
    const clientMatch = selectedClient === "all" || payment.clientName === selectedClient
    const currencyMatch = selectedCurrency === "all" || payment.currency === selectedCurrency
    const statusMatch = selectedStatus === "all" || payment.status === selectedStatus
    return clientMatch && currencyMatch && statusMatch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 text-green-100 hover:bg-green-600">Completed</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "credit_card":
        return <CreditCard className="h-4 w-4" />
      case "cash":
        return <DollarSign className="h-4 w-4" />
      case "check":
        return <Calendar className="h-4 w-4" />
      case "bank_transfer":
        return <User className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "credit_card":
        return "Credit Card"
      case "cash":
        return "Cash"
      case "check":
        return "Check"
      case "bank_transfer":
        return "Bank Transfer"
      default:
        return method
    }
  }

  const getTotalPayments = () => {
    return filteredPayments.reduce((sum, payment) => sum + payment.originalAmount, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multi-Currency Payments</h1>
          <p className="text-gray-600">Record and manage payments in multiple currencies</p>
        </div>
        <Button className="bg-green-500 text-white" onClick={handleRecordPayment}>
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">🇺🇸 ${getTotalPayments().toFixed(2)}</div>
            <p className="text-xs text-gray-500">USD equivalent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredPayments.length}</div>
            <p className="text-xs text-gray-500">Payments recorded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Currencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(filteredPayments.map((p) => p.currency)).size}</div>
            <p className="text-xs text-gray-500">Different currencies</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredPayments.filter((p) => p.status === "completed").length}
            </div>
            <p className="text-xs text-gray-500">Successful payments</p>
          </CardContent>
        </Card>
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
            <div className="flex-1">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Track all payments received in multiple currencies</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>USD Equivalent</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.clientName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getCurrencyFlag(payment.currency)}
                      {payment.amount.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      {getCurrencyFlag(payment.currency)}
                      {payment.currency}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {payment.currency !== "USD" ? (
                      <div>
                        <div>🇺🇸 ${payment.originalAmount.toFixed(2)}</div>
                        <div className="text-xs">Rate: {payment.exchangeRate.toFixed(4)}</div>
                      </div>
                    ) : (
                      "🇺🇸 " + payment.amount.toFixed(2)
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(payment.paymentMethod)}
                      <span className="text-sm">{getPaymentMethodLabel(payment.paymentMethod)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {payment.invoiceNumber ? (
                      <Badge variant="outline" className="text-xs">
                        {payment.invoiceNumber}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Record Payment Modal */}
      <Dialog open={isRecordModalOpen} onOpenChange={setIsRecordModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-500" />
              Record Multi-Currency Payment
            </DialogTitle>
            <DialogDescription>Record a payment received from a client in any supported currency</DialogDescription>
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
                <Label htmlFor="currency">Payment Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  required
                >
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount Received</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder={`Enter amount in ${formData.currency}`}
                  required
                />
                {formData.amount && formData.currency !== "USD" && (
                  <p className="text-xs text-gray-500">
                    USD Equivalent: $
                    {convertAmount(Number.parseFloat(formData.amount), formData.currency, "USD").toFixed(2)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as any })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Cash
                      </div>
                    </SelectItem>
                    <SelectItem value="credit_card">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Credit Card
                      </div>
                    </SelectItem>
                    <SelectItem value="bank_transfer">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Bank Transfer
                      </div>
                    </SelectItem>
                    <SelectItem value="check">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Check
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number (Optional)</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="e.g., INV-2024-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes about this payment..."
                rows={3}
              />
            </div>

            {/* Payment Summary */}
            {formData.amount && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">Payment Summary</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Amount ({formData.currency}):</span>
                      <div className="font-bold text-lg text-green-700">
                        {getCurrencyFlag(formData.currency)} {Number.parseFloat(formData.amount).toFixed(2)}{" "}
                        {formData.currency}
                      </div>
                    </div>
                    {formData.currency !== "USD" && (
                      <>
                        <div>
                          <span className="text-gray-600">USD Equivalent:</span>
                          <div className="font-medium">
                            🇺🇸 ${convertAmount(Number.parseFloat(formData.amount), formData.currency, "USD").toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Exchange Rate:</span>
                          <div className="font-medium">
                            1 USD = {getRate("USD", formData.currency).toFixed(6)} {formData.currency}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button type="submit" className="w-full" disabled={isRecording || !formData.amount}>
              <CreditCard className="h-4 w-4 mr-2" />
              {isRecording ? "Recording Payment..." : "Record Payment"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
