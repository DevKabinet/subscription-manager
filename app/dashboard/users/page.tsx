"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  UserIcon,
  UserCheck,
  UserX,
  Activity,
  Search,
  Filter,
  Eye,
  EyeOff,
} from "lucide-react"
import { useAuthStore } from "@/lib/auth"
import { useUserManagementStore } from "@/lib/user-management"

export default function UserManagementPage() {
  const router = useRouter()
  const { user: currentUser, isAdmin } = useAuthStore()
  const {
    users,
    roles,
    activities,
    isLoading,
    fetchUsers,
    fetchRoles,
    fetchUserActivities,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
  } = useUserManagementStore()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    roleId: 3, // Default to user role
  })

  // Check admin access
  useEffect(() => {
    if (!currentUser || !isAdmin()) {
      router.push("/dashboard")
      return
    }

    fetchUsers()
    fetchRoles()
    fetchUserActivities()
  }, [currentUser, isAdmin, router, fetchUsers, fetchRoles, fetchUserActivities])

  if (!currentUser || !isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>Access denied. Admin privileges required to view this page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()

    const selectedRole = roles.find((r) => r.id === formData.roleId)
    const result = await createUser({
      ...formData,
      roleName: selectedRole?.name || "user",
      isActive: true,
    })

    if (result.success) {
      setIsCreateModalOpen(false)
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        roleId: 3,
      })
      alert(result.message)
    }
  }

  const handleEditUser = async (e) => {
    e.preventDefault()
    if (!selectedUser) return

    const selectedRole = roles.find((r) => r.id === formData.roleId)
    const result = await updateUser(selectedUser.id, {
      ...formData,
      roleName: selectedRole?.name || selectedUser.roleName,
    })

    if (result.success) {
      setIsEditModalOpen(false)
      setSelectedUser(null)
      alert(result.message)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      alert("You cannot delete your own account")
      return
    }

    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      const result = await deleteUser(userId)
      if (result.success) {
        alert(result.message)
      }
    }
  }

  const handleToggleStatus = async (userId) => {
    if (userId === currentUser.id) {
      alert("You cannot deactivate your own account")
      return
    }

    const result = await toggleUserStatus(userId)
    if (result.success) {
      alert(result.message)
    }
  }

  const openEditModal = (user) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      password: "",
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
    })
    setIsEditModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      roleId: 3,
    })
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.roleId.toString() === roleFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive)

    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case "admin":
        return "bg-red-500 text-white"
      case "manager":
        return "bg-blue-500 text-white"
      case "user":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getActivityIcon = (action) => {
    switch (action) {
      case "login":
        return <UserIcon className="h-4 w-4 text-green-500" />
      case "logout":
        return <UserX className="h-4 w-4 text-gray-500" />
      case "create_user":
        return <Plus className="h-4 w-4 text-blue-500" />
      case "update_user":
        return <Edit className="h-4 w-4 text-yellow-500" />
      case "delete_user":
        return <Trash2 className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="hover-lift">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setRoleFilter("all")
                      setStatusFilter("all")
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.roleName)}>{user.roleName}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          <span className="text-sm">{new Date(user.lastLogin).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-sm text-gray-400">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(user.id)}
                            disabled={user.id === currentUser.id}
                          >
                            {user.isActive ? (
                              <UserX className="h-4 w-4 text-red-500" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === currentUser.id}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Roles</CardTitle>
              <CardDescription>View and manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {roles.map((role) => (
                  <Card key={role.id} className="border-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {role.name}
                      </CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Permissions:</h4>
                        <div className="space-y-1">
                          {Object.entries(role.permissions).map(([resource, perms]) => (
                            <div key={resource} className="text-sm">
                              <span className="font-medium capitalize">{resource}:</span>
                              <div className="ml-2 flex flex-wrap gap-1">
                                {Object.entries(perms as Record<string, boolean>).map(([action, allowed]) => (
                                  <Badge key={action} variant={allowed ? "default" : "secondary"} className="text-xs">
                                    {action}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>System activity and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => {
                  const user = users.find((u) => u.id === activity.userId)
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getActivityIcon(activity.action)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {user ? `${user.firstName} ${user.lastName}` : "Unknown User"}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {activity.action.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.details && <span>{JSON.stringify(activity.details, null, 2)}</span>}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                          <span>{new Date(activity.createdAt).toLocaleString()}</span>
                          {activity.ipAddress && <span>IP: {activity.ipAddress}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the system</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.roleId.toString()}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, roleId: Number.parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name} - {role.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Creating..." : "Create User"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and role</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editPassword">New Password (leave blank to keep current)</Label>
              <div className="relative">
                <Input
                  id="editPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter new password or leave blank"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editRole">Role</Label>
              <Select
                value={formData.roleId.toString()}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, roleId: Number.parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name} - {role.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Updating..." : "Update User"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false)
                  setSelectedUser(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
