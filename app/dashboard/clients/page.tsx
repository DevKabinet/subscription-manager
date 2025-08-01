"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  companyName?: string
  contactPerson?: string
  industry?: string
  website?: string
  notes?: string
  status: "Active" | "Inactive" | "Lead"
  lastActivity: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentClient, setCurrentClient] = useState<Client | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Simulate fetching data
    const fetchedClients: Client[] = [
      {
        id: "1",
        name: "Alice Smith",
        email: "alice@example.com",
        phone: "111-222-3333",
        address: "123 Main St, Anytown, USA",
        companyName: "Alpha Solutions",
        contactPerson: "John Doe",
        industry: "IT Services",
        website: "www.alphasolutions.com",
        notes: "Key client, requires regular check-ins.",
        status: "Active",
        lastActivity: "2024-07-20",
      },
      {
        id: "2",
        name: "Bob Johnson",
        email: "bob@example.com",
        phone: "444-555-6666",
        address: "456 Oak Ave, Otherville, USA",
        companyName: "Beta Innovations",
        contactPerson: "Jane Smith",
        industry: "Marketing",
        website: "www.betainnovations.com",
        notes: "New lead, follow up next week.",
        status: "Lead",
        lastActivity: "2024-07-22",
      },
      {
        id: "3",
        name: "Charlie Brown",
        email: "charlie@example.com",
        phone: "777-888-9999",
        address: "789 Pine Ln, Somewhere, USA",
        companyName: "Gamma Corp",
        contactPerson: "Peter Jones",
        industry: "Finance",
        website: "www.gammacorp.com",
        notes: "Inactive due to budget cuts.",
        status: "Inactive",
        lastActivity: "2024-06-10",
      },
    ]
    setClients(fetchedClients)
  }, [])

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.companyName?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddClient = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newClient: Client = {
      id: String(clients.length + 1), // Simple ID generation
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      companyName: formData.get("companyName") as string,
      contactPerson: formData.get("contactPerson") as string,
      industry: formData.get("industry") as string,
      website: formData.get("website") as string,
      notes: formData.get("notes") as string,
      status: "Active", // Default status for new clients
      lastActivity: new Date().toISOString().split("T")[0],
    }
    setClients([...clients, newClient])
    setIsModalOpen(false)
  }

  const handleEditClient = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!currentClient) return

    const formData = new FormData(event.currentTarget)
    const updatedClient: Client = {
      ...currentClient,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      companyName: formData.get("companyName") as string,
      contactPerson: formData.get("contactPerson") as string,
      industry: formData.get("industry") as string,
      website: formData.get("website") as string,
      notes: formData.get("notes") as string,
      status: formData.get("status") as Client["status"],
    }

    setClients(clients.map((client) => (client.id === updatedClient.id ? updatedClient : client)))
    setIsModalOpen(false)
    setCurrentClient(null)
    setIsEditing(false)
  }

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter((client) => client.id !== id))
  }

  const openAddModal = () => {
    setCurrentClient(null)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const openEditModal = (client: Client) => {
    setCurrentClient(client)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const openViewModal = (client: Client) => {
    setCurrentClient(client)
    setIsViewModalOpen(true)
  }

  const getStatusBadgeColor = (status: Client["status"]) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Inactive":
        return "bg-red-100 text-red-800"
      case "Lead":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-4 py-2 border rounded-md w-full"
        />
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Company</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden lg:table-cell">Last Activity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell className="hidden md:table-cell">{client.companyName || "N/A"}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className={getStatusBadgeColor(client.status)}>{client.status}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">{client.lastActivity}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openViewModal(client)} className="mr-1">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(client)} className="mr-1">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteClient(client.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredClients.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No clients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Client Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Client" : "Add New Client"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={isEditing ? handleEditClient : handleAddClient} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" defaultValue={currentClient?.name || ""} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={currentClient?.email || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input id="phone" name="phone" defaultValue={currentClient?.phone || ""} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input id="address" name="address" defaultValue={currentClient?.address || ""} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companyName" className="text-right">
                Company Name
              </Label>
              <Input
                id="companyName"
                name="companyName"
                defaultValue={currentClient?.companyName || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactPerson" className="text-right">
                Contact Person
              </Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                defaultValue={currentClient?.contactPerson || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="industry" className="text-right">
                Industry
              </Label>
              <Input
                id="industry"
                name="industry"
                defaultValue={currentClient?.industry || ""}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="website" className="text-right">
                Website
              </Label>
              <Input id="website" name="website" defaultValue={currentClient?.website || ""} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Input id="notes" name="notes" defaultValue={currentClient?.notes || ""} className="col-span-3" />
            </div>
            {isEditing && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={currentClient?.status || "Active"}
                  className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>
            )}
            <DialogFooter>
              <Button type="submit">{isEditing ? "Save Changes" : "Add Client"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Client Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
          </DialogHeader>
          {currentClient && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Name:</span>
                <span>{currentClient.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Email:</span>
                <span>{currentClient.email}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Phone:</span>
                <span>{currentClient.phone || "N/A"}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Address:</span>
                <span>{currentClient.address || "N/A"}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Company Name:</span>
                <span>{currentClient.companyName || "N/A"}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Contact Person:</span>
                <span>{currentClient.contactPerson || "N/A"}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Industry:</span>
                <span>{currentClient.industry || "N/A"}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Website:</span>
                <span>{currentClient.website || "N/A"}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Status:</span>
                <span>
                  <Badge className={getStatusBadgeColor(currentClient.status)}>{currentClient.status}</Badge>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Last Activity:</span>
                <span>{currentClient.lastActivity}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Notes:</span>
                <span>{currentClient.notes || "N/A"}</span>
              </div>
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
