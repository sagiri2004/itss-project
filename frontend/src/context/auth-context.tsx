"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import api from "@/services/api"

type User = {
  id: string
  username: string
  name: string
  email: string
  role: "user" | "company" | "admin"
  companyId: string | null
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, name: string, email: string, password: string, role: "user" | "company") => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("roadside-user")
    const storedToken = localStorage.getItem("token")
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    setLoading(true)
    try {
      const response = await api.auth.login({ username, password })
      // console.log("Login API response:", response)
      const { token, user } = response.data

      // Store token in localStorage
      localStorage.setItem("token", token)

      setUser(user)
      localStorage.setItem("roadside-user", JSON.stringify(user))
    } catch (error: any) {
      console.error("Login error:", error)
      if (error.response) {
        console.error("Error response data:", error.response.data)
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (username: string, name: string, email: string, password: string, role: "user" | "company") => {
    setLoading(true)
    try {
      const response = await api.auth.register({
        username,
        name,
        email,
        password,
        roles: [role.toUpperCase()],
      })

      const { token, userId, companyId } = response.data

      // Store token in localStorage
      localStorage.setItem("token", token)

      const user: User = {
        id: userId,
        username,
        name,
        email,
        role,
        companyId: companyId,
      }

      setUser(user)
      localStorage.setItem("roadside-user", JSON.stringify(user))
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("roadside-user")
    localStorage.removeItem("token")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
