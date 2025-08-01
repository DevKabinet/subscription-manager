"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ExchangeRate {
  base_currency: string
  target_currency: string
  rate: number
  last_updated: string
  is_manual: boolean
  manual_updated_at?: string
  manual_updated_by?: string
}

export interface ExchangeRateHistory {
  base_currency: string
  target_currency: string
  old_rate: number
  new_rate: number
  change_type: string
  updated_by?: string
  notes?: string
  created_at?: string
}

interface ExchangeRateStore {
  rates: ExchangeRate[]
  history: ExchangeRateHistory[]
  lastUpdated: string
  isLoading: boolean

  // Actions
  setRates: (rates: ExchangeRate[]) => void
  setHistory: (history: ExchangeRateHistory[]) => void
  setLastUpdated: (timestamp: string) => void
  setLoading: (loading: boolean) => void

  // Utility functions
  getRate: (fromCurrency: string, toCurrency: string) => number
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => number
  getCurrencyFlag: (currency: string) => string
  getCurrencyName: (currency: string) => string
  getSupportedCurrencies: () => string[]

  // API functions
  fetchRates: () => Promise<void>
  updateRate: (currency: string, rate: number, updatedBy: string) => Promise<void>
  refreshRates: () => Promise<void>
}

export const useExchangeRateStore = create<ExchangeRateStore>()(
  persist(
    (set, get) => ({
      rates: [
        {
          base_currency: "USD",
          target_currency: "USD",
          rate: 1.0,
          last_updated: new Date().toISOString(),
          is_manual: false,
        },
        {
          base_currency: "USD",
          target_currency: "EUR",
          rate: 0.85,
          last_updated: new Date().toISOString(),
          is_manual: false,
        },
        {
          base_currency: "USD",
          target_currency: "SRD",
          rate: 35.5,
          last_updated: new Date().toISOString(),
          is_manual: false,
        },
      ],
      history: [],
      lastUpdated: new Date().toISOString(),
      isLoading: false,

      setRates: (rates) => set({ rates }),
      setHistory: (history) => set({ history }),
      setLastUpdated: (timestamp) => set({ lastUpdated: timestamp }),
      setLoading: (loading) => set({ isLoading: loading }),

      getRate: (fromCurrency, toCurrency) => {
        if (fromCurrency === toCurrency) return 1.0

        const { rates } = get()

        // Direct conversion from USD
        if (fromCurrency === "USD") {
          const rate = rates.find((r) => r.target_currency === toCurrency)
          return rate?.rate || 1.0
        }

        // Conversion to USD
        if (toCurrency === "USD") {
          const rate = rates.find((r) => r.target_currency === fromCurrency)
          return rate ? 1 / rate.rate : 1.0
        }

        // Cross-currency conversion via USD
        const fromRate = rates.find((r) => r.target_currency === fromCurrency)
        const toRate = rates.find((r) => r.target_currency === toCurrency)

        if (fromRate && toRate) {
          return toRate.rate / fromRate.rate
        }

        return 1.0
      },

      convertAmount: (amount, fromCurrency, toCurrency) => {
        const rate = get().getRate(fromCurrency, toCurrency)
        return amount * rate
      },

      getCurrencyFlag: (currency) => {
        const flags: { [key: string]: string } = {
          USD: "🇺🇸",
          EUR: "🇪🇺",
          SRD: "🇸🇷",
        }
        return flags[currency] || "💱"
      },

      getCurrencyName: (currency) => {
        const names: { [key: string]: string } = {
          USD: "US Dollar",
          EUR: "Euro",
          SRD: "Surinamese Dollar",
        }
        return names[currency] || currency
      },

      getSupportedCurrencies: () => {
        const { rates } = get()
        return rates.map((rate) => rate.target_currency)
      },

      fetchRates: async () => {
        try {
          set({ isLoading: true })
          const response = await fetch("/api/exchange-rates")
          const result = await response.json()

          if (result.success) {
            set({
              rates: result.data,
              history: result.history || [],
              lastUpdated: result.last_updated || new Date().toISOString(),
            })
          }
        } catch (error) {
          console.error("Failed to fetch exchange rates:", error)
        } finally {
          set({ isLoading: false })
        }
      },

      updateRate: async (currency, rate, updatedBy) => {
        try {
          set({ isLoading: true })
          const response = await fetch("/api/exchange-rates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "update_manual",
              currency,
              rate,
              updated_by: updatedBy,
            }),
          })

          const result = await response.json()
          if (result.success) {
            set({
              rates: result.data,
              history: result.history || [],
              lastUpdated: new Date().toISOString(),
            })
          }
        } catch (error) {
          console.error("Failed to update exchange rate:", error)
        } finally {
          set({ isLoading: false })
        }
      },

      refreshRates: async () => {
        try {
          set({ isLoading: true })
          const response = await fetch("/api/exchange-rates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "fetch_latest",
              updated_by: "manual_refresh",
            }),
          })

          const result = await response.json()
          if (result.success) {
            set({
              rates: result.data,
              history: result.history || [],
              lastUpdated: new Date().toISOString(),
            })
          }
        } catch (error) {
          console.error("Failed to refresh exchange rates:", error)
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: "exchange-rates-storage",
      partialize: (state) => ({
        rates: state.rates,
        history: state.history,
        lastUpdated: state.lastUpdated,
      }),
    },
  ),
)
