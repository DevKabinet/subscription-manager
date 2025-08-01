"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, Edit, X, TrendingUp, Clock, DollarSign, History, Shield, Check } from "lucide-react"
import { useExchangeRateStore } from "@/lib/exchange-rates"

interface ExchangeRateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExchangeRateModal({ isOpen, onClose }: ExchangeRateModalProps) {
  const {
    rates,
    history,
    lastUpdated,
    isLoading,
    fetchRates,
    updateRate,
    refreshRates,
    getCurrencyFlag,
    getCurrencyName,
  } = useExchangeRateStore()

  const [editingCurrency, setEditingCurrency] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  useEffect(() => {
    if (isOpen && rates.length <= 3) {
      fetchRates()
    }
  }, [isOpen, fetchRates, rates.length])

  const handleEdit = (currency: string, currentRate: number) => {
    setEditingCurrency(currency)
    setEditValue(currentRate.toString())
  }

  const handleSave = async () => {
    if (!editingCurrency || !editValue) return

    await updateRate(editingCurrency, Number.parseFloat(editValue), "user_manual")
    setEditingCurrency(null)
    setEditValue("")
  }

  const handleCancel = () => {
    setEditingCurrency(null)
    setEditValue("")
  }

  const handleRefresh = async () => {
    await refreshRates()
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

  const isManuallyProtected = (rate: any) => {
    if (!rate.is_manual || !rate.manual_updated_at) return false

    const manualUpdateTime = new Date(rate.manual_updated_at)
    const now = new Date()
    const hoursDiff = (now.getTime() - manualUpdateTime.getTime()) / (1000 * 60 * 60)

    return hoursDiff <= 24
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Global Exchange Rates Management
          </DialogTitle>
          <DialogDescription>Manage global currency exchange rates used throughout the application</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="rates" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rates">Current Rates</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="rates" className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Last updated: {lastUpdated ? formatLastUpdated(lastUpdated) : "Never"}</span>
              </div>
              <Button onClick={handleRefresh} disabled={isLoading} size="sm" className="flex items-center gap-2">
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Update Global Rates
              </Button>
            </div>

            {/* Global Usage Alert */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Global Exchange Rates:</strong> These rates are used throughout the entire application for all
                currency conversions in payments, invoices, and reports. Changes here will affect all future
                transactions.
              </AlertDescription>
            </Alert>

            <Separator />

            {/* Exchange Rate Cards */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Global Exchange Rates</h3>
              </div>

              {isLoading && rates.length === 0 ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">Loading global exchange rates...</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {rates.map((rate) => {
                    const isProtected = isManuallyProtected(rate)
                    return (
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
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-gray-600">{getCurrencyName(rate.target_currency)}</p>
                                  {isProtected && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs flex items-center gap-1 bg-red-100 text-red-300"
                                    >
                                      <Shield className="h-3 w-3" />
                                      Protected
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex gap-1 flex-row-reverse items-center">
                                {rate.is_manual && (
                                  <Badge variant="outline" className="text-xs">
                                    Manual
                                  </Badge>
                                )}
                                {rate.manual_updated_at && (
                                  <span className="text-xs text-gray-500">
                                    {formatLastUpdated(rate.manual_updated_at)}
                                  </span>
                                )}
                              </div>

                              {editingCurrency === rate.target_currency ? (
                                <div className="flex gap-1">
                                  <Button size="sm" onClick={handleSave} disabled={isLoading} className="h-8 w-8 p-0">
                                    <Check className="h-4 w-4" />
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
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEdit(rate.target_currency, rate.rate)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          {isProtected && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                              <Shield className="h-3 w-3 inline mr-1" />
                              This rate is protected from API updates until{" "}
                              {new Date(
                                new Date(rate.manual_updated_at!).getTime() + 24 * 60 * 60 * 1000,
                              ).toLocaleString()}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Quick Conversion Calculator */}
            <Separator />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Global Currency Converter</CardTitle>
                <CardDescription>Convert between currencies using current global rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {rates.map((rate) => (
                    <div key={rate.target_currency} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg mb-1">{getCurrencyFlag(rate.target_currency)}</div>
                      <div className="font-semibold">{rate.target_currency}</div>
                      <div className="text-sm text-gray-600">
                        {rate.rate.toFixed(rate.target_currency === "USD" ? 2 : 6)}
                      </div>
                      {rate.is_manual && (
                        <Badge variant="outline" className="text-xs mt-1">
                          Manual
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <History className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Exchange Rate History</h3>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No history available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-lg">{getCurrencyFlag(entry.target_currency)}</div>
                          <div>
                            <div className="font-medium">
                              {entry.target_currency} Rate{" "}
                              {entry.change_type === "manual_update"
                                ? "Updated Manually"
                                : entry.change_type === "api_update"
                                  ? "Updated by API"
                                  : "Reset"}
                            </div>
                            <div className="text-sm text-gray-600">
                              {entry.old_rate.toFixed(6)} → {entry.new_rate.toFixed(6)}
                              {entry.change_type !== "manual_reset" && (
                                <span
                                  className={`ml-2 ${entry.new_rate > entry.old_rate ? "text-green-600" : "text-red-600"}`}
                                >
                                  ({entry.new_rate > entry.old_rate ? "+" : ""}
                                  {(((entry.new_rate - entry.old_rate) / entry.old_rate) * 100).toFixed(2)}%)
                                </span>
                              )}
                            </div>
                            {entry.notes && <div className="text-xs text-gray-500 mt-1">{entry.notes}</div>}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>By: {entry.updated_by || "System"}</div>
                          <div>{entry.created_at ? new Date(entry.created_at).toLocaleString() : "Recently"}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Global Usage Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Global Exchange Rate System</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • <strong>Application-Wide:</strong> These rates are used in all payments, invoices, and reports
            </li>
            <li>
              • <strong>Automatic Updates:</strong> Rates are updated daily at midnight via API
            </li>
            <li>
              • <strong>Manual Override Protection:</strong> Manual rates are protected for 24 hours
            </li>
            <li>
              • <strong>Real-Time Conversion:</strong> All currency conversions use these current rates
            </li>
            <li>
              • <strong>Historical Tracking:</strong> All rate changes are logged with timestamps
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
