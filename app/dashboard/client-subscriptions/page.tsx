"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react"
import {
  getClientSubscriptions,
  createClientSubscription,
  updateClientSubscription,
  deleteClientSubscription,
} from "@/lib/client-subscriptions"
import { getClients } from "@/lib/clients"
import type { ClientSubscription, Client } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function ClientSubscriptionsPage() {
  const [clientSubscriptions, setClientSubscriptions] = useState<ClientSubscription[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentClientSubscription, setCurrentClientSubscription] = useState<ClientSubscription | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [clientSubscriptionsData, clientsData] = await Promise.all([getClientSubscriptions(), getClients()])
      setClientSubscriptions(clientSubscriptionsData)
      setClients(clientsData)
    } catch (err) {
      setError("Failed to fetch data.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddClientSubscription = () => {
    setCurrentClientSubscription(null)
    setIsModalOpen(true)
  }

  const handleEditClientSubscription = (clientSubscription: ClientSubscription) => {
    setCurrentClientSubscription(clientSubscription)
    setIsModalOpen(true)
  }

  const handleDeleteClientSubscription = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this client subscription?")) {
      try {
        await deleteClientSubscription(id)
        toast({
          title: "Client Subscription Deleted",
          description: "The client subscription has been successfully deleted.",
        })
        fetchData()
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete client subscription.",
          variant: "destructive",
        })
        console.error(err)
      }
    }
  }

  const handleSaveClientSubscription = async (formData: FormData) => {
    const clientSubscriptionData: Partial<ClientSubscription> = {
      client_id: formData.get("client_id") as string,
      plan_name: formData.get("plan_name") as string,
      amount: Number.parseFloat(formData.get("amount") as string),
      currency: formData.get("currency") as string,
      billing_cycle: formData.get("billing_cycle") as string,
      start_date: formData.get("start_date") as string,
      end_date: (formData.get("end_date") as string) || null,
      status: formData.get("status") as string,
    }

    try {
      if (currentClientSubscription) {
        await updateClientSubscription(currentClientSubscription.id, clientSubscriptionData)
        toast({
          title: "Client Subscription Updated",
          description: "The client subscription has been successfully updated.",
        })
      } else {
        await createClientSubscription(
          clientSubscriptionData as Omit<ClientSubscription, "id" | "created_at" | "updated_at">,
        )
        toast({
          title: "Client Subscription Added",
          description: "The client subscription has been successfully added.",
        })
      }
      fetchData()
      setIsModalOpen(false)
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to ${currentClientSubscription ? "update" : "add"} client subscription.`,
        variant: "destructive",
      })
      console.error(err)
    }
  }

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    return client ? client.name : "N/A"
  }

  const filteredClientSubscriptions = clientSubscriptions.filter(
    (clientSubscription) =>
      clientSubscription.plan_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(clientSubscription.client_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientSubscription.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading client subscriptions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Client Subscriptions</h1>
        <Button onClick={handleAddClientSubscription}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add Client Subscription
        </Button>
      </div>

      <div className="relative mb-6">
        <Input
          placeholder="Search client subscriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Plan Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Billing Cycle</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClientSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No client subscriptions found.
                </TableCell>
              </TableRow>
            ) : (
              filteredClientSubscriptions.map((clientSubscription) => (
                <TableRow key={clientSubscription.id}>
                  <TableCell className="font-medium">{getClientName(clientSubscription.client_id)}</TableCell>
                  <TableCell>{clientSubscription.plan_name}</TableCell>
                  <TableCell>
                    {clientSubscription.amount.toFixed(2)} {clientSubscription.currency}
                  </TableCell>
                  <TableCell>{clientSubscription.billing_cycle}</TableCell>
                  <TableCell>{format(new Date(clientSubscription.start_date), "PPP")}</TableCell>
                  <TableCell>
                    {clientSubscription.end_date ? format(new Date(clientSubscription.end_date), "PPP") : "N/A"}
                  </TableCell>
                  <TableCell>{clientSubscription.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClientSubscription(clientSubscription)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClientSubscription(clientSubscription.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentClientSubscription ? "Edit Client Subscription" : "Add New Client Subscription"}
            </DialogTitle>
            <DialogDescription>
              {currentClientSubscription
                ? "Edit the client subscription details."
                : "Fill in the details for the new client subscription."}
            </DialogDescription>
          </DialogHeader>
          <form action={handleSaveClientSubscription}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client_id" className="text-right">
                  Client
                </Label>
                <select
                  id="client_id"
                  name="client_id"
                  defaultValue={currentClientSubscription?.client_id || ""}
                  className="col-span-3 p-2 border rounded-md"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan_name" className="text-right">
                  Plan Name
                </Label>
                <Input
                  id="plan_name"
                  name="plan_name"
                  defaultValue={currentClientSubscription?.plan_name || ""}
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
                  defaultValue={currentClientSubscription?.amount || ""}
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
                  defaultValue={currentClientSubscription?.currency || "USD"}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="billing_cycle" className="text-right">
                  Billing Cycle
                </Label>
                <select
                  id="billing_cycle"
                  name="billing_cycle"
                  defaultValue={currentClientSubscription?.billing_cycle || ""}
                  className="col-span-3 p-2 border rounded-md"
                  required
                >
                  <option value="">Select cycle</option>
                  <option value="monthly">Monthly</option>
                  <option value="annually">Annually</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start_date" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  defaultValue={
                    currentClientSubscription?.start_date
                      ? format(new Date(currentClientSubscription.start_date), "yyyy-MM-dd")
                      : ""
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end_date" className="text-right">
                  End Date
                </Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  defaultValue={
                    currentClientSubscription?.end_date
                      ? format(new Date(currentClientSubscription.end_date), "yyyy-MM-dd")
                      : ""
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={currentClientSubscription?.status || "active"}
                  className="col-span-3 p-2 border rounded-md"
                  required
                >
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="paused">Paused</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Client Subscription</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
