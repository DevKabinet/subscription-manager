"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  roleId: number
  roleName: string
  rolePermissions: Record<string, any>
  isActive: boolean
  lastLogin?: string
  createdAt: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  updateLastLogin: () => void
  hasPermission: (resource: string, action: string) => boolean
  isAdmin: () => boolean
  isManager: () => boolean
}

// Mock user database - in production, this would be API calls
const mockUsers: Record<string, User & { password: string }> = {
  "admin@company.com": {
    id: 1,
    email: "admin@company.com",
    password: "admin123",
    firstName: "System",
    lastName: "Administrator",
    roleId: 1,
    roleName: "admin",
    rolePermissions: {
      users: { create: true, read: true, update: true, delete: true },
      settings: { manage: true },
      invoices: { create: true, read: true, update: true, delete: true },
      payments: { create: true, read: true, update: true, delete: true },
    },
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  "manager@company.com": {
    id: 2,
    email: "manager@company.com",
    password: "manager123",
    firstName: "John",
    lastName: "Manager",
    roleId: 2,
    roleName: "manager",
    rolePermissions: {
      users: { create: false, read: true, update: false, delete: false },
      settings: { manage: false },
      invoices: { create: true, read: true, update: true, delete: false },
      payments: { create: true, read: true, update: true, delete: false },
    },
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  "user@company.com": {
    id: 3,
    email: "user@company.com",
    password: "user123",
    firstName: "Jane",
    lastName: "User",
    roleId: 3,
    roleName: "user",
    rolePermissions: {
      users: { create: false, read: false, update: false, delete: false },
      settings: { manage: false },
      invoices: { create: true, read: true, update: false, delete: false },
      payments: { create: true, read: true, update: false, delete: false },
    },
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockUser = mockUsers[email.toLowerCase()]

        if (!mockUser || mockUser.password !== password) {
          return { success: false, message: "Invalid email or password" }
        }

        if (!mockUser.isActive) {
          return { success: false, message: "Account is deactivated" }
        }

        const { password: _, ...user } = mockUser
        user.lastLogin = new Date().toISOString()

        set({
          user,
          isAuthenticated: true,
        })

        // Store in localStorage for compatibility
        localStorage.setItem("isAuthenticated", "true")
        localStorage.setItem("userEmail", user.email)
        localStorage.setItem("userRole", user.roleName)

        return { success: true, message: "Login successful" }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
        localStorage.removeItem("isAuthenticated")
        localStorage.removeItem("userEmail")
        localStorage.removeItem("userRole")
        localStorage.removeItem("isTester")
      },

      updateLastLogin: () => {
        const { user } = get()
        if (user) {
          set({
            user: {
              ...user,
              lastLogin: new Date().toISOString(),
            },
          })
        }
      },

      hasPermission: (resource: string, action: string) => {
        const { user } = get()
        if (!user) return false

        const resourcePermissions = user.rolePermissions[resource]
        return resourcePermissions && resourcePermissions[action] === true
      },

      isAdmin: () => {
        const { user } = get()
        return user?.roleName === "admin"
      },

      isManager: () => {
        const { user } = get()
        return user?.roleName === "manager" || user?.roleName === "admin"
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
