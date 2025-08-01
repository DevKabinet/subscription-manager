"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "admin" | "manager" | "user"
  avatar?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => boolean
}

// Mock users for demo
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@company.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
  },
  {
    id: "2",
    email: "manager@company.com",
    firstName: "Manager",
    lastName: "User",
    role: "manager",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
  },
  {
    id: "3",
    email: "user@company.com",
    firstName: "Regular",
    lastName: "User",
    role: "user",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
  },
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const user = mockUsers.find((u) => u.email === email)

        // Simple password check for demo
        const validPasswords: Record<string, string> = {
          "admin@company.com": "admin123",
          "manager@company.com": "manager123",
          "user@company.com": "user123",
        }

        if (user && validPasswords[email] === password) {
          set({ user, isAuthenticated: true })
          return true
        }

        return false
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      checkAuth: () => {
        const { user } = get()
        return !!user
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
