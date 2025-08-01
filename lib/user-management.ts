"use client"

import { create } from "zustand"

export interface Role {
  id: number
  name: string
  description: string
  permissions: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  roleId: number
  roleName: string
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
  createdBy?: number
}

export interface UserActivity {
  id: number
  userId: number
  action: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

interface UserManagementState {
  users: User[]
  roles: Role[]
  activities: UserActivity[]
  isLoading: boolean

  // User operations
  fetchUsers: () => Promise<void>
  createUser: (userData: Omit<User, "id" | "createdAt" | "updatedAt">) => Promise<{ success: boolean; message: string }>
  updateUser: (id: number, userData: Partial<User>) => Promise<{ success: boolean; message: string }>
  deleteUser: (id: number) => Promise<{ success: boolean; message: string }>
  toggleUserStatus: (id: number) => Promise<{ success: boolean; message: string }>

  // Role operations
  fetchRoles: () => Promise<void>
  createRole: (roleData: Omit<Role, "id" | "createdAt" | "updatedAt">) => Promise<{ success: boolean; message: string }>
  updateRole: (id: number, roleData: Partial<Role>) => Promise<{ success: boolean; message: string }>
  deleteRole: (id: number) => Promise<{ success: boolean; message: string }>

  // Activity operations
  fetchUserActivities: (userId?: number) => Promise<void>
  logActivity: (userId: number, action: string, details?: Record<string, any>) => Promise<void>
}

// Mock data
const mockRoles: Role[] = [
  {
    id: 1,
    name: "admin",
    description: "Administrator with full system access",
    permissions: {
      users: { create: true, read: true, update: true, delete: true },
      settings: { manage: true },
      invoices: { create: true, read: true, update: true, delete: true },
      payments: { create: true, read: true, update: true, delete: true },
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "manager",
    description: "Manager with limited administrative access",
    permissions: {
      users: { create: false, read: true, update: false, delete: false },
      settings: { manage: false },
      invoices: { create: true, read: true, update: true, delete: false },
      payments: { create: true, read: true, update: true, delete: false },
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    name: "user",
    description: "Standard user with basic access",
    permissions: {
      users: { create: false, read: false, update: false, delete: false },
      settings: { manage: false },
      invoices: { create: true, read: true, update: false, delete: false },
      payments: { create: true, read: true, update: false, delete: false },
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
]

const mockUsers: User[] = [
  {
    id: 1,
    email: "admin@company.com",
    firstName: "System",
    lastName: "Administrator",
    roleId: 1,
    roleName: "admin",
    isActive: true,
    lastLogin: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    email: "manager@company.com",
    firstName: "John",
    lastName: "Manager",
    roleId: 2,
    roleName: "manager",
    isActive: true,
    lastLogin: "2024-01-14T15:45:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    email: "user@company.com",
    firstName: "Jane",
    lastName: "User",
    roleId: 3,
    roleName: "user",
    isActive: true,
    lastLogin: "2024-01-13T09:15:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
]

const mockActivities: UserActivity[] = [
  {
    id: 1,
    userId: 1,
    action: "login",
    details: { method: "email" },
    ipAddress: "192.168.1.1",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    userId: 2,
    action: "create_invoice",
    details: { invoiceId: 1, amount: 1000 },
    ipAddress: "192.168.1.2",
    createdAt: "2024-01-14T15:45:00Z",
  },
  {
    id: 3,
    userId: 1,
    action: "create_user",
    details: { newUserId: 4, email: "newuser@company.com" },
    ipAddress: "192.168.1.1",
    createdAt: "2024-01-14T11:20:00Z",
  },
]

export const useUserManagementStore = create<UserManagementState>((set, get) => ({
  users: [],
  roles: [],
  activities: [],
  isLoading: false,

  fetchUsers: async () => {
    set({ isLoading: true })
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    set({ users: mockUsers, isLoading: false })
  },

  createUser: async (userData) => {
    set({ isLoading: true })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser: User = {
      ...userData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    set((state) => ({
      users: [...state.users, newUser],
      isLoading: false,
    }))

    return { success: true, message: "User created successfully" }
  },

  updateUser: async (id, userData) => {
    set({ isLoading: true })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...userData, updatedAt: new Date().toISOString() } : user,
      ),
      isLoading: false,
    }))

    return { success: true, message: "User updated successfully" }
  },

  deleteUser: async (id) => {
    set({ isLoading: true })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
      isLoading: false,
    }))

    return { success: true, message: "User deleted successfully" }
  },

  toggleUserStatus: async (id) => {
    const { users } = get()
    const user = users.find((u) => u.id === id)
    if (!user) return { success: false, message: "User not found" }

    set({ isLoading: true })
    await new Promise((resolve) => setTimeout(resolve, 500))

    set((state) => ({
      users: state.users.map((u) =>
        u.id === id ? { ...u, isActive: !u.isActive, updatedAt: new Date().toISOString() } : u,
      ),
      isLoading: false,
    }))

    return {
      success: true,
      message: `User ${user.isActive ? "deactivated" : "activated"} successfully`,
    }
  },

  fetchRoles: async () => {
    set({ isLoading: true })
    await new Promise((resolve) => setTimeout(resolve, 300))
    set({ roles: mockRoles, isLoading: false })
  },

  createRole: async (roleData) => {
    set({ isLoading: true })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newRole: Role = {
      ...roleData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    set((state) => ({
      roles: [...state.roles, newRole],
      isLoading: false,
    }))

    return { success: true, message: "Role created successfully" }
  },

  updateRole: async (id, roleData) => {
    set({ isLoading: true })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    set((state) => ({
      roles: state.roles.map((role) =>
        role.id === id ? { ...role, ...roleData, updatedAt: new Date().toISOString() } : role,
      ),
      isLoading: false,
    }))

    return { success: true, message: "Role updated successfully" }
  },

  deleteRole: async (id) => {
    set({ isLoading: true })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    set((state) => ({
      roles: state.roles.filter((role) => role.id !== id),
      isLoading: false,
    }))

    return { success: true, message: "Role deleted successfully" }
  },

  fetchUserActivities: async (userId) => {
    set({ isLoading: true })
    await new Promise((resolve) => setTimeout(resolve, 300))

    const filteredActivities = userId ? mockActivities.filter((activity) => activity.userId === userId) : mockActivities

    set({ activities: filteredActivities, isLoading: false })
  },

  logActivity: async (userId, action, details) => {
    const newActivity: UserActivity = {
      id: Date.now(),
      userId,
      action,
      details,
      ipAddress: "192.168.1.1", // Would be actual IP in production
      createdAt: new Date().toISOString(),
    }

    set((state) => ({
      activities: [newActivity, ...state.activities],
    }))
  },
}))
