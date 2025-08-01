import { notFound } from "next/navigation"
import { getInvoiceById } from "@/lib/invoices"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"

interface InvoicePreviewPageProps {
  params: {
    id: string
  }
}

export default async function InvoicePreviewPage({ params }: InvoicePreviewPageProps) {
  const invoice = await getInvoiceById(params.id)

  if (!invoice) {
    notFound()
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Invoice #{invoice.invoice_number}</CardTitle>
          <p className="text-sm text-muted-foreground">Issued: {format(new Date(invoice.issue_date), "PPP")}</p>
          <p className="text-sm text-muted-foreground">Due: {format(new Date(invoice.due_date), "PPP")}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold">Billed To:</h3>
              <p>{invoice.client_name}</p>
              <p>{invoice.client_email}</p>
              <p>{invoice.client_address}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold">From:</h3>
              <p>{invoice.company_name}</p>
              <p>{invoice.company_address}</p>
              <p>{invoice.company_email}</p>
            </div>
          </div>

          <Table className="mb-6">
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end">
            <div className="w-1/2 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({invoice.tax_rate * 100}%):</span>
                <span>${invoice.tax_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${invoice.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-semibold ${invoice.status === "paid" ? "text-green-600" : "text-red-600"}`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
