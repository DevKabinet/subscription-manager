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

export interface ExchangeRateHistoryEntry {
  id: number
  base_currency: string
  target_currency: string
  old_rate: number
  new_rate: number
  change_type: string
  updated_by?: string
  notes?: string
  created_at: string
}

interface ExchangeRateStore {
  rates: ExchangeRate[]
  history: ExchangeRateHistoryEntry[]
  lastFetched: string | null
  isLoading: boolean
  error: string | null

  // Actions
  setRates: (rates: ExchangeRate[]) => void
  updateRate: (
    baseCurrency: string,
    targetCurrency: string,
    rate: number,
    isManual?: boolean,
    updatedBy?: string,
  ) => void
  fetchRates: () => Promise<void>

  // Utility functions
  getRate: (from: string, to: string) => number
  convertAmount: (amount: number, from: string, to: string) => number
  getCurrencyFlag: (currency: string) => string
  getSupportedCurrencies: () => string[]
}

const currencyFlags: { [key: string]: string } = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  SRD: "🇸🇷",
  GBP: "🇬🇧",
  CAD: "🇨🇦",
  JPY: "🇯🇵",
  AUD: "🇦🇺",
  CHF: "🇨🇭",
  CNY: "🇨🇳",
  INR: "🇮🇳",
}

// Mock exchange rates - in production, this would come from an API
const mockRates: ExchangeRate[] = [
  {
    base_currency: "USD",
    target_currency: "USD",
    rate: 1.0,
    last_updated: "2024-01-15T10:00:00Z",
    is_manual: false,
  },
  {
    base_currency: "USD",
    target_currency: "EUR",
    rate: 0.85,
    last_updated: "2024-01-15T10:00:00Z",
    is_manual: false,
  },
  {
    base_currency: "USD",
    target_currency: "SRD",
    rate: 17.74,
    last_updated: "2024-01-15T10:00:00Z",
    is_manual: false,
  },
  {
    base_currency: "USD",
    target_currency: "GBP",
    rate: 0.79,
    last_updated: "2024-01-15T10:00:00Z",
    is_manual: false,
  },
  {
    base_currency: "USD",
    target_currency: "CAD",
    rate: 1.35,
    last_updated: "2024-01-15T10:00:00Z",
    is_manual: false,
  },
  {
    base_currency: "USD",
    target_currency: "JPY",
    rate: 110.25,
    last_updated: "2024-01-15T10:00:00Z",
    is_manual: false,
  },
  {
    base_currency: "USD",
    target_currency: "AUD",
    rate: 1.35,
    last_updated: "2024-01-15T10:00:00Z",
    is_manual: false,
  },
]

export const useExchangeRateStore = create<ExchangeRateStore>()(
  persist(
    (set, get) => ({
      rates: mockRates, // Initialize with the array
      history: [],
      lastFetched: null,
      isLoading: false,
      error: null,

      setRates: (rates) => set({ rates, lastFetched: new Date().toISOString(), error: null }),

      updateRate: (baseCurrency, targetCurrency, rate, isManual = true, updatedBy = "manual_user") => {
        const now = new Date().toISOString()
        set((state) => {
          const existingRateIndex = state.rates.findIndex(
            (r) => r.base_currency === baseCurrency && r.target_currency === targetCurrency,
          )

          let oldRate: number | undefined
          let updatedRates: ExchangeRate[]
          let newHistoryEntry: ExchangeRateHistoryEntry

          if (existingRateIndex !== -1) {
            const existingRate = state.rates[existingRateIndex]
            oldRate = existingRate.rate
            updatedRates = state.rates.map((r, index) =>
              index === existingRateIndex
                ? {
                    ...r,
                    rate,
                    is_manual: isManual,
                    last_updated: now,
                    manual_updated_at: isManual ? now : undefined,
                    manual_updated_by: isManual ? updatedBy : undefined,
                  }
                : r,
            )
            newHistoryEntry = {
              id: Date.now(),
              base_currency: baseCurrency,
              target_currency: targetCurrency,
              old_rate: oldRate,
              new_rate: rate,
              change_type: isManual ? "manual_update" : "api_update",
              updated_by: updatedBy,
              notes: isManual ? `Manual update by ${updatedBy}` : "API update",
              created_at: now,
            }
          } else {
            // If rate doesn't exist, add it
            const newRate: ExchangeRate = {
              base_currency: baseCurrency,
              target_currency: targetCurrency,
              rate,
              is_manual: isManual,
              last_updated: now,
              manual_updated_at: isManual ? now : undefined,
              manual_updated_by: isManual ? updatedBy : undefined,
            }
            updatedRates = [...state.rates, newRate]
            newHistoryEntry = {
              id: Date.now(),
              base_currency: baseCurrency,
              target_currency: targetCurrency,
              old_rate: 0, // Or some default for new entry
              new_rate: rate,
              change_type: "new_entry",
              updated_by: updatedBy,
              notes: `New rate added by ${updatedBy}`,
              created_at: now,
            }
          }

          return {
            rates: updatedRates,
            history: [newHistoryEntry, ...state.history].slice(0, 50), // Keep last 50 entries
          }
        })
      },

      fetchRates: async () => {
        set({ isLoading: true, error: null })
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // In production, this would be an actual API call
          // const response = await fetch('/api/exchange-rates')
          // const data = await response.json()

          const now = new Date().toISOString()
          const currentRates = get().rates // Get current rates to preserve manual updates

          // Simulate fetching updated rates, preserving manual updates if recent
          const fetchedRates = mockRates.map((mockRate) => {
            const existing = currentRates.find(
              (r) => r.base_currency === mockRate.base_currency && r.target_currency === mockRate.target_currency,
            )
            if (
              existing &&
              existing.is_manual &&
              existing.manual_updated_at &&
              new Date().getTime() - new Date(existing.manual_updated_at).getTime() < 24 * 60 * 60 * 1000
            ) {
              // If manually updated recently, keep the manual rate
              return existing
            }
            return { ...mockRate, last_updated: now, is_manual: false } // Otherwise, update from mock (simulated API)
          })

          set({
            rates: fetchedRates,
            lastFetched: now,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          console.error("Failed to fetch exchange rates:", error)
          set({ isLoading: false, error: error instanceof Error ? error.message : "Failed to fetch rates" })
        }
      },

      getRate: (from, to) => {
        if (from === to) return 1.0

        const { rates } = get()
        const rate = rates.find((r) => r.base_currency === from && r.target_currency === to)

        if (rate) return rate.rate

        // Try reverse conversion
        const reverseRate = rates.find((r) => r.base_currency === to && r.target_currency === from)
        if (reverseRate) return 1 / reverseRate.rate

        // Default fallback
        return 1.0
      },

      convertAmount: (amount, from, to) => {
        const rate = get().getRate(from, to)
        return amount * rate
      },

      getCurrencyFlag: (currency) => {
        return currencyFlags[currency] || "💱"
      },

      getSupportedCurrencies: () => {
        const { rates } = get()
        const currencies = new Set<string>()
        // Add defensive check here
        if (Array.isArray(rates)) {
          rates.forEach((rate) => {
            currencies.add(rate.target_currency)
          })
        }
        return Array.from(currencies).sort()
      },
    }),
    {
      name: "exchange-rates-storage",
      partialize: (state) => ({
        rates: state.rates,
        lastFetched: state.lastFetched,
        history: state.history, // Persist history
      }),
    },
  ),
)
