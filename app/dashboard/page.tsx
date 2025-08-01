"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Calendar,
  LinkIcon,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react"
import { useExchangeRateStore } from "@/lib/exchange-rates"
import { ExchangeRateModal } from "@/components/exchange-rate-modal"

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

interface ChartData {
  month: string
  revenue: number
  clients: number
  subscriptions: number
}

interface PaymentStatusData {
  status: string
  count: number
  amount: number
  color: string
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

  const [revenueData, setRevenueData] = useState<ChartData[]>([])
  const [paymentStatusData, setPaymentStatusData] = useState<PaymentStatusData[]>([])
  const [isExchangeRateModalOpen, setIsExchangeRateModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // Declare isLoading variable

  const { rates, isLoading: isRatesLoading, fetchRates, getCurrencyFlag } = useExchangeRateStore()

  useEffect(() => {
    calculateStats()
    loadChartData()
    fetchRates() // Fetch rates when dashboard loads
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

  const loadChartData = () => {
    // Revenue trend data for the last 6 months
    const revenueChartData: ChartData[] = [
      { month: "Aug", revenue: 890.45, clients: 8, subscriptions: 12 },
      { month: "Sep", revenue: 1024.67, clients: 9, subscriptions: 14 },
      { month: "Oct", revenue: 1156.23, clients: 10, subscriptions: 15 },
      { month: "Nov", revenue: 1089.78, clients: 11, subscriptions: 16 },
      { month: "Dec", revenue: 1198.34, clients: 11, subscriptions: 17 },
      { month: "Jan", revenue: 1247.82, clients: 12, subscriptions: 18 },
    ]
    setRevenueData(revenueChartData)

    // Payment status distribution
    const paymentData: PaymentStatusData[] = [
      { status: "Paid", count: 24, amount: 1847.76, color: "bg-green-500" },
      { status: "Pending", count: 5, amount: 299.95, color: "bg-orange-500" },
      { status: "Overdue", count: 2, amount: 119.98, color: "bg-red-500" },
    ]
    setPaymentStatusData(paymentData)
  }

  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue))
  const maxClients = Math.max(...revenueData.map((d) => d.clients))

  const displayRates = rates.filter((rate) => rate.target_currency !== "USD").slice(0, 3) // Show top 3 non-USD rates

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
        <p className="text-lg text-gray-600">Track your subscription business performance</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalClients}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +2 from last month
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.monthlyRevenue.toFixed(2)}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <LinkIcon className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.linkedSubscriptions}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +1 this week
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingPayments}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              -2 from last week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Revenue Trend
            </CardTitle>
            <p className="text-sm text-gray-600">Monthly revenue over the last 6 months</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Chart Area */}
              <div className="h-48 flex items-end justify-between gap-2 border-b border-l border-gray-200 pb-2 pl-2">
                {revenueData.map((data, index) => (
                  <div key={data.month} className="flex flex-col items-center flex-1">
                    <div className="w-full flex flex-col items-center">
                      {/* Revenue Bar */}
                      <div
                        className="w-8 bg-gradient-to-t from-green-500 to-green-400 rounded-t-sm mb-1 transition-all duration-300 hover:from-green-600 hover:to-green-500"
                        style={{
                          height: `${(data.revenue / maxRevenue) * 120}px`,
                          minHeight: "20px",
                        }}
                        title={`Revenue: $${data.revenue.toFixed(2)}`}
                      />
                      {/* Clients Line Point */}
                      <div
                        className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"
                        style={{
                          marginBottom: `${(data.clients / maxClients) * 60}px`,
                        }}
                        title={`Clients: ${data.clients}`}
                      />
                    </div>
                    <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-400 rounded"></div>
                  <span className="text-gray-600">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Clients</span>
                </div>
              </div>

              {/* Key Insights */}
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Growth Trend</span>
                </div>
                <p className="text-xs text-green-700">
                  Revenue increased by 40% over the last 6 months with steady client growth
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status Distribution */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Payment Status
            </CardTitle>
            <p className="text-sm text-gray-600">Current payment distribution</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Donut Chart Representation */}
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  {/* Outer Ring */}
                  <div className="absolute inset-0 rounded-full bg-gray-200"></div>

                  {/* Payment Status Segments */}
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-green-400 via-orange-400 to-red-400 opacity-90"></div>

                  {/* Inner Circle */}
                  <div className="absolute inset-6 rounded-full bg-white flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">31</div>
                      <div className="text-xs text-gray-600">Total</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Status Breakdown */}
              <div className="space-y-3">
                {paymentStatusData.map((item, index) => (
                  <div key={item.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <div>
                        <div className="font-medium text-gray-900">{item.status}</div>
                        <div className="text-xs text-gray-600">{item.count} payments</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">${item.amount.toFixed(2)}</div>
                      <div className="text-xs text-gray-600">{((item.count / 31) * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Health Indicator */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800">Payment Health</span>
                </div>
                <p className="text-xs text-blue-700">77% of payments are on track with only 6% overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics Row */}
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

      {/* Exchange Rates Card */}
      <Card className="hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Current Exchange Rates
          </CardTitle>
          <Button onClick={() => setIsExchangeRateModalOpen(true)} disabled={isLoading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {isRatesLoading ? (
            <div className="text-center text-gray-500 py-4">Loading rates...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayRates.map((rate) => (
                <div key={rate.target_currency} className="p-3 border rounded-md bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">
                      {getCurrencyFlag(rate.target_currency)} {rate.target_currency}
                    </span>
                    {rate.is_manual && <span className="text-xs text-blue-600">Manual</span>}
                  </div>
                  <div className="text-xl font-bold text-green-700">
                    1 USD = {rate.rate.toFixed(4)} {rate.target_currency}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Last updated: {new Date(rate.last_updated).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {displayRates.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-4">No exchange rates available.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-lg">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">+40%</div>
              <p className="text-sm text-gray-600">Revenue growth</p>
              <p className="text-xs text-gray-500 mt-1">Last 6 months</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-lg">Client Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">92%</div>
              <p className="text-sm text-gray-600">Retention rate</p>
              <p className="text-xs text-gray-500 mt-1">Excellent performance</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-lg">Payment Success</CardTitle>
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
