"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Download, PrinterIcon as Print } from "lucide-react"
import Link from "next/link"
import jsPDF from "jspdf"

interface InvoiceData {
  invoiceNumber: string
  clientName: string
  clientEmail: string
  clientAddress: string
  subscriptionName: string
  amount: number
  issueDate: string
  dueDate: string
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  taxNumber: string
}

export default function InvoicePreviewPage() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Simulate loading invoice data
    setInvoiceData({
      invoiceNumber: "INV-2024-001",
      clientName: "John Doe",
      clientEmail: "john@example.com",
      clientAddress: "456 Client Ave, City, State 12345",
      subscriptionName: "Basic Plan",
      amount: 29.99,
      issueDate: "2024-01-01",
      dueDate: "2024-01-15",
      companyName: "Your Company Name",
      companyAddress: "123 Business St, City, State 12345",
      companyPhone: "+1 (555) 123-4567",
      companyEmail: "contact@yourcompany.com",
      taxNumber: "TAX123456789",
    })
  }, [router, params.id])

  const handleDownload = () => {
    if (!invoiceData) return

    const doc = new jsPDF()

    // Company header
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text(invoiceData.companyName, 20, 30)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const companyAddressLines = invoiceData.companyAddress.split("\n")
    companyAddressLines.forEach((line, index) => {
      doc.text(line, 20, 40 + index * 5)
    })
    doc.text(invoiceData.companyPhone, 20, 40 + companyAddressLines.length * 5)
    doc.text(invoiceData.companyEmail, 20, 45 + companyAddressLines.length * 5)
    if (invoiceData.taxNumber) {
      doc.text(`Tax ID: ${invoiceData.taxNumber}`, 20, 50 + companyAddressLines.length * 5)
    }

    // Invoice title and number
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("INVOICE", 150, 30)

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`#${invoiceData.invoiceNumber}`, 150, 40)

    // Client information
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Bill To:", 20, 80)

    doc.setFont("helvetica", "normal")
    doc.text(invoiceData.clientName, 20, 90)
    doc.text(invoiceData.clientEmail, 20, 95)
    const clientAddressLines = invoiceData.clientAddress.split("\n")
    clientAddressLines.forEach((line, index) => {
      doc.text(line, 20, 100 + index * 5)
    })

    // Invoice details
    doc.setFont("helvetica", "bold")
    doc.text("Invoice Details:", 120, 80)

    doc.setFont("helvetica", "normal")
    doc.text(`Issue Date: ${new Date(invoiceData.issueDate).toLocaleDateString()}`, 120, 90)
    doc.text(`Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}`, 120, 95)

    // Table header
    doc.setFont("helvetica", "bold")
    doc.text("Description", 20, 130)
    doc.text("Amount", 150, 130)

    // Draw line under header
    doc.line(20, 135, 190, 135)

    // Table content
    doc.setFont("helvetica", "normal")
    doc.text(invoiceData.subscriptionName, 20, 145)
    doc.text(`$${invoiceData.amount.toFixed(2)}`, 150, 145)

    // Total
    doc.line(20, 155, 190, 155)
    doc.setFont("helvetica", "bold")
    doc.text("Total:", 130, 165)
    doc.text(`$${invoiceData.amount.toFixed(2)}`, 150, 165)

    // Payment instructions
    doc.setFont("helvetica", "bold")
    doc.text("Payment Instructions:", 20, 190)

    doc.setFont("helvetica", "normal")
    const paymentText = `Please make payment by the due date. Payment can be made via cash, check, or bank transfer. For any questions regarding this invoice, please contact us at ${invoiceData.companyEmail}.`
    const splitText = doc.splitTextToSize(paymentText, 170)
    doc.text(splitText, 20, 200)

    // Footer
    doc.setFont("helvetica", "italic")
    doc.text("Thank you for your business!", 105, 250, { align: "center" })

    // Save the PDF
    doc.save(`${invoiceData.invoiceNumber}.pdf`)
  }

  const handlePrint = () => {
    window.print()
  }

  if (!invoiceData) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/invoices">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Invoices
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Invoice Preview</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Print className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="print:shadow-none print:border-none">
          <CardContent className="p-8">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                <p className="text-lg font-semibold text-gray-600">#{invoiceData.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-900">{invoiceData.companyName}</h2>
                <p className="text-gray-600 whitespace-pre-line">{invoiceData.companyAddress}</p>
                <p className="text-gray-600">{invoiceData.companyPhone}</p>
                <p className="text-gray-600">{invoiceData.companyEmail}</p>
                {invoiceData.taxNumber && <p className="text-gray-600">Tax ID: {invoiceData.taxNumber}</p>}
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
                <div className="text-gray-600">
                  <p className="font-medium">{invoiceData.clientName}</p>
                  <p>{invoiceData.clientEmail}</p>
                  <p className="whitespace-pre-line">{invoiceData.clientAddress}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Invoice Details:</h3>
                <div className="text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Issue Date:</span>{" "}
                    {new Date(invoiceData.issueDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Due Date:</span> {new Date(invoiceData.dueDate).toLocaleDateString()}
                  </p>
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
                    <td className="py-4 text-gray-600">{invoiceData.subscriptionName}</td>
                    <td className="py-4 text-right text-gray-600">${invoiceData.amount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Invoice Total */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2 border-t-2 border-gray-300">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="font-bold text-xl text-gray-900">${invoiceData.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Instructions</h3>
              <p className="text-gray-600">
                Please make payment by the due date. Payment can be made via cash, check, or bank transfer. For any
                questions regarding this invoice, please contact us at {invoiceData.companyEmail}.
              </p>
            </div>

            {/* Footer */}
            <div className="text-center text-gray-500 text-sm mt-8 pt-6 border-t border-gray-200">
              <p>Thank you for your business!</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
