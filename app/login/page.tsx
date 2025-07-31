"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login - in real app, this would call your auth API
    setTimeout(() => {
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("userEmail", email)
      router.push("/dashboard")
    }, 1000)
  }

  const handleTesterLogin = () => {
    setIsLoading(true)
    localStorage.setItem("isAuthenticated", "true")
    localStorage.setItem("userEmail", "tester@example.com")
    localStorage.setItem("isTester", "true")
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md hover-lift">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Subscription Manager</CardTitle>
          <CardDescription>Sign in to manage your subscriptions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="hover-lift"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="hover-lift"
              />
            </div>
            <Button type="submit" className="w-full hover-lift" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full hover-lift bg-transparent"
            onClick={handleTesterLogin}
            disabled={isLoading}
          >
            Continue as Tester
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
