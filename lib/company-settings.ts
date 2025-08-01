"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CompanySettings {
  companyName: string
  address: string
  phone: string
  email: string
  taxNumber: string
  logoUrl: string
  website?: string
  bankDetails?: string
  paymentTerms?: string
  footerText?: string
}

interface CompanySettingsStore {
  settings: CompanySettings
  isLoading: boolean

  // Actions
  updateSettings: (settings: Partial<CompanySettings>) => void
  setLoading: (loading: boolean) => void
  resetSettings: () => void

  // Utility functions
  getFormattedAddress: () => string[]
  isConfigured: () => boolean
}

const defaultSettings: CompanySettings = {
  companyName: "Your Company Name",
  address: "123 Business St\nCity, State 12345",
  phone: "+1 (555) 123-4567",
  email: "contact@yourcompany.com",
  taxNumber: "TAX123456789",
  logoUrl: "",
  website: "",
  bankDetails: "",
  paymentTerms: "Payment is due within 30 days of invoice date.",
  footerText: "Thank you for your business!",
}

export const useCompanySettingsStore = create<CompanySettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isLoading: false,

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }))
      },

      setLoading: (loading) => set({ isLoading: loading }),

      resetSettings: () => set({ settings: defaultSettings }),

      getFormattedAddress: () => {
        const { settings } = get()
        return settings.address.split("\n").filter((line) => line.trim())
      },

      isConfigured: () => {
        const { settings } = get()
        return settings.companyName !== defaultSettings.companyName && settings.email !== defaultSettings.email
      },
    }),
    {
      name: "company-settings-storage",
    },
  ),
)
