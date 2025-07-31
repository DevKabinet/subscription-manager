"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, TrendingUp, DollarSign, Calendar, LinkIcon } from "lucide-react"

interface DashboardStats {
  totalClients: number
  activeSubscriptions: number
  pendingPayments: number
  monthlyRevenue: number
  totalRevenue: number
  averageRevenuePerClient: number
  upcomingPayments: number
  overduePayments: number
  linkedSubscriptions: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeSubscriptions: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    averageRevenuePerClient: 0,
    upcomingPayments: 0,
    overduePayments: 0,
    linkedSubscriptions: 0,
  })

  useEffect(() => {
    calculateStats()
  }, [])

  const calculateStats = () => {
    // Simulate real statistics calculation
    const totalClients = 12
    const activeSubscriptions = 18
    const monthlyRevenue = 1247.82
    const totalRevenue = 14973.84
    const pendingPayments = 5
    const upcomingPayments = 8
    const overduePayments = 2
    const linkedSubscriptions = 15

    setStats({
      totalClients,
      activeSubscriptions,
      pendingPayments,
      monthlyRevenue,
      totalRevenue,
      averageRevenuePerClient: totalRevenue / totalClients,
      upcomingPayments,
      overduePayments,
      linkedSubscriptions,
    })
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Subscription Manager</h1>
        <p className="text-lg text-gray-600">Manage your clients, subscriptions, and payments all in one place</p>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Linked Subscriptions</CardTitle>
            <LinkIcon className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.linkedSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Active client subscriptions</p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">-2 from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue/Client</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.averageRevenuePerClient.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per client average</p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingPayments}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <FileText className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overduePayments}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity or Summary */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle>Business Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalClients}</div>
              <p className="text-sm text-gray-600">Active Clients</p>
              <p className="text-xs text-gray-500 mt-1">Growing steadily</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">${stats.monthlyRevenue.toFixed(0)}</div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-xs text-gray-500 mt-1">12.5% increase</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">{stats.linkedSubscriptions}</div>
              <p className="text-sm text-gray-600">Active Subscriptions</p>
              <p className="text-xs text-gray-500 mt-1">Healthy retention</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
