"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useExchangeRateStore } from "@/lib/exchange-rates"
import { RefreshCw, Save, History, DollarSign } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"

interface ExchangeRateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExchangeRateModal({ isOpen, onClose }: ExchangeRateModalProps) {
  const { rates, history, isLoading, error, fetchRates, updateRate, getCurrencyFlag, getSupportedCurrencies } =
    useExchangeRateStore()
  const [newRates, setNewRates] = useState<{ [key: string]: string }>({})
  const [selectedBaseCurrency, setSelectedBaseCurrency] = useState("USD")

  useEffect(() => {
    if (isOpen) {
      fetchRates()
      // Initialize newRates with current rates for editing
      const initialNewRates: { [key: string]: string } = {}
      rates.forEach((rate) => {
        if (rate.base_currency === selectedBaseCurrency) {
          initialNewRates[rate.target_currency] = rate.rate.toString()
        }
      })
      setNewRates(initialNewRates)
    }
  }, [isOpen, rates, fetchRates, selectedBaseCurrency])

  const handleRateChange = (currency: string, value: string) => {
    setNewRates((prev) => ({ ...prev, [currency]: value }))
  }

  const handleSaveRate = (targetCurrency: string) => {
    const rateValue = Number.parseFloat(newRates[targetCurrency])
    if (!isNaN(rateValue) && rateValue > 0) {
      updateRate(selectedBaseCurrency, targetCurrency, rateValue, true, "Admin User")
      // Optionally refetch rates to ensure consistency, or rely on store update
      // fetchRates();
    } else {
      alert("Please enter a valid positive number for the exchange rate.")
    }
  }

  const filteredRates = rates.filter((rate) => rate.base_currency === selectedBaseCurrency)
  const availableCurrencies = getSupportedCurrencies()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-600" /> Exchange Rate Management
          </DialogTitle>
          <DialogDescription>Manage and view historical exchange rates for your business.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="current" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Current Rates</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="base-currency">Base Currency:</Label>
                <select
                  id="base-currency"
                  value={selectedBaseCurrency}
                  onChange={(e) => setSelectedBaseCurrency(e.target.value)}
                  className="p-2 border rounded-md"
                >
                  {availableCurrencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {getCurrencyFlag(currency)} {currency}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={fetchRates} disabled={isLoading} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh Rates
              </Button>
            </div>

            {error && <div className="text-red-500 text-center mb-4">{error}</div>}

            <div className="flex-1 overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency</TableHead>
                    <TableHead>Rate (1 {selectedBaseCurrency} = ?)</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Manual Update</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading exchange rates...
                      </TableCell>
                    </TableRow>
                  ) : filteredRates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No exchange rates available for {selectedBaseCurrency}.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRates.map((rate) => (
                      <TableRow key={rate.target_currency}>
                        <TableCell className="font-medium">
                          {getCurrencyFlag(rate.target_currency)} {rate.target_currency}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.0001"
                              value={newRates[rate.target_currency] || rate.rate.toString()}
                              onChange={(e) => handleRateChange(rate.target_currency, e.target.value)}
                              className="w-32"
                            />
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(rate.last_updated), "MMM dd, yyyy HH:mm")}</TableCell>
                        <TableCell>
                          {rate.is_manual ? (
                            <span className="text-blue-600">Yes</span>
                          ) : (
                            <span className="text-gray-500">No</span>
                          )}
                          {rate.manual_updated_at && (
                            <div className="text-xs text-gray-500">
                              by {rate.manual_updated_by} on {format(new Date(rate.manual_updated_at), "MMM dd, yyyy")}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveRate(rate.target_currency)}
                            disabled={
                              isNaN(Number.parseFloat(newRates[rate.target_currency])) ||
                              Number.parseFloat(newRates[rate.target_currency]) <= 0 ||
                              Number.parseFloat(newRates[rate.target_currency]) === rate.rate
                            }
                          >
                            <Save className="h-4 w-4 mr-2" /> Save
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <History className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Exchange Rate History</h3>
            </div>
            <div className="flex-1 overflow-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Currency Pair</TableHead>
                    <TableHead>Old Rate</TableHead>
                    <TableHead>New Rate</TableHead>
                    <TableHead>Change Type</TableHead>
                    <TableHead>Updated By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No history available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{format(new Date(entry.created_at), "MMM dd, yyyy HH:mm")}</TableCell>
                        <TableCell>
                          {entry.base_currency}/{entry.target_currency}
                        </TableCell>
                        <TableCell>{entry.old_rate.toFixed(4)}</TableCell>
                        <TableCell>{entry.new_rate.toFixed(4)}</TableCell>
                        <TableCell>{entry.change_type.replace(/_/g, " ")}</TableCell>
                        <TableCell>{entry.updated_by || "N/A"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
