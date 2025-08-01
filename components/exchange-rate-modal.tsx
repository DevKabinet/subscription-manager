"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, Edit, Save, X, TrendingUp, Clock, DollarSign } from "lucide-react"

interface ExchangeRate {
  base_currency: string
  target_currency: string
  rate: number
  last_updated: string
  is_manual: boolean
}

interface ExchangeRateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExchangeRateModal({ isOpen, onClose }: ExchangeRateModalProps) {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [loading, setLoading] = useState(false)
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [lastUpdated, setLastUpdated] = useState<string>("")

  useEffect(() => {
    if (isOpen) {
      fetchExchangeRates()
    }
  }, [isOpen])

  const fetchExchangeRates = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/exchange-rates")
      const result = await response.json()

      if (result.success) {
        setExchangeRates(result.data)
        setLastUpdated(result.last_updated)
      }
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateExchangeRates = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/exchange-rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "fetch_latest" }),
      })

      const result = await response.json()

      if (result.success) {
        setExchangeRates(result.data)
        setLastUpdated(new Date().toISOString())
        alert("Exchange rates updated successfully!")
      } else {
        alert("Failed to update exchange rates: " + result.error)
      }
    } catch (error) {
      console.error("Failed to update exchange rates:", error)
      alert("Failed to update exchange rates")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (currency: string, currentRate: number) => {
    setEditingCurrency(currency)
    setEditValue(currentRate.toString())
  }

  const handleSave = async () => {
    if (!editingCurrency || !editValue) return

    try {
      setLoading(true)
      const response = await fetch("/api/exchange-rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update_manual",
          currency: editingCurrency,
          rate: editValue,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setExchangeRates(result.data)
        setEditingCurrency(null)
        setEditValue("")
        alert(`${editingCurrency} rate updated successfully!`)
      } else {
        alert("Failed to update rate: " + result.error)
      }
    } catch (error) {
      console.error("Failed to update rate:", error)
      alert("Failed to update rate")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingCurrency(null)
    setEditValue("")
  }

  const getCurrencyFlag = (currency: string) => {
    const flags: { [key: string]: string } = {
      USD: "🇺🇸",
      EUR: "🇪🇺",
      SRD: "🇸🇷",
    }
    return flags[currency] || "💱"
  }

  const getCurrencyName = (currency: string) => {
    const names: { [key: string]: string } = {
      USD: "US Dollar",
      EUR: "Euro",
      SRD: "Surinamese Dollar",
    }
    return names[currency] || currency
  }

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Exchange Rates
          </DialogTitle>
          <DialogDescription>
            View and manage currency exchange rates. Rates are updated daily from external API.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Last updated: {lastUpdated ? formatLastUpdated(lastUpdated) : "Never"}</span>
            </div>
            <Button onClick={updateExchangeRates} disabled={loading} size="sm" className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Update Rates
            </Button>
          </div>

          <Separator />

          {/* Exchange Rate Cards */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Current Exchange Rates</h3>
            </div>

            {loading && exchangeRates.length === 0 ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Loading exchange rates...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {exchangeRates.map((rate) => (
                  <Card key={`${rate.base_currency}-${rate.target_currency}`} className="hover-lift">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getCurrencyFlag(rate.target_currency)}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-lg">1 {rate.base_currency} =</span>
                              {editingCurrency === rate.target_currency ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    step="0.000001"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-32 h-8"
                                    autoFocus
                                  />
                                  <span className="font-semibold">{rate.target_currency}</span>
                                </div>
                              ) : (
                                <span className="font-bold text-xl text-green-600">
                                  {rate.rate.toFixed(6)} {rate.target_currency}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{getCurrencyName(rate.target_currency)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {rate.is_manual && (
                            <Badge variant="outline" className="text-xs">
                              Manual
                            </Badge>
                          )}

                          {editingCurrency === rate.target_currency ? (
                            <div className="flex gap-1">
                              <Button size="sm" onClick={handleSave} disabled={loading} className="h-8 w-8 p-0">
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                                className="h-8 w-8 p-0 bg-transparent"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            rate.target_currency !== "USD" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(rate.target_currency, rate.rate)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick Conversion Calculator */}
          <Separator />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Converter</CardTitle>
              <CardDescription>Convert between currencies using current rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                {exchangeRates.map((rate) => (
                  <div key={rate.target_currency} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg mb-1">{getCurrencyFlag(rate.target_currency)}</div>
                    <div className="font-semibold">{rate.target_currency}</div>
                    <div className="text-sm text-gray-600">
                      {rate.rate.toFixed(rate.target_currency === "USD" ? 2 : 6)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Exchange Rate Information</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Rates are automatically updated daily at midnight</li>
              <li>• Manual updates override automatic rates until next API sync</li>
              <li>• Data source: ExchangeRate-API.com</li>
              <li>• Base currency: USD (US Dollar)</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
