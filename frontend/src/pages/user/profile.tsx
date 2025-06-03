"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, User, Mail, Calendar, MapPin, Car, Shield } from "lucide-react"
import api from "@/services/api"
import { useParams } from "react-router-dom"

export default function UserProfile() {
  const { user } = useAuth()
  const { id: paramId } = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })
  const [userRequests, setUserRequests] = useState<any[]>([])

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = paramId || user?.id
      if (!userId) return
      try {
        const response = await api.users.getUserById(userId)
        const userData = response.data
        setUserDetails(userData)
        setFormData({
          name: userData.name,
          email: userData.email,
        })
        if (userData.companyId) {
          const companyRes = await api.rescueCompanies.getCompanyBasic(userData.companyId)
          setUserDetails((prev: any) => ({ ...prev, company: companyRes.data }))
        }
        const reqRes = await api.rescueRequests.getRequests()
        setUserRequests(reqRes.data || [])
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.response?.data?.message || "Failed to load user profile",
        })
      }
    }
    fetchUserProfile()
  }, [user, paramId, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.users.updateProfile(formData)
      const updatedUser = response.data

      setUserDetails(updatedUser)
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.response?.data?.message || "There was an error updating your profile.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 260, damping: 20 },
    },
  }

  if (!userDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-6 sm:py-8 space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border border-border">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 sm:p-8 text-primary-foreground">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-background">
                  <AvatarImage src={`https://avatar.vercel.sh/${userDetails.name}`} />
                  <AvatarFallback className="text-lg sm:text-xl">{userDetails.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold">{userDetails.name}</h1>
                  <p className="text-sm sm:text-base text-primary-foreground/90 mt-1">
                    Member since {userDetails.createdAt ? new Date(userDetails.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
        <TabsList className="w-full justify-start p-1 bg-muted rounded-lg">
          <TabsTrigger value="profile" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Profile Information
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 sm:space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="bg-card border border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-foreground">Edit Profile</CardTitle>
                <CardDescription className="text-muted-foreground">Update your account information</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <User className="h-4 w-4 text-indigo-600" />
                        Username
                      </Label>
                      <Input
                        id="username"
                        name="username"
                        value={userDetails?.username || ""}
                        disabled
                        className="text-sm bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <User className="h-4 w-4 text-indigo-600" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Mail className="h-4 w-4 text-indigo-600" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-card border border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-foreground">Account Information</CardTitle>
                <CardDescription className="text-muted-foreground">Details about your account</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1 text-foreground">User ID</p>
                      <p className="text-sm text-muted-foreground">{userDetails.id}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1 text-foreground">Role</p>
                      <p className="text-sm text-muted-foreground">{userDetails.role}</p>
                    </div>
                  </div>
                  {userDetails.companyId && (
                    <div className="flex items-start gap-3">
                      <Car className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="font-medium mb-1 text-foreground">Company ID</p>
                        <p className="text-sm text-muted-foreground">{userDetails.companyId}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {userDetails?.company && (
            <motion.div variants={itemVariants}>
              <Card className="bg-card border border-border">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-foreground">Company Information</CardTitle>
                  <CardDescription className="text-muted-foreground">Basic company details</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <Car className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1 text-foreground">Name</p>
                      <p className="text-sm text-muted-foreground">{userDetails.company.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div>
                      <p className="font-medium mb-1 text-foreground">Phone</p>
                      <p className="text-sm text-muted-foreground">{userDetails.company.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <p className="font-medium mb-1 text-foreground">Description</p>
                    <p className="text-sm text-muted-foreground">{userDetails.company.description}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1 text-foreground">Location</p>
                      <p className="text-sm text-muted-foreground">
                        Lat: {userDetails.company.latitude}, Long: {userDetails.company.longitude}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <Card className="bg-card border border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-foreground">My Rescue Requests</CardTitle>
                <CardDescription className="text-muted-foreground">List of your rescue requests</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                {userRequests.length === 0 ? (
                  <div className="text-center text-muted-foreground py-6">
                    <Car className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                    <p>No requests found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-4 py-2 text-left font-medium text-foreground">Request ID</th>
                          <th className="px-4 py-2 text-left font-medium text-foreground">Status</th>
                          <th className="px-4 py-2 text-left font-medium text-foreground">Created At</th>
                          <th className="px-4 py-2 text-left font-medium text-foreground">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userRequests.map((req, index) => (
                          <tr key={req.id} className={`border-b border-border ${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}>
                            <td className="px-4 py-2 text-foreground">{req.id}</td>
                            <td className="px-4 py-2 text-foreground">{req.status}</td>
                            <td className="px-4 py-2 text-foreground">
                              {req.createdAt ? new Date(req.createdAt).toLocaleString() : ''}
                            </td>
                            <td className="px-4 py-2 text-foreground">{req.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}