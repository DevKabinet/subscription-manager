"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CompanySettings {
  companyName: string
  address: string
  phone: string
  email: string
  website?: string
  taxNumber?: string
  bankDetails?: string
  paymentTerms?: string
  footerText?: string
  isSetupComplete: boolean
}

interface CompanySettingsStore {
  settings: CompanySettings
  updateSettings: (settings: Partial<CompanySettings>) => void
  resetSettings: () => void
}

const defaultSettings: CompanySettings = {
  companyName: "Your Company Name",
  address: "123 Business St\nCity, State 12345",
  phone: "+1 (555) 123-4567",
  email: "contact@yourcompany.com",
  website: "",
  taxNumber: "",
  bankDetails: "",
  paymentTerms: "",
  footerText: "Thank you for your business!",
  isSetupComplete: false,
}

export const useCompanySettingsStore = create<CompanySettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      updateSettings: (newSettings) => {
        const currentSettings = get().settings
        const updatedSettings = { ...currentSettings, ...newSettings }

        // Check if setup is complete
        const isSetupComplete = !!(
          updatedSettings.companyName &&
          updatedSettings.address &&
          updatedSettings.phone &&
          updatedSettings.email
        )

        set({
          settings: {
            ...updatedSettings,
            isSetupComplete,
          },
        })
      },

      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: "company-settings-storage",
    },
  ),
)
