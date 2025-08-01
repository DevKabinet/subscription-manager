"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Calendar,
  Building2,
  UserCheck,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { useExchangeRateStore } from "@/lib/exchange-rates"
import { useAuthStore } from "@/lib/auth"
import { ExchangeRateModal } from "@/components/exchange-rate-modal"

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { rates, fetchRates, isLoading, getCurrencyFlag, getCurrencyName } = useExchangeRateStore()
  const [isExchangeRateModalOpen, setIsExchangeRateModalOpen] = useState(false)

  useEffect(() => {
    fetchRates()
  }, [fetchRates])

  // Mock dashboard statistics
  const stats = [
    {
      title: "Total Clients",
      value: "1,234",
      change: "+12%",
      changeType: "positive" as const,
      icon: Building2,
      description: "Active clients",
    },
    {
      title: "Active Subscriptions",
      value: "856",
      change: "+8%",
      changeType: "positive" as const,
      icon: UserCheck,
      description: "Monthly subscriptions",
    },
    {
      title: "Monthly Revenue",
      value: "$45,231",
      change: "+23%",
      changeType: "positive" as const,
      icon: DollarSign,
      description: "This month",
    },
    {
      title: "Pending Invoices",
      value: "23",
      change: "-5%",
      changeType: "negative" as const,
      icon: FileText,
      description: "Awaiting payment",
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: "payment",
      description: "Payment received from Acme Corp",
      amount: "$2,500",
      time: "2 hours ago",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      id: 2,
      type: "subscription",
      description: "New subscription created for TechStart Inc",
      amount: "$99/month",
      time: "4 hours ago",
      icon: Calendar,
      color: "text-blue-500",
    },
    {
      id: 3,
      type: "invoice",
      description: "Invoice #INV-001 sent to Global Solutions",
      amount: "$1,200",
      time: "6 hours ago",
      icon: FileText,
      color: "text-orange-500",
    },
    {
      id: 4,
      type: "client",
      description: "New client registered: Innovation Labs",
      amount: "",
      time: "1 day ago",
      icon: Users,
      color: "text-purple-500",
    },
  ]

  // Filter out USD from rates display (since it's always 1.0)
  const displayRates = rates.filter((rate) => rate.targetCurrency !== "USD")

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
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs mt-1">
                <Badge variant={stat.changeType === "positive" ? "default" : "destructive"} className="text-xs">
                  {stat.changeType === "positive" ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {stat.change}
                </Badge>
                <span className="text-gray-500">from last month</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
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
                  <div className="flex-shrink-0">
                    <activity.icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
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
              <Button variant="outline" size="sm" onClick={() => setIsExchangeRateModalOpen(true)} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {displayRates.map((rate) => (
                <div key={rate.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCurrencyFlag(rate.targetCurrency)}</span>
                    <div>
                      <span className="font-medium">{rate.targetCurrency}</span>
                      <div className="text-xs text-gray-500">{getCurrencyName(rate.targetCurrency)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">{rate.rate.toFixed(4)}</div>
                    <div className="text-xs text-gray-500">{rate.isManual ? "Manual" : "API"}</div>
                  </div>
                </div>
              ))}
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" onClick={() => setIsExchangeRateModalOpen(true)}>
                  Manage Exchange Rates
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Growth Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">+40%</div>
              <p className="text-sm text-gray-600">Revenue growth</p>
              <p className="text-xs text-gray-500 mt-1">Last 6 months</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-500" />
              Client Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">92%</div>
              <p className="text-sm text-gray-600">Retention rate</p>
              <p className="text-xs text-gray-500 mt-1">Excellent performance</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-indigo-500" />
              Payment Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">94%</div>
              <p className="text-sm text-gray-600">On-time payments</p>
              <p className="text-xs text-gray-500 mt-1">Healthy cash flow</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exchange Rate Modal */}
      <ExchangeRateModal isOpen={isExchangeRateModalOpen} onClose={() => setIsExchangeRateModalOpen(false)} />
    </div>
  )
}
