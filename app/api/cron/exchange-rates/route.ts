import { NextResponse } from "next/server"

export async function GET() {
  try {
    // This endpoint would be called by a cron job daily
    // In production, you'd use Vercel Cron Jobs or similar service

    console.log("Starting daily exchange rate update...")

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/exchange-rates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "fetch_latest",
        updated_by: "daily_cron_job",
      }),
    })

    const result = await response.json()

    if (result.success) {
      console.log("Daily exchange rate update completed successfully")
      console.log("Update summary:", result.message)

      // Log any history entries if available
      if (result.history && result.history.length > 0) {
        console.log("Recent changes:", result.history)
      }

      return NextResponse.json({
        success: true,
        message: "Daily exchange rate update completed",
        details: result.message,
        timestamp: new Date().toISOString(),
        history: result.history || [],
      })
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error("Daily exchange rate cron job failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update exchange rates",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
