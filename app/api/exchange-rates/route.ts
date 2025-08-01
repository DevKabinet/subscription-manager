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
}

// Mock database functions (in real app, these would connect to your database)
const mockExchangeRates: ExchangeRate[] = [
  { base_currency: "USD", target_currency: "USD", rate: 1.0, last_updated: new Date().toISOString(), is_manual: false },
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

async function fetchExchangeRatesFromAPI(): Promise<ExchangeRateResponse | null> {
  try {
    const response = await fetch("https://v6.exchangerate-api.com/v6/384d13f2f20a9ed8fe8b23b4/latest/USD")

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

async function saveExchangeRatesToDB(rates: ExchangeRateResponse): Promise<void> {
  // In a real application, this would save to your database
  // For now, we'll update our mock data
  const currencies = ["USD", "EUR", "SRD"]

  currencies.forEach((currency) => {
    const existingRateIndex = mockExchangeRates.findIndex(
      (rate) => rate.base_currency === "USD" && rate.target_currency === currency,
    )

    if (existingRateIndex !== -1 && !mockExchangeRates[existingRateIndex].is_manual) {
      mockExchangeRates[existingRateIndex] = {
        ...mockExchangeRates[existingRateIndex],
        rate: rates.conversion_rates[currency] || 1,
        last_updated: new Date().toISOString(),
      }
    }
  })

  console.log("Exchange rates updated in database")
}

export async function GET() {
  try {
    // Return current exchange rates from database (mock)
    return NextResponse.json({
      success: true,
      data: mockExchangeRates,
      last_updated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching exchange rates:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch exchange rates" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, currency, rate } = body

    if (action === "fetch_latest") {
      // Fetch latest rates from API and save to database
      const apiData = await fetchExchangeRatesFromAPI()

      if (apiData) {
        await saveExchangeRatesToDB(apiData)
        return NextResponse.json({
          success: true,
          message: "Exchange rates updated successfully",
          data: mockExchangeRates,
        })
      } else {
        return NextResponse.json({ success: false, error: "Failed to fetch rates from external API" }, { status: 500 })
      }
    }

    if (action === "update_manual" && currency && rate) {
      // Update specific currency rate manually
      const existingRateIndex = mockExchangeRates.findIndex(
        (r) => r.base_currency === "USD" && r.target_currency === currency,
      )

      if (existingRateIndex !== -1) {
        mockExchangeRates[existingRateIndex] = {
          ...mockExchangeRates[existingRateIndex],
          rate: Number.parseFloat(rate),
          last_updated: new Date().toISOString(),
          is_manual: true,
        }

        return NextResponse.json({
          success: true,
          message: `${currency} rate updated manually`,
          data: mockExchangeRates,
        })
      } else {
        return NextResponse.json({ success: false, error: "Currency not found" }, { status: 404 })
      }
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error processing exchange rate request:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
