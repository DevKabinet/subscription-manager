"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, Edit, Save, X, AlertCircle, CheckCircle } from "lucide-react"
import { useExchangeRateStore } from "@/lib/exchange-rates"

interface ExchangeRateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExchangeRateModal({ isOpen, onClose }: ExchangeRateModalProps) {
  const { rates, isLoading, error, lastFetched, fetchRates, updateRate, getCurrencyFlag } = useExchangeRateStore()

  const [editingRate, setEditingRate] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  useEffect(() => {
    if (isOpen && !lastFetched) {
      fetchRates()
    }
  }, [isOpen, lastFetched, fetchRates])

  const handleEdit = (currency: string, currentRate: number) => {
    setEditingRate(currency)
    setEditValue(currentRate.toString())
  }

  const handleSave = (baseCurrency: string, targetCurrency: string) => {
    const newRate = Number.parseFloat(editValue)
    if (!isNaN(newRate) && newRate > 0) {
      updateRate(baseCurrency, targetCurrency, newRate, true)
      setEditingRate(null)
      setEditValue("")
    }
  }

  const handleCancel = () => {
    setEditingRate(null)
    setEditValue("")
  }

  const handleRefresh = () => {
    fetchRates()
  }

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-500" />
            Exchange Rate Management
          </DialogTitle>
          <DialogDescription>
            Manage currency exchange rates for multi-currency invoicing and payments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {error ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                  <p className="text-sm">{lastFetched ? formatLastUpdated(lastFetched) : "Never"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Total Rates</Label>
                  <p className="text-sm">{rates.length} currencies</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <Badge variant="secondary">
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        Updating...
                      </Badge>
                    ) : error ? (
                      <Badge variant="destructive">Error</Badge>
                    ) : (
                      <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                    )}
                  </div>
                </div>
              </div>
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Exchange Rates</h3>
            <Button onClick={handleRefresh} disabled={isLoading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh Rates
            </Button>
          </div>

          {/* Exchange Rates Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency</TableHead>
                    <TableHead>Rate (1 USD =)</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rates
                    .filter((rate) => rate.target_currency !== "USD")
                    .map((rate) => (
                      <TableRow key={rate.target_currency}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getCurrencyFlag(rate.target_currency)}</span>
                            <span className="font-medium">{rate.target_currency}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {editingRate === rate.target_currency ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                step="0.000001"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-32"
                                autoFocus
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSave(rate.base_currency, rate.target_currency)}
                                className="h-8 w-8 p-0"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 w-8 p-0">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="font-mono">
                              {rate.rate.toFixed(6)} {rate.target_currency}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{formatLastUpdated(rate.last_updated)}</TableCell>
                        <TableCell>
                          <Badge variant={rate.is_manual ? "secondary" : "outline"}>
                            {rate.is_manual ? "Manual" : "API"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {editingRate !== rate.target_currency && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(rate.target_currency, rate.rate)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* USD Base Rate Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🇺🇸</span>
                <span className="font-medium">USD (Base Currency)</span>
                <Badge className="bg-blue-500 hover:bg-blue-600">Base</Badge>
              </div>
              <p className="text-sm text-blue-700">
                All exchange rates are calculated relative to USD. The USD rate is always 1.00000.
              </p>
            </CardContent>
          </Card>

          {/* Usage Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usage Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Automatic Updates</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Rates update daily via API</li>
                    <li>• Manual changes are preserved</li>
                    <li>• Last update time is tracked</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Manual Override</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Click edit to set custom rates</li>
                    <li>• Manual rates won't auto-update</li>
                    <li>• Refresh to get latest API rates</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
