"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Edit2, Save, X, TrendingUp, TrendingDown } from "lucide-react"
import { useExchangeRateStore } from "@/lib/exchange-rates"

interface ExchangeRateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExchangeRateModal({ isOpen, onClose }: ExchangeRateModalProps) {
  const { rates, isLoading, fetchRates, updateRate, lastFetched } = useExchangeRateStore()
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const handleEdit = (currency: string, currentRate: number) => {
    setEditingCurrency(currency)
    setEditValue(currentRate.toString())
  }

  const handleSave = () => {
    if (editingCurrency && editValue) {
      const newRate = Number.parseFloat(editValue)
      if (!isNaN(newRate) && newRate > 0) {
        updateRate(editingCurrency, newRate)
      }
    }
    setEditingCurrency(null)
    setEditValue("")
  }

  const handleCancel = () => {
    setEditingCurrency(null)
    setEditValue("")
  }

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getCurrencyFlag = (currency: string) => {
    const flags: Record<string, string> = {
      USD: "🇺🇸",
      EUR: "🇪🇺",
      GBP: "🇬🇧",
      JPY: "🇯🇵",
      CAD: "🇨🇦",
      AUD: "🇦🇺",
      CHF: "🇨🇭",
      CNY: "🇨🇳",
    }
    return flags[currency] || "💱"
  }

  const getTrendIcon = (rate: number) => {
    // Simulate trend based on rate value (this would be real historical data in production)
    const trend = Math.random() > 0.5
    return trend ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />
  }

  // Ensure rates is an array before rendering
  const safeRates = Array.isArray(rates) ? rates : []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            💱 Global Exchange Rates
            <Badge variant="outline" className="text-xs">
              Base: USD
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Manage exchange rates for multi-currency invoicing and payments
            {lastFetched && (
              <span className="block text-xs text-gray-500 mt-1">Last updated: {formatLastUpdated(lastFetched)}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">{safeRates.length} currencies available</div>
            <Button
              onClick={fetchRates}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Updating..." : "Refresh Rates"}
            </Button>
          </div>

          {/* Exchange Rates Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Exchange Rates</CardTitle>
              <CardDescription>
                Click the edit button to manually adjust rates. All rates are relative to USD (1.00).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency</TableHead>
                    <TableHead>Rate (USD)</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeRates.map((rate) => (
                    <TableRow key={rate.currency}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getCurrencyFlag(rate.currency)}</span>
                          <div>
                            <div className="font-medium">{rate.currency}</div>
                            <div className="text-xs text-gray-500">
                              {rate.currency === "USD" && "US Dollar"}
                              {rate.currency === "EUR" && "Euro"}
                              {rate.currency === "GBP" && "British Pound"}
                              {rate.currency === "JPY" && "Japanese Yen"}
                              {rate.currency === "CAD" && "Canadian Dollar"}
                              {rate.currency === "AUD" && "Australian Dollar"}
                              {rate.currency === "CHF" && "Swiss Franc"}
                              {rate.currency === "CNY" && "Chinese Yuan"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {editingCurrency === rate.currency ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.0001"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-24"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <div className="font-mono">{rate.rate.toFixed(4)}</div>
                        )}
                      </TableCell>
                      <TableCell>{getTrendIcon(rate.rate)}</TableCell>
                      <TableCell className="text-sm text-gray-500">{formatLastUpdated(rate.lastUpdated)}</TableCell>
                      <TableCell className="text-right">
                        {editingCurrency === rate.currency ? (
                          <div className="flex items-center gap-1 justify-end">
                            <Button size="sm" variant="ghost" onClick={handleSave} className="h-8 w-8 p-0">
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 w-8 p-0">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(rate.currency, rate.rate)}
                            className="h-8 w-8 p-0"
                            disabled={rate.currency === "USD"} // Can't edit base currency
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Quick Conversion Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Converter</CardTitle>
              <CardDescription>Convert between currencies using current rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" placeholder="100" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromCurrency">From</Label>
                  <select
                    id="fromCurrency"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {safeRates.map((rate) => (
                      <option key={rate.currency} value={rate.currency}>
                        {getCurrencyFlag(rate.currency)} {rate.currency}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toCurrency">To</Label>
                  <select
                    id="toCurrency"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {safeRates.map((rate) => (
                      <option key={rate.currency} value={rate.currency}>
                        {getCurrencyFlag(rate.currency)} {rate.currency}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
