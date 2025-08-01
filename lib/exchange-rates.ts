"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ExchangeRate {
  id: string
  baseCurrency: string
  targetCurrency: string
  rate: number
  lastUpdated: string
  isManual: boolean
  updatedBy?: string
}

export interface ExchangeRateChange {
  id: string
  baseCurrency: string
  targetCurrency: string
  oldRate: number
  newRate: number
  changeType: "manual" | "api" | "initial"
  updatedBy: string
  timestamp: string
  notes?: string
}

interface ExchangeRateState {
  rates: ExchangeRate[]
  changeLog: ExchangeRateChange[]
  lastFetched: string | null
  isLoading: boolean
  error: string | null
  fetchRates: () => Promise<void>
  updateRate: (targetCurrency: string, rate: number, updatedBy: string) => void
  getRate: (fromCurrency: string, toCurrency: string) => number
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => number
  getSupportedCurrencies: () => string[]
  getCurrencyFlag: (currency: string) => string
  getCurrencyName: (currency: string) => string
}

// Supported currencies
const SUPPORTED_CURRENCIES = ["USD", "EUR", "SRD"]

// Currency metadata
const CURRENCY_INFO = {
  USD: { name: "US Dollar", flag: "🇺🇸" },
  EUR: { name: "Euro", flag: "🇪🇺" },
  SRD: { name: "Surinamese Dollar", flag: "🇸🇷" },
}

// Default exchange rates (USD as base)
const defaultRates: ExchangeRate[] = [
  {
    id: "usd-usd",
    baseCurrency: "USD",
    targetCurrency: "USD",
    rate: 1.0,
    lastUpdated: new Date().toISOString(),
    isManual: false,
  },
  {
    id: "usd-eur",
    baseCurrency: "USD",
    targetCurrency: "EUR",
    rate: 0.85,
    lastUpdated: new Date().toISOString(),
    isManual: false,
  },
  {
    id: "usd-srd",
    baseCurrency: "USD",
    targetCurrency: "SRD",
    rate: 36.25,
    lastUpdated: new Date().toISOString(),
    isManual: false,
  },
]

export const useExchangeRateStore = create<ExchangeRateState>()(
  persist(
    (set, get) => ({
      rates: defaultRates,
      changeLog: [],
      lastFetched: null,
      isLoading: false,
      error: null,

      fetchRates: async () => {
        set({ isLoading: true, error: null })

        try {
          // Simulate API call with some variation
          await new Promise((resolve) => setTimeout(resolve, 1000))

          const { rates } = get()
          const now = new Date().toISOString()

          const updatedRates = rates.map((rate) => {
            if (rate.targetCurrency === "USD") return rate // USD rate is always 1.0

            // Add small random variation to simulate market changes
            const variation = 0.98 + Math.random() * 0.04 // ±2% variation
            const newRate = rate.isManual ? rate.rate : rate.rate * variation

            return {
              ...rate,
              rate: newRate,
              lastUpdated: now,
            }
          })

          set({
            rates: updatedRates,
            lastFetched: now,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: "Failed to fetch exchange rates",
            isLoading: false,
          })
        }
      },

      updateRate: (targetCurrency: string, rate: number, updatedBy: string) => {
        const { rates, changeLog } = get()
        const now = new Date().toISOString()

        // Find existing rate
        const existingRateIndex = rates.findIndex(
          (r) => r.baseCurrency === "USD" && r.targetCurrency === targetCurrency,
        )

        if (existingRateIndex === -1) return

        const existingRate = rates[existingRateIndex]
        const oldRate = existingRate.rate

        // Update the rate
        const updatedRates = [...rates]
        updatedRates[existingRateIndex] = {
          ...existingRate,
          rate,
          lastUpdated: now,
          isManual: true,
          updatedBy,
        }

        // Add to change log
        const changeEntry: ExchangeRateChange = {
          id: `change-${Date.now()}`,
          baseCurrency: "USD",
          targetCurrency,
          oldRate,
          newRate: rate,
          changeType: "manual",
          updatedBy,
          timestamp: now,
          notes: `Manual update from ${oldRate.toFixed(4)} to ${rate.toFixed(4)}`,
        }

        set({
          rates: updatedRates,
          changeLog: [changeEntry, ...changeLog].slice(0, 100), // Keep last 100 changes
        })
      },

      getRate: (fromCurrency: string, toCurrency: string) => {
        if (fromCurrency === toCurrency) return 1.0

        const { rates } = get()

        // Direct rate lookup
        const directRate = rates.find((r) => r.baseCurrency === fromCurrency && r.targetCurrency === toCurrency)
        if (directRate) return directRate.rate

        // Cross-currency conversion via USD
        if (fromCurrency !== "USD" && toCurrency !== "USD") {
          const fromUsdRate = rates.find((r) => r.baseCurrency === "USD" && r.targetCurrency === fromCurrency)
          const toUsdRate = rates.find((r) => r.baseCurrency === "USD" && r.targetCurrency === toCurrency)

          if (fromUsdRate && toUsdRate) {
            return toUsdRate.rate / fromUsdRate.rate
          }
        }

        // Reverse rate lookup
        const reverseRate = rates.find((r) => r.baseCurrency === toCurrency && r.targetCurrency === fromCurrency)
        if (reverseRate) return 1 / reverseRate.rate

        return 1.0 // Fallback
      },

      convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => {
        const rate = get().getRate(fromCurrency, toCurrency)
        return amount * rate
      },

      getSupportedCurrencies: () => {
        return SUPPORTED_CURRENCIES
      },

      getCurrencyFlag: (currency: string) => {
        return CURRENCY_INFO[currency as keyof typeof CURRENCY_INFO]?.flag || "💱"
      },

      getCurrencyName: (currency: string) => {
        return CURRENCY_INFO[currency as keyof typeof CURRENCY_INFO]?.name || currency
      },
    }),
    {
      name: "exchange-rates-storage",
      partialize: (state) => ({
        rates: state.rates,
        changeLog: state.changeLog,
        lastFetched: state.lastFetched,
      }),
    },
  ),
)
