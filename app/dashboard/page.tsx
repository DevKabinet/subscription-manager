"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, FileText, DollarSign, TrendingUp, Calendar, Building2, UserCheck, RefreshCw } from "lucide-react"
import { useExchangeRateStore } from "@/lib/exchange-rates"
import { useAuthStore } from "@/lib/auth"

export default function DashboardPage() {
  const { rates, fetchRates, isLoading } = useExchangeRateStore()
  const { user } = useAuthStore()

  // Mock data - in a real app, this would come from your API
  const stats = [
    {
      title: "Total Clients",
      value: "1,234",
      change: "+12%",
      changeType: "positive" as const,
      icon: Building2,
    },
    {
      title: "Active Subscriptions",
      value: "856",
      change: "+8%",
      changeType: "positive" as const,
      icon: UserCheck,
    },
    {
      title: "Monthly Revenue",
      value: "$45,231",
      change: "+23%",
      changeType: "positive" as const,
      icon: DollarSign,
    },
    {
      title: "Pending Invoices",
      value: "23",
      change: "-5%",
      changeType: "negative" as const,
      icon: FileText,
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: "payment",
      description: "Payment received from Acme Corp",
      amount: "$2,500",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "subscription",
      description: "New subscription created for TechStart Inc",
      amount: "$99/month",
      time: "4 hours ago",
    },
    {
      id: 3,
      type: "invoice",
      description: "Invoice #INV-001 sent to Global Solutions",
      amount: "$1,200",
      time: "6 hours ago",
    },
    {
      id: 4,
      type: "client",
      description: "New client registered: Innovation Labs",
      amount: "",
      time: "1 day ago",
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <DollarSign className="h-4 w-4 text-green-500" />
      case "subscription":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "invoice":
        return <FileText className="h-4 w-4 text-orange-500" />
      case "client":
        return <Users className="h-4 w-4 text-purple-500" />
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />
    }
  }

  const getCurrencyFlag = (currency: string) => {
    const flags: Record<string, string> = {
      USD: "🇺🇸",
      EUR: "🇪🇺",
      GBP: "🇬🇧",
      JPY: "🇯🇵",
      CAD: "🇨🇦",
      AUD: "🇦🇺",
      CHF: "🇨🇭",
      CNY: "🇨🇳",
    }
    return flags[currency] || "💱"
  }

  // Ensure rates is an array before rendering
  const safeRates = Array.isArray(rates) ? rates : []

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName}! 👋</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your subscription business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs">
                <Badge variant={stat.changeType === "positive" ? "default" : "destructive"} className="text-xs">
                  {stat.change}
                </Badge>
                <span className="text-gray-500">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your subscription business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3">
                  <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  {activity.amount && <div className="text-sm font-medium text-gray-900">{activity.amount}</div>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Exchange Rates */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Exchange Rates</CardTitle>
                <CardDescription>Live rates for multi-currency invoicing</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchRates} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {safeRates.slice(0, 6).map((rate) => (
                <div key={rate.currency} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCurrencyFlag(rate.currency)}</span>
                    <span className="font-medium">{rate.currency}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">{rate.rate.toFixed(4)}</div>
                    <div className="text-xs text-gray-500">vs USD</div>
                  </div>
                </div>
              ))}
              {safeRates.length > 6 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm">
                    View all {safeRates.length} currencies
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
