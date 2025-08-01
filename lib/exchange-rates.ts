"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ExchangeRate {
  base_currency: string
  target_currency: string
  rate: number
  last_updated: string
  is_manual: boolean
}

interface ExchangeRateStore {
  rates: ExchangeRate[]
  lastFetched: string | null
  isLoading: boolean
  error: string | null

  // Actions
  setRates: (rates: ExchangeRate[]) => void
  updateRate: (baseCurrency: string, targetCurrency: string, rate: number, isManual?: boolean) => void
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
          rate: 17.74,
          last_updated: new Date().toISOString(),
          is_manual: false,
        },
        {
          base_currency: "USD",
          target_currency: "GBP",
          rate: 0.79,
          last_updated: new Date().toISOString(),
          is_manual: false,
        },
        {
          base_currency: "USD",
          target_currency: "CAD",
          rate: 1.35,
          last_updated: new Date().toISOString(),
          is_manual: false,
        },
      ],
      lastFetched: null,
      isLoading: false,
      error: null,

      setRates: (rates) => set({ rates, lastFetched: new Date().toISOString(), error: null }),

      updateRate: (baseCurrency, targetCurrency, rate, isManual = true) => {
        const { rates } = get()
        const updatedRates = rates.map((r) =>
          r.base_currency === baseCurrency && r.target_currency === targetCurrency
            ? { ...r, rate, is_manual: isManual, last_updated: new Date().toISOString() }
            : r,
        )

        // If rate doesn't exist, add it
        const exists = rates.some((r) => r.base_currency === baseCurrency && r.target_currency === targetCurrency)
        if (!exists) {
          updatedRates.push({
            base_currency: baseCurrency,
            target_currency: targetCurrency,
            rate,
            is_manual: isManual,
            last_updated: new Date().toISOString(),
          })
        }

        set({ rates: updatedRates })
      },

      fetchRates: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch("/api/exchange-rates")
          const result = await response.json()

          if (result.success) {
            set({
              rates: result.data,
              lastFetched: new Date().toISOString(),
              isLoading: false,
              error: null,
            })
          } else {
            throw new Error(result.error || "Failed to fetch rates")
          }
        } catch (error) {
          console.error("Failed to fetch exchange rates:", error)
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to fetch rates",
          })
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
        rates.forEach((rate) => {
          currencies.add(rate.target_currency)
        })
        return Array.from(currencies).sort()
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
