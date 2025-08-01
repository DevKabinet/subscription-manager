"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, LogIn, Shield, User, UserCheck } from "lucide-react"
import { useAuthStore } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await login(formData.email, formData.password)

      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  const demoAccounts = [
    {
      email: "admin@company.com",
      password: "admin123",
      role: "Admin",
      description: "Full system access",
      icon: Shield,
      color: "bg-red-500",
    },
    {
      email: "manager@company.com",
      password: "manager123",
      role: "Manager",
      description: "Limited admin access",
      icon: UserCheck,
      color: "bg-blue-500",
    },
    {
      email: "user@company.com",
      password: "user123",
      role: "User",
      description: "Basic access",
      icon: User,
      color: "bg-green-500",
    },
  ]

  const fillDemoAccount = (email: string, password: string) => {
    setFormData({ email, password })
    setError("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Manager</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <LogIn className="h-5 w-5" />
              Login
            </CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm">Demo Accounts</CardTitle>
            <CardDescription className="text-xs">Click to auto-fill credentials for testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {demoAccounts.map((account) => (
              <Button
                key={account.email}
                variant="outline"
                className="w-full justify-start h-auto p-3 bg-transparent"
                onClick={() => fillDemoAccount(account.email, account.password)}
                disabled={isLoading}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-1.5 rounded-full ${account.color}`}>
                    <account.icon className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{account.role}</span>
                      <Badge variant="secondary" className="text-xs">
                        {account.email}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{account.description}</p>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>© 2024 Subscription Manager. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
