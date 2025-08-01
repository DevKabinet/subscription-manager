import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function GET() {
  // In a real application, you would fetch actual exchange rates from a third-party API here.
  // For this example, we'll simulate fetching and updating.
  const mockApiRates = [
    { base_currency: "USD", target_currency: "EUR", rate: 0.92 + (Math.random() * 0.02 - 0.01) }, // +/- 0.01
    { base_currency: "USD", target_currency: "GBP", rate: 0.79 + (Math.random() * 0.02 - 0.01) },
    { base_currency: "USD", target_currency: "JPY", rate: 155.0 + (Math.random() * 2 - 1) },
    { base_currency: "USD", target_currency: "CAD", rate: 1.37 + (Math.random() * 0.02 - 0.01) },
    { base_currency: "USD", target_currency: "AUD", rate: 1.5 + (Math.random() * 0.02 - 0.01) },
    { base_currency: "USD", target_currency: "CHF", rate: 0.9 + (Math.random() * 0.02 - 0.01) },
    { base_currency: "USD", target_currency: "CNY", rate: 7.25 + (Math.random() * 0.02 - 0.01) },
    { base_currency: "USD", target_currency: "INR", rate: 83.5 + (Math.random() * 0.2 - 0.1) },
    { base_currency: "USD", target_currency: "SRD", rate: 17.74 + (Math.random() * 0.2 - 0.1) },
  ]

  const sql = neon(process.env.DATABASE_URL!)

  try {
    const now = new Date().toISOString()
    let updatedCount = 0

    for (const apiRate of mockApiRates) {
      // Check if there's a recent manual update (e.g., within the last 24 hours)
      const existingRate = await sql`
        SELECT is_manual, manual_updated_at
        FROM exchange_rates
        WHERE base_currency = ${apiRate.base_currency} AND target_currency = ${apiRate.target_currency};
      `

      const shouldUpdate =
        !existingRate ||
        existingRate.length === 0 ||
        !existingRate[0].is_manual ||
        (existingRate[0].manual_updated_at &&
          new Date().getTime() - new Date(existingRate[0].manual_updated_at).getTime() > 24 * 60 * 60 * 1000)

      if (shouldUpdate) {
        await sql`
          INSERT INTO exchange_rates (base_currency, target_currency, rate, last_updated, is_manual, manual_updated_at, manual_updated_by)
          VALUES (${apiRate.base_currency}, ${apiRate.target_currency}, ${apiRate.rate}, ${now}, FALSE, NULL, NULL)
          ON CONFLICT (base_currency, target_currency) DO UPDATE SET
            rate = EXCLUDED.rate,
            last_updated = EXCLUDED.last_updated,
            is_manual = EXCLUDED.is_manual,
            manual_updated_at = EXCLUDED.manual_updated_at,
            manual_updated_by = EXCLUDED.manual_updated_by;
        `
        updatedCount++
      }
    }

    return NextResponse.json({ success: true, message: `Cron job completed. ${updatedCount} rates updated.` })
  } catch (error) {
    console.error("Error in cron job:", error)
    return NextResponse.json({ success: false, error: "Cron job failed" }, { status: 500 })
  }
}
