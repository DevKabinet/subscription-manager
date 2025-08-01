"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ExchangeRate {
  currency: string
  rate: number
  lastUpdated: string
  isManuallyUpdated: boolean
  manuallyUpdatedAt?: string
  manuallyUpdatedBy?: string
}

interface ExchangeRateState {
  rates: Record<string, ExchangeRate>
  baseCurrency: string
  lastFetched: string | null
  isLoading: boolean

  // Actions
  fetchRates: () => Promise<void>
  updateRate: (currency: string, rate: number, isManual?: boolean) => void
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => number
  getRate: (currency: string) => number
  setBaseCurrency: (currency: string) => void
}

// Mock exchange rates - in production, this would come from an API
const mockRates: Record<string, ExchangeRate> = {
  EUR: {
    currency: "EUR",
    rate: 0.85,
    lastUpdated: "2024-01-15T10:00:00Z",
    isManuallyUpdated: false,
  },
  GBP: {
    currency: "GBP",
    rate: 0.73,
    lastUpdated: "2024-01-15T10:00:00Z",
    isManuallyUpdated: false,
  },
  JPY: {
    currency: "JPY",
    rate: 110.25,
    lastUpdated: "2024-01-15T10:00:00Z",
    isManuallyUpdated: false,
  },
  CAD: {
    currency: "CAD",
    rate: 1.25,
    lastUpdated: "2024-01-15T10:00:00Z",
    isManuallyUpdated: false,
  },
  AUD: {
    currency: "AUD",
    rate: 1.35,
    lastUpdated: "2024-01-15T10:00:00Z",
    isManuallyUpdated: false,
  },
}

export const useExchangeRateStore = create<ExchangeRateState>()(
  persist(
    (set, get) => ({
      rates: mockRates,
      baseCurrency: "USD",
      lastFetched: null,
      isLoading: false,

      fetchRates: async () => {
        set({ isLoading: true })

        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // In production, this would be an actual API call
          // const response = await fetch('/api/exchange-rates')
          // const data = await response.json()

          const now = new Date().toISOString()
          const { rates } = get()

          // Only update rates that haven't been manually updated recently
          const updatedRates = { ...rates }

          Object.keys(mockRates).forEach((currency) => {
            const existingRate = rates[currency]
            const shouldUpdate =
              !existingRate?.isManuallyUpdated ||
              (existingRate.manuallyUpdatedAt &&
                new Date().getTime() - new Date(existingRate.manuallyUpdatedAt).getTime() > 24 * 60 * 60 * 1000)

            if (shouldUpdate) {
              updatedRates[currency] = {
                ...mockRates[currency],
                lastUpdated: now,
                isManuallyUpdated: false,
              }
            }
          })

          set({
            rates: updatedRates,
            lastFetched: now,
            isLoading: false,
          })
        } catch (error) {
          console.error("Failed to fetch exchange rates:", error)
          set({ isLoading: false })
        }
      },

      updateRate: (currency: string, rate: number, isManual = false) => {
        const now = new Date().toISOString()

        set((state) => ({
          rates: {
            ...state.rates,
            [currency]: {
              currency,
              rate,
              lastUpdated: now,
              isManuallyUpdated: isManual,
              manuallyUpdatedAt: isManual ? now : state.rates[currency]?.manuallyUpdatedAt,
              manuallyUpdatedBy: isManual ? "current-user" : state.rates[currency]?.manuallyUpdatedBy,
            },
          },
        }))
      },

      convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => {
        const { rates, baseCurrency } = get()

        if (fromCurrency === toCurrency) return amount

        // Convert to base currency first
        let baseAmount = amount
        if (fromCurrency !== baseCurrency) {
          const fromRate = rates[fromCurrency]?.rate || 1
          baseAmount = amount / fromRate
        }

        // Convert from base currency to target currency
        if (toCurrency === baseCurrency) {
          return baseAmount
        }

        const toRate = rates[toCurrency]?.rate || 1
        return baseAmount * toRate
      },

      getRate: (currency: string) => {
        const { rates, baseCurrency } = get()
        if (currency === baseCurrency) return 1
        return rates[currency]?.rate || 1
      },

      setBaseCurrency: (currency: string) => {
        set({ baseCurrency: currency })
      },
    }),
    {
      name: "exchange-rates-storage",
    },
  ),
)
