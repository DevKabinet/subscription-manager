import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// This is a mock API call to simulate fetching real-time rates.
// In a real application, you would integrate with a third-party exchange rate API.
async function fetchRealTimeRatesFromExternalAPI() {
  // Replace with actual API call
  console.log("Fetching real-time rates from external API...")
  await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate network delay

  const mockRates = [
    { base_currency: "USD", target_currency: "EUR", rate: 0.925 },
    { base_currency: "USD", target_currency: "GBP", rate: 0.805 },
    { base_currency: "USD", target_currency: "JPY", rate: 151.5 },
    { base_currency: "USD", target_currency: "CAD", rate: 1.36 },
    { base_currency: "USD", target_currency: "AUD", rate: 1.53 },
    { base_currency: "USD", target_currency: "CHF", rate: 0.91 },
    { base_currency: "USD", target_currency: "CNY", rate: 7.25 },
    { base_currency: "USD", target_currency: "INR", rate: 83.2 },
    { base_currency: "USD", target_currency: "SRD", rate: 36.5 },
  ]
  return mockRates
}

export async function GET() {
  try {
    const realTimeRates = await fetchRealTimeRatesFromExternalAPI()

    for (const rate of realTimeRates) {
      // Use the upsert_exchange_rate function to update or insert rates
      // Set is_manual to FALSE as these are API updates
      await sql`SELECT upsert_exchange_rate(${rate.base_currency}, ${rate.target_currency}, ${rate.rate}, FALSE, 'Cron Job')`
    }

    return NextResponse.json({ message: "Exchange rates updated successfully by cron job." })
  } catch (error) {
    console.error("Error in cron job for exchange rates:", error)
    return NextResponse.json({ error: "Failed to update exchange rates via cron job." }, { status: 500 })
  }
}
