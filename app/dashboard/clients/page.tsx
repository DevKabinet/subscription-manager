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
import { getClients, createClient, updateClient, deleteClient } from "@/lib/clients"
import type { Client } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentClient, setCurrentClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getClients()
      setClients(data)
    } catch (err) {
      setError("Failed to fetch clients.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddClient = () => {
    setCurrentClient(null)
    setIsModalOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setCurrentClient(client)
    setIsModalOpen(true)
  }

  const handleDeleteClient = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await deleteClient(id)
        toast({
          title: "Client Deleted",
          description: "The client has been successfully deleted.",
        })
        fetchClients()
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete client.",
          variant: "destructive",
        })
        console.error(err)
      }
    }
  }

  const handleSaveClient = async (formData: FormData) => {
    const clientData: Partial<Client> = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      company_name: formData.get("company_name") as string,
      vat_number: formData.get("vat_number") as string,
    }

    try {
      if (currentClient) {
        await updateClient(currentClient.id, clientData)
        toast({
          title: "Client Updated",
          description: "The client has been successfully updated.",
        })
      } else {
        await createClient(clientData as Omit<Client, "id" | "created_at" | "updated_at">)
        toast({
          title: "Client Added",
          description: "The client has been successfully added.",
        })
      }
      fetchClients()
      setIsModalOpen(false)
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to ${currentClient ? "update" : "add"} client.`,
        variant: "destructive",
      })
      console.error(err)
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading clients...</p>
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
        <h1 className="text-3xl font-bold">Clients</h1>
        <Button onClick={handleAddClient}>
          <PlusCircle className="mr-2 h-5 w-5" /> Add Client
        </Button>
      </div>

      <div className="relative mb-6">
        <Input
          placeholder="Search clients..."
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No clients found.
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.company_name || "N/A"}</TableCell>
                  <TableCell>{client.phone || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClient(client)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteClient(client.id)}>
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
            <DialogTitle>{currentClient ? "Edit Client" : "Add New Client"}</DialogTitle>
            <DialogDescription>
              {currentClient ? "Edit the client's details." : "Fill in the details for the new client."}
            </DialogDescription>
          </DialogHeader>
          <form action={handleSaveClient}>
            <div className="grid gap-4 py-4">
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
                <Label htmlFor="company_name" className="text-right">
                  Company Name
                </Label>
                <Input
                  id="company_name"
                  name="company_name"
                  defaultValue={currentClient?.company_name || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vat_number" className="text-right">
                  VAT Number
                </Label>
                <Input
                  id="vat_number"
                  name="vat_number"
                  defaultValue={currentClient?.vat_number || ""}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input id="address" name="address" defaultValue={currentClient?.address || ""} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input id="phone" name="phone" defaultValue={currentClient?.phone || ""} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save Client</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
