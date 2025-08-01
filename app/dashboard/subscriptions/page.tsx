"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { FormData } from "formdata-node" // Import FormData to use it
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface Subscription {
  id: string
  clientId: string
  clientName: string
  planName: string
  amount: number
  currency: string
  billingCycle: "monthly" | "annually" | "quarterly"
  startDate: string
  endDate?: string
  nextBillingDate?: string
  status: "active" | "cancelled" | "paused" | "trialing" | "expired"
  autoRenew: boolean
  cancellationDate?: string
  cancellationReason?: string
  paymentMethodDetails?: string
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [nextBillingDate, setNextBillingDate] = useState<Date | undefined>(undefined)
  const [cancellationDate, setCancellationDate] = useState<Date | undefined>(undefined)
  const [formData, setFormData] = useState(new FormData()) // Declare formData here

  useEffect(() => {
    // Simulate fetching data
    const fetchedSubscriptions: Subscription[] = [
      {
        id: "sub1",
        clientId: "1",
        clientName: "Alice Smith",
        planName: "Premium Monthly",
        amount: 99.99,
        currency: "USD",
        billingCycle: "monthly",
        startDate: "2023-01-01",
        nextBillingDate: "2024-08-01",
        status: "active",
        autoRenew: true,
      },
      {
        id: "sub2",
        clientId: "2",
        clientName: "Bob Johnson",
        planName: "Annual Pro",
        amount: 999.0,
        currency: "USD",
        billingCycle: "annually",
        startDate: "2023-03-15",
        endDate: "2024-03-14",
        nextBillingDate: "2025-03-15",
        status: "active",
        autoRenew: true,
      },
      {
        id: "sub3",
        clientId: "3",
        clientName: "Charlie Brown",
        planName: "Basic Monthly",
        amount: 29.99,
        currency: "USD",
        billingCycle: "monthly",
        startDate: "2023-05-01",
        cancellationDate: "2024-06-30",
        cancellationReason: "Budget cuts",
        status: "cancelled",
        autoRenew: false,
      },
      {
        id: "sub4",
        clientId: "1",
        clientName: "Alice Smith",
        planName: "Trial Plan",
        amount: 0.0,
        currency: "USD",
        billingCycle: "monthly",
        startDate: "2024-07-10",
        endDate: "2024-07-24",
        status: "trialing",
        autoRenew: true,
      },
    ]
    setSubscriptions(fetchedSubscriptions)
  }, [])

  const filteredSubscriptions = subscriptions.filter(
    (sub) =>
      sub.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddOrEditSubscription = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const newOrUpdatedSubscription: Subscription = {
      id: isEditing && currentSubscription ? currentSubscription.id : String(subscriptions.length + 1),
      clientId: formData.get("clientId") as string, // In a real app, this would link to an actual client
      clientName: formData.get("clientName") as string,
      planName: formData.get("planName") as string,
      amount: Number.parseFloat(formData.get("amount") as string),
      currency: formData.get("currency") as string,
      billingCycle: formData.get("billingCycle") as Subscription["billingCycle"],
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : "",
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      nextBillingDate: nextBillingDate ? format(nextBillingDate, "yyyy-MM-dd") : undefined,
      status: formData.get("status") as Subscription["status"],
      autoRenew: formData.get("autoRenew") === "on",
      cancellationDate: cancellationDate ? format(cancellationDate, "yyyy-MM-dd") : undefined,
      cancellationReason: formData.get("cancellationReason") as string,
      paymentMethodDetails: formData.get("paymentMethodDetails") as string,
    }

    if (isEditing) {
      setSubscriptions(
        subscriptions.map((sub) => (sub.id === newOrUpdatedSubscription.id ? newOrUpdatedSubscription : sub)),
      )
    } else {
      setSubscriptions([...subscriptions, newOrUpdatedSubscription])
    }
    setIsModalOpen(false)
    resetFormState()
  }

  const handleDeleteSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter((sub) => sub.id !== id))
  }

  const openAddModal = () => {
    setCurrentSubscription(null)
    setIsEditing(false)
    resetFormState()
    setIsModalOpen(true)
  }

  const openEditModal = (sub: Subscription) => {
    setCurrentSubscription(sub)
    setIsEditing(true)
    setStartDate(sub.startDate ? new Date(sub.startDate) : undefined)
    setEndDate(sub.endDate ? new Date(sub.endDate) : undefined)
    setNextBillingDate(sub.nextBillingDate ? new Date(sub.nextBillingDate) : undefined)
    setCancellationDate(sub.cancellationDate ? new Date(sub.cancellationDate) : undefined)
    setIsModalOpen(true)
  }

  const openViewModal = (sub: Subscription) => {
    setCurrentSubscription(sub)
    setIsViewModalOpen(true)
  }

  const resetFormState = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setNextBillingDate(undefined)
    setCancellationDate(undefined)
    setFormData(new FormData()) // Reset formData here
  }

  const getStatusBadgeColor = (status: Subscription["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "trialing":
        return "bg-blue-100 text-blue-800"
      case "expired":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" /> Add Subscription
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search subscriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-4 py-2 border rounded-md w-full"
        />
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden md:table-cell">Billing Cycle</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden lg:table-cell">Next Billing</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.clientName}</TableCell>
                <TableCell>{sub.planName}</TableCell>
                <TableCell>
                  {sub.currency} {sub.amount.toFixed(2)}
                </TableCell>
                <TableCell className="hidden md:table-cell capitalize">{sub.billingCycle}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className={getStatusBadgeColor(sub.status)}>{sub.status}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">{sub.nextBillingDate || "N/A"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openViewModal(sub)} className="mr-1">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(sub)} className="mr-1">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteSubscription(sub.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredSubscriptions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No subscriptions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Subscription Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Subscription" : "Add New Subscription"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddOrEditSubscription} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientName" className="text-right">
                Client Name
              </Label>
              <Input
                id="clientName"
                name="clientName"
                defaultValue={currentSubscription?.clientName || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="planName" className="text-right">
                Plan Name
              </Label>
              <Input
                id="planName"
                name="planName"
                defaultValue={currentSubscription?.planName || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                defaultValue={currentSubscription?.amount || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currency" className="text-right">
                Currency
              </Label>
              <Input
                id="currency"
                name="currency"
                defaultValue={currentSubscription?.currency || "USD"}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="billingCycle" className="text-right">
                Billing Cycle
              </Label>
              <select
                id="billingCycle"
                name="billingCycle"
                defaultValue={currentSubscription?.billingCycle || "monthly"}
                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !startDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !endDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nextBillingDate" className="text-right">
                Next Billing Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal",
                      !nextBillingDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {nextBillingDate ? format(nextBillingDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={nextBillingDate} onSelect={setNextBillingDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <select
                id="status"
                name="status"
                defaultValue={currentSubscription?.status || "active"}
                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="paused">Paused</option>
                <option value="trialing">Trialing</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="autoRenew" className="text-right">
                Auto Renew
              </Label>
              <input
                id="autoRenew"
                name="autoRenew"
                type="checkbox"
                defaultChecked={currentSubscription?.autoRenew || true}
                className="col-span-3 h-4 w-4"
              />
            </div>
            {(currentSubscription?.status === "cancelled" || formData.get("status") === "cancelled") && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cancellationDate" className="text-right">
                    Cancellation Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "col-span-3 justify-start text-left font-normal",
                          !cancellationDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {cancellationDate ? format(cancellationDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={cancellationDate} onSelect={setCancellationDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cancellationReason" className="text-right">
                    Cancellation Reason
                  </Label>
                  <Input
                    id="cancellationReason"
                    name="cancellationReason"
                    defaultValue={currentSubscription?.cancellationReason || ""}
                    className="col-span-3"
                  />
                </div>
              </>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentMethodDetails" className="text-right">
                Payment Method Details
              </Label>
              <Input
                id="paymentMethodDetails"
                name="paymentMethodDetails"
                defaultValue={currentSubscription?.paymentMethodDetails || ""}
                className="col-span-3"
              />
            </div>
            <DialogFooter>
              <Button type="submit">{isEditing ? "Save Changes" : "Add Subscription"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Subscription Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
          </DialogHeader>
          {currentSubscription && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Client Name:</span>
                <span>{currentSubscription.clientName}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Plan Name:</span>
                <span>{currentSubscription.planName}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Amount:</span>
                <span>
                  {currentSubscription.currency} {currentSubscription.amount.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Billing Cycle:</span>
                <span className="capitalize">{currentSubscription.billingCycle}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Start Date:</span>
                <span>{currentSubscription.startDate}</span>
              </div>
              {currentSubscription.endDate && (
                <div className="grid grid-cols-2 gap-1">
                  <span className="font-medium">End Date:</span>
                  <span>{currentSubscription.endDate}</span>
                </div>
              )}
              {currentSubscription.nextBillingDate && (
                <div className="grid grid-cols-2 gap-1">
                  <span className="font-medium">Next Billing Date:</span>
                  <span>{currentSubscription.nextBillingDate}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Status:</span>
                <span>
                  <Badge className={getStatusBadgeColor(currentSubscription.status)}>
                    {currentSubscription.status}
                  </Badge>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Auto Renew:</span>
                <span>{currentSubscription.autoRenew ? "Yes" : "No"}</span>
              </div>
              {currentSubscription.cancellationDate && (
                <div className="grid grid-cols-2 gap-1">
                  <span className="font-medium">Cancellation Date:</span>
                  <span>{currentSubscription.cancellationDate}</span>
                </div>
              )}
              {currentSubscription.cancellationReason && (
                <div className="grid grid-cols-2 gap-1">
                  <span className="font-medium">Cancellation Reason:</span>
                  <span>{currentSubscription.cancellationReason}</span>
                </div>
              )}
              {currentSubscription.paymentMethodDetails && (
                <div className="grid grid-cols-2 gap-1">
                  <span className="font-medium">Payment Method Details:</span>
                  <span>{currentSubscription.paymentMethodDetails}</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
