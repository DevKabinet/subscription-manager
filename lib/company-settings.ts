"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CompanySettings {
  companyName: string
  address: string
  phone: string
  email: string
  taxNumber: string
  website?: string
  logoUrl: string
  bankDetails?: string
  paymentTerms?: string
  footerText?: string
}

interface CompanySettingsState {
  settings: CompanySettings
  updateSettings: (newSettings: CompanySettings) => void
  isSetupComplete: boolean
}

const defaultSettings: CompanySettings = {
  companyName: "",
  address: "",
  phone: "",
  email: "",
  taxNumber: "",
  website: "",
  logoUrl: "",
  bankDetails: "",
  paymentTerms: "Payment is due within 30 days of invoice date.",
  footerText: "Thank you for your business!",
}

export const useCompanySettingsStore = create<CompanySettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      updateSettings: (newSettings: CompanySettings) => {
        set({ settings: newSettings })
      },

      get isSetupComplete() {
        const { settings } = get()
        return !!(settings.companyName && settings.address && settings.phone && settings.email)
      },
    }),
    {
      name: "company-settings-storage",
    },
  ),
)
