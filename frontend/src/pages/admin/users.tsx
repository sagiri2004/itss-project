"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { useNavigate } from "react-router-dom"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Search, Eye, CheckCircle, XCircle, Calendar, Mail, Phone, Lock, Shield } from "lucide-react"
import api from "@/services/api"

// Interfaces
interface User {
  id: string
  username: string
  name: string
  email: string
  role: string
  companyId: string | null
  isOnline?: boolean
}

export default function AdminUsers() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string | null>("ALL")
  const [users, setUsers] = useState<User[]>([])
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

  // Fetch users and online users when component mounts
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/login')
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [usersResponse, onlineUsersResponse] = await Promise.all([
          api.admin.getUsers(),
          api.admin.getOnlineUsers()
        ])
        setUsers(usersResponse.data)
        setOnlineUsers(onlineUsersResponse.data)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: error.response?.data?.message || "Could not load data"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    // Refresh online users every 30 seconds
    const interval = setInterval(() => {
      api.admin.getOnlineUsers()
        .then(response => setOnlineUsers(response.data))
        .catch(error => console.error('Error fetching online users:', error))
    }, 30000)

    return () => clearInterval(interval)
  }, [toast, user, navigate])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !roleFilter || roleFilter === "ALL" || user.role.toLowerCase() === roleFilter
    return matchesSearch && matchesRole
  })

  const openDetailDialog = (user: User) => {
    setCurrentUser(user)
    setIsDetailDialogOpen(true)
  }

  const verifyUser = async (id: string) => {
    try {
      // Call API to verify user
      const response = await api.users.updateUser(id, {
        isVerified: true,
        status: "ACTIVE"
      })

      // Update local state
      setUsers(users.map((user) =>
        user.id === id
          ? {
              ...user,
              isVerified: true,
              status: "ACTIVE",
            }
          : user,
      ))

      const targetUser = users.find((u) => u.id === id)
      toast({
        title: "User verified",
        description: `${targetUser?.name} has been verified successfully.`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Could not verify user"
      })
    }
  }

  const suspendUser = async (id: string) => {
    try {
      // Call API to suspend user
      const response = await api.users.updateUser(id, {
        status: "SUSPENDED"
      })

      // Update local state
      setUsers(users.map((user) =>
        user.id === id
          ? {
              ...user,
              status: "SUSPENDED",
            }
          : user,
      ))

      const targetUser = users.find((u) => u.id === id)
      toast({
        title: "User suspended",
        description: `${targetUser?.name} has been suspended from the platform.`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Could not suspend user"
      })
    }
  }

  const activateUser = async (id: string) => {
    try {
      // Call API to activate user
      const response = await api.users.updateUser(id, {
        status: "ACTIVE"
      })

      // Update local state
      setUsers(users.map((user) =>
        user.id === id
          ? {
              ...user,
              status: "ACTIVE",
            }
          : user,
      ))

      const targetUser = users.find((u) => u.id === id)
      toast({
        title: "User activated",
        description: `${targetUser?.name} has been activated on the platform.`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Could not activate user"
      })
    }
  }

  const resetPassword = async (id: string) => {
    try {
      // Call API to reset password
      await api.admin.resetPassword(id)
      
      toast({
        title: "Password reset",
        description: "A password reset email has been sent to the user.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Could not reset password"
      })
    }
  }

  // Helper to get badge variant based on user status
  const getUserStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">ACTIVE</Badge>
      case "PENDING_VERIFICATION":
        return <Badge variant="outline">PENDING VERIFICATION</Badge>
      case "SUSPENDED":
        return <Badge variant="destructive">SUSPENDED</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            {onlineUsers.length} Online
          </Badge>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage users and their access to the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={roleFilter === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter(null)}
                >
                  All
                </Button>
                <Button
                  variant={roleFilter === "user" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter("user")}
                >
                  Users
                </Button>
                <Button
                  variant={roleFilter === "admin" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter("admin")}
                >
                  Admins
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No users found. Try adjusting your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((userData) => (
                      <TableRow key={userData.id}>
                        <TableCell>
                          {onlineUsers.includes(userData.id) ? (
                            <Badge variant="success" className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              Online
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                              Offline
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{userData.id}</TableCell>
                        <TableCell>{userData.username}</TableCell>
                        <TableCell>{userData.name}</TableCell>
                        <TableCell>{userData.email}</TableCell>
                        <TableCell>{userData.role}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        {currentUser && (
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>Detailed information about {currentUser.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://avatar.vercel.sh/${currentUser.name}`} />
                  <AvatarFallback className="text-lg">{currentUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{currentUser.name}</h3>
                  <div className="flex items-center mt-1">
                    <Badge variant={currentUser.role === "admin" ? "default" : "outline"} className="mr-2">
                      {currentUser.role.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{currentUser.email}</span>
                    </div>
                  </div>
                </div>

              </div>

              {currentUser.companyId && (
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Company</div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="flex justify-between">
              <div>
                <Button variant="outline" size="sm" className="mr-2" onClick={() => resetPassword(currentUser.id)}>
                  <Lock className="mr-2 h-4 w-4" />
                  Reset Password
                </Button>
                <Button variant="outline" size="sm">
                  <Shield className="mr-2 h-4 w-4" />
                  Change Role
                </Button>
              </div>
              <Button variant="default" onClick={() => setIsDetailDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </motion.div>
  )
}
