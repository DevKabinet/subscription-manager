import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

interface ExchangeRateResponse {
  result: string
  base_code: string
  conversion_rates: {
    [key: string]: number
  }
  time_last_update_unix: number
}

interface ExchangeRate {
  base_currency: string
  target_currency: string
  rate: number
  last_updated: string
  is_manual: boolean
  manual_updated_at?: string
  manual_updated_by?: string
}

interface ExchangeRateHistory {
  base_currency: string
  target_currency: string
  old_rate: number
  new_rate: number
  change_type: string
  updated_by?: string
  notes?: string
}

// Mock database functions (in real app, these would connect to your database)
const mockExchangeRates: ExchangeRate[] = [
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
]

const mockExchangeRateHistory: ExchangeRateHistory[] = []

async function fetchExchangeRatesFromAPI(): Promise<ExchangeRateResponse | null> {
  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${process.env.NEXT_PUBLIC_EXCHANGE_API}/latest/USD`,
    )

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data: ExchangeRateResponse = await response.json()
    return data
  } catch (error) {
    console.error("Failed to fetch exchange rates from API:", error)
    return null
  }
}

function isManuallyUpdatedRecently(rate: ExchangeRate, hoursThreshold = 24): boolean {
  if (!rate.is_manual || !rate.manual_updated_at) {
    return false
  }

  const manualUpdateTime = new Date(rate.manual_updated_at)
  const now = new Date()
  const hoursDiff = (now.getTime() - manualUpdateTime.getTime()) / (1000 * 60 * 60)

  return hoursDiff <= hoursThreshold
}

async function saveExchangeRatesToDB(rates: ExchangeRateResponse, updatedBy = "api_cron"): Promise<void> {
  const currencies = ["USD", "EUR", "SRD"]
  const updatedRates: string[] = []
  const skippedRates: string[] = []

  currencies.forEach((currency) => {
    const existingRateIndex = mockExchangeRates.findIndex(
      (rate) => rate.base_currency === "USD" && rate.target_currency === currency,
    )

    if (existingRateIndex !== -1) {
      const existingRate = mockExchangeRates[existingRateIndex]
      const newRate = rates.conversion_rates[currency] || 1

      // Check if this rate was manually updated recently (within 24 hours)
      const wasManuallyUpdated = isManuallyUpdatedRecently(existingRate, 24)

      if (wasManuallyUpdated) {
        // Skip updating this rate and log it
        skippedRates.push(`${currency} (manual override active)`)
        console.log(`Skipping ${currency} rate update - manual override active since ${existingRate.manual_updated_at}`)
      } else {
        // Safe to update with API rate
        const oldRate = existingRate.rate

        // Add to history if rate changed significantly (more than 0.1% change)
        const changePercent = Math.abs((newRate - oldRate) / oldRate) * 100
        if (changePercent > 0.1) {
          mockExchangeRateHistory.push({
            base_currency: "USD",
            target_currency: currency,
            old_rate: oldRate,
            new_rate: newRate,
            change_type: "api_update",
            updated_by: updatedBy,
            notes: `Automatic update from API - ${changePercent.toFixed(2)}% change`,
          })
        }

        // Update the rate
        mockExchangeRates[existingRateIndex] = {
          ...existingRate,
          rate: newRate,
          last_updated: new Date().toISOString(),
          is_manual: false, // Reset manual flag since this is from API
          manual_updated_at: undefined,
          manual_updated_by: undefined,
        }

        updatedRates.push(`${currency}: ${oldRate.toFixed(6)} → ${newRate.toFixed(6)}`)
      }
    }
  })

  console.log("Exchange rates update summary:")
  console.log("Updated rates:", updatedRates.length > 0 ? updatedRates : "None")
  console.log("Skipped rates:", skippedRates.length > 0 ? skippedRates : "None")
}

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const rates = await sql`SELECT * FROM exchange_rates`
    const history = await sql`SELECT * FROM exchange_rate_history ORDER BY created_at DESC LIMIT 50`
    return NextResponse.json({ rates, history })
  } catch (error) {
    console.error("Error fetching exchange rates:", error)
    return NextResponse.json({ error: "Failed to fetch exchange rates" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { base_currency, target_currency, rate, is_manual, updated_by } = await request.json()

    if (!base_currency || !target_currency || rate === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Call the upsert function in the database
    await sql`SELECT upsert_exchange_rate(${base_currency}, ${target_currency}, ${rate}, ${is_manual || false}, ${updated_by || null})`

    return NextResponse.json({ message: "Exchange rate updated successfully" })
  } catch (error) {
    console.error("Error updating exchange rate:", error)
    return NextResponse.json({ error: "Failed to update exchange rate" }, { status: 500 })
  }
}
