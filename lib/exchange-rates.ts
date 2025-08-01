"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ExchangeRate {
  currency: string
  rate: number
  lastUpdated: string
}

interface ExchangeRateState {
  rates: ExchangeRate[]
  lastFetched: string | null
  isLoading: boolean
  error: string | null
  fetchRates: () => Promise<void>
  updateRate: (currency: string, rate: number) => void
  getRate: (currency: string) => number
  getSupportedCurrencies: () => string[]
}

// Default exchange rates (USD as base)
const defaultRates: ExchangeRate[] = [
  { currency: "USD", rate: 1.0, lastUpdated: new Date().toISOString() },
  { currency: "EUR", rate: 0.85, lastUpdated: new Date().toISOString() },
  { currency: "GBP", rate: 0.73, lastUpdated: new Date().toISOString() },
  { currency: "JPY", rate: 110.0, lastUpdated: new Date().toISOString() },
  { currency: "CAD", rate: 1.25, lastUpdated: new Date().toISOString() },
  { currency: "AUD", rate: 1.35, lastUpdated: new Date().toISOString() },
  { currency: "CHF", rate: 0.92, lastUpdated: new Date().toISOString() },
  { currency: "CNY", rate: 6.45, lastUpdated: new Date().toISOString() },
]

export const useExchangeRateStore = create<ExchangeRateState>()(
  persist(
    (set, get) => ({
      rates: defaultRates,
      lastFetched: null,
      isLoading: false,
      error: null,

      fetchRates: async () => {
        set({ isLoading: true, error: null })

        try {
          // In a real app, this would fetch from an API
          // For now, we'll simulate an API call with some variation
          await new Promise((resolve) => setTimeout(resolve, 1000))

          const updatedRates = defaultRates.map((rate) => ({
            ...rate,
            rate: rate.currency === "USD" ? 1.0 : rate.rate * (0.95 + Math.random() * 0.1), // Add some variation
            lastUpdated: new Date().toISOString(),
          }))

          set({
            rates: updatedRates,
            lastFetched: new Date().toISOString(),
            isLoading: false,
          })
        } catch (error) {
          set({
            error: "Failed to fetch exchange rates",
            isLoading: false,
          })
        }
      },

      updateRate: (currency: string, rate: number) => {
        const { rates } = get()
        // Ensure rates is an array before proceeding
        if (!Array.isArray(rates)) {
          console.error("Rates is not an array:", rates)
          return
        }

        const updatedRates = rates.map((r) =>
          r.currency === currency ? { ...r, rate, lastUpdated: new Date().toISOString() } : r,
        )

        set({ rates: updatedRates })
      },

      getRate: (currency: string) => {
        const { rates } = get()
        // Ensure rates is an array before proceeding
        if (!Array.isArray(rates)) {
          console.error("Rates is not an array:", rates)
          return 1.0
        }

        const rate = rates.find((r) => r.currency === currency)
        return rate ? rate.rate : 1.0
      },

      getSupportedCurrencies: () => {
        const { rates } = get()
        // Defensive check to ensure rates is an array
        if (!Array.isArray(rates)) {
          console.error("Rates is not an array:", rates)
          return ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY"]
        }

        return rates.map((rate) => rate.currency)
      },
    }),
    {
      name: "exchange-rates-storage",
      partialize: (state) => ({
        rates: state.rates,
        lastFetched: state.lastFetched,
      }),
    },
  ),
)
