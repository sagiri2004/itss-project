"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import api from "@/services/api"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"user" | "company" | "admin">("user")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Call login from auth context
      await login(username, password)

      toast({
        title: "Login successful",
        description: "Welcome back! You are now logged in.",
      })

      // Redirect based on role and companyId
      const user = JSON.parse(localStorage.getItem("roadside-user") || "{}")
      if (user.role === "admin") {
        navigate("/admin")
      } else if (user.role === "company") {
        // Check if company profile exists
        if (!user.companyId) {
          navigate("/create-company")
        } else {
          navigate("/company")
        }
      } else {
        navigate("/user")
      }
    } catch (error: any) {
      let errorTitle = "Login failed"
      let errorMsg = "Please check your credentials and try again."
      
      // Debug: xem cấu trúc error object thực tế
      console.log("Login error:", error)

      // An toàn tuyệt đối khi truy cập error.response.data
      if (error && typeof error === "object" && 'response' in error && error.response && 'data' in error.response && error.response.data) {
        if (typeof error.response.data === "object") {
          const { error: errorType, details, status } = error.response.data
          errorTitle = errorType || "Login failed"
          errorMsg = details || errorMsg
          if (status) errorMsg += ` (Status: ${status})`
        } else if (typeof error.response.data === "string") {
          errorMsg = error.response.data
        }
      }

      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMsg,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Set username based on role for demo purposes
  const handleRoleChange = (value: string) => {
    setRole(value as "user" | "company" | "admin")
    setUsername(value)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2,
                }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary-foreground"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </motion.div>
            </div>
            <CardTitle className="text-center text-2xl font-bold">Roadside Assistance</CardTitle>
            <CardDescription className="text-center">Enter your username below to login to your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="user" onValueChange={handleRoleChange}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="user">User</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              <div className="text-sm text-muted-foreground text-center">
                <Link to="/auth/forgot-password" className="text-primary hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
