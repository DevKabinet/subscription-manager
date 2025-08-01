"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DollarSign, RefreshCw, Edit, Save, X, TrendingUp, Clock } from "lucide-react"
import { useExchangeRateStore } from "@/lib/exchange-rates"

interface ExchangeRateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExchangeRateModal({ isOpen, onClose }: ExchangeRateModalProps) {
  const { rates, baseCurrency, lastFetched, isLoading, fetchRates, updateRate } = useExchangeRateStore()

  const [editingCurrency, setEditingCurrency] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const currencies = Object.keys(rates).sort()

  const handleEdit = (currency: string) => {
    setEditingCurrency(currency)
    setEditValue(rates[currency].rate.toString())
  }

  const handleSave = () => {
    if (editingCurrency && editValue) {
      const newRate = Number.parseFloat(editValue)
      if (!isNaN(newRate) && newRate > 0) {
        updateRate(editingCurrency, newRate, true)
        setEditingCurrency(null)
        setEditValue("")
      }
    }
  }

  const handleCancel = () => {
    setEditingCurrency(null)
    setEditValue("")
  }

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Global Exchange Rates
          </DialogTitle>
          <DialogDescription>Manage currency exchange rates for multi-currency invoicing</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                Base Currency: {baseCurrency}
              </Badge>
              {lastFetched && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  Last updated: {formatLastUpdated(lastFetched)}
                </div>
              )}
            </div>
            <Button onClick={fetchRates} disabled={isLoading} className="hover-lift">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Updating..." : "Refresh Rates"}
            </Button>
          </div>

          {/* Manual Update Warning */}
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Manually updated rates are protected from automatic updates for 24 hours. Click "Refresh Rates" to get the
              latest market rates for non-manual currencies.
            </AlertDescription>
          </Alert>

          {/* Exchange Rates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currencies.map((currency) => {
              const rate = rates[currency]
              const isEditing = editingCurrency === currency

              return (
                <Card key={currency} className="relative">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span>{currency}</span>
                      <div className="flex items-center gap-2">
                        {rate.isManuallyUpdated && (
                          <Badge variant="secondary" className="text-xs">
                            Manual
                          </Badge>
                        )}
                        {!isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(currency)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardTitle>
                    <CardDescription>
                      1 {baseCurrency} = {currency}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={`rate-${currency}`}>Exchange Rate</Label>
                          <Input
                            id={`rate-${currency}`}
                            type="number"
                            step="0.0001"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder="Enter rate"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSave} className="flex-1">
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-green-600">{rate.rate.toFixed(4)}</div>
                        <div className="text-xs text-gray-500">Updated: {formatLastUpdated(rate.lastUpdated)}</div>
                        {rate.isManuallyUpdated && rate.manuallyUpdatedAt && (
                          <div className="text-xs text-blue-600">
                            Manual update: {formatLastUpdated(rate.manuallyUpdatedAt)}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Conversion Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Conversions</CardTitle>
              <CardDescription>Example conversions from {baseCurrency}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currencies.slice(0, 4).map((currency) => {
                  const rate = rates[currency]
                  const amount100 = (100 * rate.rate).toFixed(2)
                  const amount1000 = (1000 * rate.rate).toFixed(2)

                  return (
                    <div key={currency} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-sm text-gray-600 mb-2">{currency}</div>
                      <div className="space-y-1 text-sm">
                        <div>
                          $100 = {amount100} {currency}
                        </div>
                        <div>
                          $1,000 = {amount1000} {currency}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
