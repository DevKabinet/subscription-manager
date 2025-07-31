"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  CreditCard,
  FileText,
  Plus,
  TrendingUp,
  DollarSign,
  Calendar,
  Receipt,
  ArrowUpRight,
  LinkIcon,
} from "lucide-react"
import Link from "next/link"

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

interface Client {
  id: number
  name: string
  email: string
  phone: string
  address: string
}

interface Subscription {
  id: number
  name: string
  description: string
  price: number
  billingCycle: string
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

  const [clients, setClients] = useState<Client[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)

  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  const [subscriptionForm, setSubscriptionForm] = useState({
    name: "",
    description: "",
    price: "",
    billingCycle: "monthly",
  })

  useEffect(() => {
    // Load initial data
    loadClients()
    loadSubscriptions()
    calculateStats()
  }, [])

  const loadClients = () => {
    const mockClients = [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        phone: "+1 (555) 987-6543",
        address: "456 Client Ave, City, State 12345",
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+1 (555) 456-7890",
        address: "789 Customer Blvd, City, State 12345",
      },
      {
        id: 3,
        name: "Alice Johnson",
        email: "alice@example.com",
        phone: "+1 (555) 321-0987",
        address: "321 Business St, City, State 12345",
      },
      {
        id: 4,
        name: "Bob Wilson",
        email: "bob@example.com",
        phone: "+1 (555) 654-3210",
        address: "654 Commerce Ave, City, State 12345",
      },
    ]
    setClients(mockClients)
  }

  const loadSubscriptions = () => {
    const mockSubscriptions = [
      {
        id: 1,
        name: "Basic Plan",
        description: "Basic subscription with essential features",
        price: 29.99,
        billingCycle: "monthly",
      },
      {
        id: 2,
        name: "Premium Plan",
        description: "Premium subscription with advanced features",
        price: 59.99,
        billingCycle: "monthly",
      },
      {
        id: 3,
        name: "Enterprise Plan",
        description: "Enterprise subscription with all features",
        price: 99.99,
        billingCycle: "monthly",
      },
    ]
    setSubscriptions(mockSubscriptions)
  }

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

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newClient: Client = {
      id: Date.now(),
      ...clientForm,
    }
    setClients([...clients, newClient])
    setClientForm({ name: "", email: "", phone: "", address: "" })
    setIsClientModalOpen(false)

    // Update stats
    setStats((prev) => ({
      ...prev,
      totalClients: prev.totalClients + 1,
    }))
  }

  const handleSubscriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newSubscription: Subscription = {
      id: Date.now(),
      ...subscriptionForm,
      price: Number.parseFloat(subscriptionForm.price),
    }
    setSubscriptions([...subscriptions, newSubscription])
    setSubscriptionForm({ name: "", description: "", price: "", billingCycle: "monthly" })
    setIsSubscriptionModalOpen(false)
  }

  return (
    <div className="space-y-8">
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

      {/* Quick Actions as Clickable Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Clients Card */}
          <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-200 hover-lift">
            <Link href="/dashboard/clients" className="block">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Manage Clients</CardTitle>
                      <CardDescription className="text-sm">Add, edit, and view your clients</CardDescription>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">{stats.totalClients}</span>
                  <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="hover-lift"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setIsClientModalOpen(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add New
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Client</DialogTitle>
                        <DialogDescription>Enter client details to add them to your system</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleClientSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="clientName">Name</Label>
                          <Input
                            id="clientName"
                            value={clientForm.name}
                            onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="clientEmail">Email</Label>
                          <Input
                            id="clientEmail"
                            type="email"
                            value={clientForm.email}
                            onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="clientPhone">Phone</Label>
                          <Input
                            id="clientPhone"
                            value={clientForm.phone}
                            onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="clientAddress">Address</Label>
                          <Textarea
                            id="clientAddress"
                            value={clientForm.address}
                            onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Add Client
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Subscriptions Card */}
          <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-green-200 hover-lift">
            <Link href="/dashboard/subscriptions" className="block">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Manage Subscriptions</CardTitle>
                      <CardDescription className="text-sm">Create and manage subscription plans</CardDescription>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">{subscriptions.length}</span>
                  <Dialog open={isSubscriptionModalOpen} onOpenChange={setIsSubscriptionModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="hover-lift"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setIsSubscriptionModalOpen(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add New
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Subscription</DialogTitle>
                        <DialogDescription>Create a new subscription plan</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubscriptionSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="subscriptionName">Name</Label>
                          <Input
                            id="subscriptionName"
                            value={subscriptionForm.name}
                            onChange={(e) => setSubscriptionForm({ ...subscriptionForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subscriptionDescription">Description</Label>
                          <Textarea
                            id="subscriptionDescription"
                            value={subscriptionForm.description}
                            onChange={(e) => setSubscriptionForm({ ...subscriptionForm, description: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subscriptionPrice">Price ($)</Label>
                          <Input
                            id="subscriptionPrice"
                            type="number"
                            step="0.01"
                            value={subscriptionForm.price}
                            onChange={(e) => setSubscriptionForm({ ...subscriptionForm, price: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subscriptionBillingCycle">Billing Cycle</Label>
                          <Select
                            value={subscriptionForm.billingCycle}
                            onValueChange={(value) => setSubscriptionForm({ ...subscriptionForm, billingCycle: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit" className="w-full">
                          Add Subscription
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Client Subscriptions Card */}
          <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-indigo-200 hover-lift">
            <Link href="/dashboard/client-subscriptions" className="block">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                      <LinkIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Link Subscriptions</CardTitle>
                      <CardDescription className="text-sm">Connect clients to subscription plans</CardDescription>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-indigo-600">{stats.linkedSubscriptions}</span>
                  <span className="text-sm text-gray-500">Active links</span>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Payments Card */}
          <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-orange-200 hover-lift">
            <Link href="/dashboard/payments" className="block">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Track Payments</CardTitle>
                      <CardDescription className="text-sm">Monitor and update payment status</CardDescription>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-600">{stats.pendingPayments}</span>
                  <span className="text-sm text-gray-500">Pending</span>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Invoices Card */}
          <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-purple-200 hover-lift">
            <Link href="/dashboard/invoices" className="block">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <Receipt className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Generate Invoices</CardTitle>
                      <CardDescription className="text-sm">Create and download invoices</CardDescription>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-purple-600">24</span>
                  <span className="text-sm text-gray-500">This month</span>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
