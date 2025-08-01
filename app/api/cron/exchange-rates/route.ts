import { NextResponse } from "next/server"

export async function GET() {
  try {
    // This endpoint would be called by a cron job daily
    // In production, you'd use Vercel Cron Jobs or similar service

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/exchange-rates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "fetch_latest" }),
    })

    const result = await response.json()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Daily exchange rate update completed",
        timestamp: new Date().toISOString(),
      })
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error("Cron job failed:", error)
    return NextResponse.json({ success: false, error: "Failed to update exchange rates" }, { status: 500 })
  }
}
