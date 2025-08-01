"use client"

import { TableCell } from "@/components/ui/table"

import { TableBody } from "@/components/ui/table"

import { TableHead } from "@/components/ui/table"

import { TableRow } from "@/components/ui/table"

import { TableHeader } from "@/components/ui/table"

import { Table } from "@/components/ui/table"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Mail, Printer, Share2 } from "lucide-react"
import { useCompanySettingsStore } from "@/lib/company-settings"
import { useExchangeRateStore } from "@/lib/exchange-rates"

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  clientAddress: string
  issueDate: string
  dueDate: string
  status: "Paid" | "Pending" | "Overdue" | "Draft"
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  currency: string
  notes?: string
}

export default function InvoicePreviewPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const { companySettings } = useCompanySettingsStore()
  const { convertAmount, getRate } = useExchangeRateStore()

  useEffect(() => {
    // Simulate fetching invoice data
    const fetchedInvoice: Invoice = {
      id: invoiceId,
      invoiceNumber: `INV-${invoiceId.substring(0, 6).toUpperCase()}`,
      clientName: "Acme Corp.",
      clientAddress: "123 Business Rd, Suite 400, Anytown, CA 90210",
      issueDate: "2024-07-01",
      dueDate: "2024-07-31",
      status: "Pending",
      items: [
        { description: "Monthly Subscription Fee", quantity: 1, unitPrice: 100.0, total: 100.0 },
        { description: "Premium Support (July)", quantity: 1, unitPrice: 25.0, total: 25.0 },
        { description: "Additional User Licenses", quantity: 5, unitPrice: 10.0, total: 50.0 },
      ],
      subtotal: 175.0,
      taxRate: 0.08,
      taxAmount: 14.0,
      totalAmount: 189.0,
      currency: "USD",
      notes: "Thank you for your continued business!",
    }
    setInvoice(fetchedInvoice)
  }, [invoiceId])

  if (!invoice) {
    return <div className="flex justify-center items-center h-64">Loading invoice...</div>
  }

  const displayCurrency = companySettings.baseCurrency || "USD"
  const convertedTotal = convertAmount(invoice.totalAmount, invoice.currency, displayCurrency)
  const conversionRate = getRate(invoice.currency, displayCurrency)

  const getStatusBadgeVariant = (status: Invoice["status"]) => {
    switch (status) {
      case "Paid":
        return "default"
      case "Pending":
        return "secondary"
      case "Overdue":
        return "destructive"
      case "Draft":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
          <Button size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <Card className="p-6 md:p-8 shadow-lg">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between p-0 mb-6">
          <div>
            <CardTitle className="text-3xl font-bold text-gray-900">INVOICE</CardTitle>
            <p className="text-sm text-gray-600">#{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right mt-4 md:mt-0">
            <h2 className="text-xl font-semibold text-gray-800">
              {companySettings.companyName || "Your Company Name"}
            </h2>
            <p className="text-sm text-gray-600">{companySettings.companyAddress || "Your Company Address"}</p>
            <p className="text-sm text-gray-600">{companySettings.companyEmail || "info@yourcompany.com"}</p>
            <p className="text-sm text-gray-600">{companySettings.companyPhone || "+1 (555) 123-4567"}</p>
          </div>
        </CardHeader>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-md font-semibold text-gray-700 mb-2">Bill To:</h3>
            <p className="font-medium text-gray-800">{invoice.clientName}</p>
            <p className="text-sm text-gray-600">{invoice.clientAddress}</p>
          </div>
          <div className="md:text-right">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Invoice Date:</span> {invoice.issueDate}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Due Date:</span> {invoice.dueDate}
            </p>
            <div className="flex items-center md:justify-end mt-2">
              <span className="font-medium text-gray-700 mr-2">Status:</span>
              <Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status}</Badge>
            </div>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden mb-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {invoice.currency} {item.unitPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {invoice.currency} {item.total.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Subtotal:</span>
              <span>
                {invoice.currency} {invoice.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Tax ({invoice.taxRate * 100}%):</span>
              <span>
                {invoice.currency} {invoice.taxAmount.toFixed(2)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total:</span>
              <span>
                {invoice.currency} {invoice.totalAmount.toFixed(2)}
              </span>
            </div>
            {invoice.currency !== displayCurrency && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total in {displayCurrency}:</span>
                <span>
                  {displayCurrency} {convertedTotal.toFixed(2)} (Rate: {conversionRate.toFixed(4)})
                </span>
              </div>
            )}
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-8">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Notes:</h3>
            <p className="text-sm text-gray-600">{invoice.notes}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
