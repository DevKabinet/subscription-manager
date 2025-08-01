"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useExchangeRateStore } from "@/lib/exchange-rates"
import { RefreshCw, Save, X } from "lucide-react"

interface ExchangeRateModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExchangeRateModal({ isOpen, onClose }: ExchangeRateModalProps) {
  const { rates, history, isLoading, error, fetchRates, updateRate, getCurrencyFlag, getSupportedCurrencies } =
    useExchangeRateStore()

  const [newRateValue, setNewRateValue] = React.useState<string>("")
  const [selectedCurrency, setSelectedCurrency] = React.useState<string>("EUR")

  const handleUpdateRate = () => {
    const rate = Number.parseFloat(newRateValue)
    if (!isNaN(rate) && rate > 0) {
      updateRate("USD", selectedCurrency, rate, true, "Admin") // Assuming "Admin" as current user for manual update
      setNewRateValue("")
    }
  }

  const supportedCurrencies = getSupportedCurrencies().filter((currency) => currency !== "USD")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Exchange Rate Management</DialogTitle>
          <DialogDescription>
            Manage and view historical exchange rates. Rates are updated automatically, but can be manually adjusted.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="current-rates" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current-rates">Current Rates</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="current-rates" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Current Exchange Rates (Base: USD)</h3>
              <Button onClick={fetchRates} disabled={isLoading} size="sm">
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Updating..." : "Refresh Rates"}
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency</TableHead>
                    <TableHead>Rate (1 USD = X)</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rates
                    .filter((rate) => rate.target_currency !== "USD")
                    .map((rate) => (
                      <TableRow key={rate.target_currency}>
                        <TableCell className="font-medium">
                          {getCurrencyFlag(rate.target_currency)} {rate.target_currency}
                        </TableCell>
                        <TableCell>{rate.rate.toFixed(4)}</TableCell>
                        <TableCell>
                          {new Date(rate.last_updated).toLocaleDateString()}
                          {" at "}
                          {new Date(rate.last_updated).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>{rate.is_manual ? `Manual (${rate.manual_updated_by || "N/A"})` : "API"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCurrency(rate.target_currency)
                              setNewRateValue(rate.rate.toString())
                            }}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  {rates.filter((rate) => rate.target_currency !== "USD").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No exchange rates available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-6 space-y-4">
              <h4 className="text-md font-semibold">Manually Update Rate</h4>
              <div className="flex items-end gap-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="currency-select">Currency</Label>
                  <select
                    id="currency-select"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {supportedCurrencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {getCurrencyFlag(currency)} {currency}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1.5 flex-1">
                  <Label htmlFor="new-rate">New Rate (1 USD = X {selectedCurrency})</Label>
                  <Input
                    id="new-rate"
                    type="number"
                    step="0.0001"
                    placeholder="e.g., 0.92"
                    value={newRateValue}
                    onChange={(e) => setNewRateValue(e.target.value)}
                  />
                </div>
                <Button onClick={handleUpdateRate} disabled={!newRateValue || isNaN(Number.parseFloat(newRateValue))}>
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <h3 className="text-lg font-semibold mb-4">Exchange Rate History</h3>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Base</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Old Rate</TableHead>
                    <TableHead>New Rate</TableHead>
                    <TableHead>Change Type</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length > 0 ? (
                    history.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.base_currency}</TableCell>
                        <TableCell>{entry.target_currency}</TableCell>
                        <TableCell>{entry.old_rate.toFixed(4)}</TableCell>
                        <TableCell>{entry.new_rate.toFixed(4)}</TableCell>
                        <TableCell>{entry.change_type.replace(/_/g, " ")}</TableCell>
                        <TableCell>{entry.updated_by || "System"}</TableCell>
                        <TableCell>
                          {new Date(entry.created_at).toLocaleDateString()}{" "}
                          {new Date(entry.created_at).toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No history available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" /> Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
