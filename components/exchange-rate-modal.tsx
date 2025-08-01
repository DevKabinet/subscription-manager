"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Save, Edit2, History, Calculator, TrendingUp, TrendingDown } from "lucide-react"
import { useExchangeRateStore } from "@/lib/exchange-rates"
import { useAuthStore } from "@/lib/auth"

interface ExchangeRateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExchangeRateModal({ isOpen, onClose }: ExchangeRateModalProps) {
  const { user } = useAuthStore()
  const {
    rates,
    changeLog,
    isLoading,
    error,
    fetchRates,
    updateRate,
    getSupportedCurrencies,
    getCurrencyFlag,
    getCurrencyName,
    convertAmount,
    lastFetched,
  } = useExchangeRateStore()

  const [editingCurrency, setEditingCurrency] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [converterAmount, setConverterAmount] = useState("100")
  const [converterFrom, setConverterFrom] = useState("USD")
  const [converterTo, setConverterTo] = useState("EUR")

  useEffect(() => {
    if (isOpen) {
      fetchRates()
    }
  }, [isOpen, fetchRates])

  const handleEdit = (currency: string, currentRate: number) => {
    setEditingCurrency(currency)
    setEditValue(currentRate.toString())
  }

  const handleSave = () => {
    if (editingCurrency && editValue && user) {
      const newRate = Number.parseFloat(editValue)
      if (!isNaN(newRate) && newRate > 0) {
        updateRate(editingCurrency, newRate, `${user.firstName} ${user.lastName}`)
        setEditingCurrency(null)
        setEditValue("")
      }
    }
  }

  const handleCancel = () => {
    setEditingCurrency(null)
    setEditValue("")
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getChangeIcon = (oldRate: number, newRate: number) => {
    if (newRate > oldRate) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (newRate < oldRate) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    }
    return null
  }

  const supportedCurrencies = getSupportedCurrencies()
  const nonUsdRates = rates.filter((rate) => rate.targetCurrency !== "USD")

  const convertedAmount = converterAmount
    ? convertAmount(Number.parseFloat(converterAmount), converterFrom, converterTo)
    : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            💱 Exchange Rate Management
            <Badge variant="outline">Base: USD</Badge>
          </DialogTitle>
          <DialogDescription>
            Manage exchange rates for USD, EUR, and SRD currencies
            {lastFetched && (
              <span className="block text-xs text-muted-foreground mt-1">
                Last updated: {formatDateTime(lastFetched)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="rates" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rates">Current Rates</TabsTrigger>
            <TabsTrigger value="converter">Currency Converter</TabsTrigger>
            <TabsTrigger value="history">Change Log</TabsTrigger>
          </TabsList>

          <TabsContent value="rates" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{supportedCurrencies.length} currencies supported</div>
              <Button onClick={fetchRates} disabled={isLoading} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Updating..." : "Refresh Rates"}
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">{error}</div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Exchange Rates</CardTitle>
                <CardDescription>
                  All rates are relative to USD (1.00). Click edit to manually adjust rates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Currency</TableHead>
                      <TableHead>Rate (1 USD = ?)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nonUsdRates.map((rate) => (
                      <TableRow key={rate.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getCurrencyFlag(rate.targetCurrency)}</span>
                            <div>
                              <div className="font-medium">{rate.targetCurrency}</div>
                              <div className="text-xs text-muted-foreground">
                                {getCurrencyName(rate.targetCurrency)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {editingCurrency === rate.targetCurrency ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                step="0.0001"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-32"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <div className="font-mono text-lg">{rate.rate.toFixed(4)}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {rate.isManual ? (
                            <Badge variant="secondary">Manual</Badge>
                          ) : (
                            <Badge variant="outline">API</Badge>
                          )}
                          {rate.updatedBy && (
                            <div className="text-xs text-muted-foreground mt-1">by {rate.updatedBy}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(rate.lastUpdated)}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingCurrency === rate.targetCurrency ? (
                            <div className="flex items-center gap-1 justify-end">
                              <Button size="sm" onClick={handleSave}>
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancel}>
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(rate.targetCurrency, rate.rate)}
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="converter" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Currency Converter
                </CardTitle>
                <CardDescription>Convert between supported currencies using current rates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={converterAmount}
                      onChange={(e) => setConverterAmount(e.target.value)}
                      placeholder="100"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromCurrency">From</Label>
                    <select
                      id="fromCurrency"
                      value={converterFrom}
                      onChange={(e) => setConverterFrom(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {supportedCurrencies.map((currency) => (
                        <option key={currency} value={currency}>
                          {getCurrencyFlag(currency)} {currency}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toCurrency">To</Label>
                    <select
                      id="toCurrency"
                      value={converterTo}
                      onChange={(e) => setConverterTo(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {supportedCurrencies.map((currency) => (
                        <option key={currency} value={currency}>
                          {getCurrencyFlag(currency)} {currency}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Result</Label>
                    <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center font-mono text-lg">
                      {convertedAmount.toFixed(4)} {converterTo}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  {converterAmount} {getCurrencyFlag(converterFrom)} {converterFrom} = {convertedAmount.toFixed(4)}{" "}
                  {getCurrencyFlag(converterTo)} {converterTo}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Exchange Rate Change Log
                </CardTitle>
                <CardDescription>History of all rate changes and updates</CardDescription>
              </CardHeader>
              <CardContent>
                {changeLog.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No changes recorded yet. Rate changes will appear here.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Updated By</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {changeLog.map((change) => (
                        <TableRow key={change.id}>
                          <TableCell className="text-sm">{formatDateTime(change.timestamp)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{getCurrencyFlag(change.targetCurrency)}</span>
                              <span className="font-medium">{change.targetCurrency}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getChangeIcon(change.oldRate, change.newRate)}
                              <div className="font-mono text-sm">
                                {change.oldRate.toFixed(4)} → {change.newRate.toFixed(4)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={change.changeType === "manual" ? "default" : "outline"}>
                              {change.changeType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{change.updatedBy}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{change.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
