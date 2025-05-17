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
  name: string
  email: string
  phone: string
  role: string
  status: "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION"
  isVerified: boolean
  lastLogin: string
  joinDate: string
  requestsCount: number
  companyId?: string
  companyName?: string
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

  // Fetch users when component mounts
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/login')
      return
    }

    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const response = await api.admin.getUsers()
        
        // Map response data to our interface
        const mappedUsers: User[] = response.data.map((u: any) => ({
          id: u.id,
          name: u.name || u.username || "",
          email: u.email || "",
          phone: u.phone || '',
          role: (u.role || (u.roles && u.roles[0]) || "user").toLowerCase(),
          status: u.status || "",
          isVerified: u.isVerified || false,
          lastLogin: u.lastLogin || u.updatedAt || "",
          joinDate: u.createdAt || "",
          requestsCount: u.requestsCount || 0,
          companyId: u.company?.id || "",
          companyName: u.company?.name || ""
        }))

        setUsers(mappedUsers)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading users",
          description: error.response?.data?.message || "Could not load users"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [toast, user, navigate])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.status || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = !roleFilter || roleFilter === "ALL" || user.role === roleFilter

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
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No users found. Try adjusting your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((userData) => (
                      <TableRow key={userData.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={`https://avatar.vercel.sh/${userData.name}`} />
                              <AvatarFallback>{userData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{userData.name}</div>
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <Calendar className="mr-1 h-3 w-3" />
                                <span>Last login: {new Date(userData.lastLogin).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Mail className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                            <span>{userData.email}</span>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Phone className="mr-1 h-3 w-3" />
                            <span>{userData.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={userData.role === "admin" ? "default" : "outline"}>
                            {userData.role.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            {getUserStatusBadge(userData.status)}
                            {userData.isVerified ? (
                              <div className="flex items-center text-xs text-green-500">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                <span>Verified</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <XCircle className="mr-1 h-3 w-3" />
                                <span>Not Verified</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{new Date(userData.joinDate).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">{userData.requestsCount} requests</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openDetailDialog(userData)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Details
                            </Button>
                            {userData.status === "PENDING_VERIFICATION" && (
                              <Button size="sm" onClick={() => verifyUser(userData.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Verify
                              </Button>
                            )}
                            {userData.status === "ACTIVE" && (
                              <Button variant="outline" size="sm" onClick={() => suspendUser(userData.id)}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Suspend
                              </Button>
                            )}
                            {userData.status === "SUSPENDED" && (
                              <Button size="sm" onClick={() => activateUser(userData.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate
                              </Button>
                            )}
                          </div>
                        </TableCell>
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
                    {getUserStatusBadge(currentUser.status)}
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
                    <div className="flex items-center text-sm">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{currentUser.phone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Account Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Joined: {new Date(currentUser.joinDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Last Login: {new Date(currentUser.lastLogin).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Verification Status</div>
                    {currentUser.isVerified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : (
                      <Badge variant="outline">Not Verified</Badge>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Requests</div>
                    <div className="text-sm">{currentUser.requestsCount}</div>
                  </div>
                </div>
              </div>

              {currentUser.companyId && (
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Company</div>
                    <div className="text-sm">{currentUser.companyName}</div>
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
