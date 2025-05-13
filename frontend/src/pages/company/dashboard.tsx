"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Car,
  Clock,
  AlertCircle,
  PlusCircle,
  Wrench,
  Truck,
  DollarSign,
  FileText,
  MessageSquare,
  Loader2,
  Star,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import api from "@/services/api"

interface CompanyRequest {
  id: string
  service: string
  status: string
  date: string
  location: string
  user: { id: string; name: string }
  price?: number
}

interface CompanyVehicle {
  id: string
  name: string
  type: string
  status: string
  lastMaintenance?: string
}

interface CompanyInvoice {
  id: string
  requestId: string
  status: string
  date: string
  amount: number
}

interface CompanyChat {
  id: string
  user: { id: string; name: string }
  lastMessage?: { content: string }
  unreadCount: number
  updatedAt: string
}

export default function CompanyDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

  const [isLoading, setIsLoading] = useState(true)
  const [requests, setRequests] = useState<CompanyRequest[]>([])
  const [vehicles, setVehicles] = useState<CompanyVehicle[]>([])
  const [invoices, setInvoices] = useState<CompanyInvoice[]>([])
  const [chats, setChats] = useState<CompanyChat[]>([])

  // Stats
  const [newRequests, setNewRequests] = useState(0)
  const [activeRequests, setActiveRequests] = useState(0)
  const [completedRequests, setCompletedRequests] = useState(0)
  const [availableVehicles, setAvailableVehicles] = useState(0)
  const [pendingInvoices, setPendingInvoices] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [averageRating, setAverageRating] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [requestsRes, vehiclesRes, invoicesRes, chatsRes, reviewsRes] = await Promise.all([
          api.rescueRequests.getCompanyRequests(),
          api.rescueVehicles.getVehicles(),
          api.invoices.getCompanyInvoices(),
          api.chats.getConversations(),
          api.reviews.getCompanyReviews(user?.companyId || ""),
        ])
        // Map requests
        const mappedRequests: CompanyRequest[] = requestsRes.data.map((req: any) => ({
          id: req.id,
          service: req.serviceName || req.service,
          status: req.status,
          date: req.createdAt || req.date,
          location: req.location || req.address || "",
          user: req.user || { id: req.userId, name: req.userName },
          price: req.finalPrice ?? req.price ?? req.estimatedPrice,
        }))
        // Map vehicles
        const mappedVehicles: CompanyVehicle[] = vehiclesRes.data.map((veh: any) => ({
          id: veh.id,
          name: veh.name,
          type: veh.type,
          status: veh.status,
          lastMaintenance: veh.lastMaintenance,
        }))
        // Map invoices
        const mappedInvoices: CompanyInvoice[] = invoicesRes.data.map((inv: any) => ({
          id: inv.id,
          requestId: inv.requestId,
          status: inv.status,
          date: inv.createdAt || inv.date,
          amount: inv.amount,
        }))
        // Map chats
        const mappedChats: CompanyChat[] = chatsRes.data.map((chat: any) => ({
          id: chat.id,
          user: chat.user || { id: chat.userId, name: chat.userName },
          lastMessage: chat.lastMessage,
          unreadCount: chat.unreadCount ?? 0,
          updatedAt: chat.updatedAt || chat.lastUpdated || chat.timestamp,
        }))

        setRequests(mappedRequests)
        setVehicles(mappedVehicles)
        setInvoices(mappedInvoices)
        setChats(mappedChats)

        setNewRequests(mappedRequests.filter((req) => req.status === "CREATED").length)
        setActiveRequests(
          mappedRequests.filter((req) =>
            [
              "ACCEPTED_BY_COMPANY",
              "RESCUE_VEHICLE_DISPATCHED",
              "RESCUE_VEHICLE_ARRIVED",
              "INSPECTION_DONE",
              "PRICE_UPDATED",
              "IN_PROGRESS",
            ].includes(req.status),
          ).length,
        )
        setCompletedRequests(
          mappedRequests.filter((req) => ["COMPLETED", "INVOICED", "PAID"].includes(req.status)).length,
        )
        setAvailableVehicles(mappedVehicles.filter((veh) => veh.status === "AVAILABLE").length)
        setPendingInvoices(mappedInvoices.filter((inv) => inv.status === "PENDING").length)
        setTotalRevenue(
          mappedRequests
            .filter((req) => ["COMPLETED", "INVOICED", "PAID"].includes(req.status))
            .reduce((sum, req) => sum + (req.price || 0), 0),
        )
        setUnreadMessages(mappedChats.reduce((total, chat) => total + (chat.unreadCount || 0), 0))

        // Calculate average rating
        if (reviewsRes.data && reviewsRes.data.length > 0) {
          const totalRating = reviewsRes.data.reduce((sum: number, review: any) => sum + review.rating, 0)
          setAverageRating(totalRating / reviewsRes.data.length)
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading dashboard",
          description: error.response?.data?.message || "Failed to load dashboard data",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [toast])

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
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <motion.div style={{ opacity, scale }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Company Dashboard</h1>
        <Button asChild>
          <Link to="/company/services">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Service
          </Link>
        </Button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{newRequests}</div>
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{activeRequests}</div>
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{availableVehicles}</div>
                <Truck className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{pendingInvoices}</div>
                <FileText className="h-5 w-5 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unread Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{unreadMessages}</div>
                <MessageSquare className="h-5 w-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{averageRating ? averageRating.toFixed(1) : "N/A"}</div>
                <Star className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Recent Requests</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="chats">Chats</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 md:grid-cols-2"
          >
            {requests.slice(0, 4).map((request) => (
              <motion.div key={request.id} variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{request.service}</CardTitle>
                      <Badge variant="outline">{request.status.replace(/_/g, " ")}</Badge>
                    </div>
                    <CardDescription>
                      {new Date(request.date).toLocaleDateString()} • {request.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm">
                      <Car className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Customer: {request.user.name}</span>
                    </div>
                    {request.price && <div className="mt-2 text-sm font-medium">${request.price.toFixed(2)}</div>}
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link to={`/company/requests/${request.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/company/requests">View All Requests</Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 md:grid-cols-2"
          >
            {vehicles.slice(0, 4).map((vehicle) => (
              <motion.div key={vehicle.id} variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{vehicle.name}</CardTitle>
                      <Badge
                        variant={
                          vehicle.status === "AVAILABLE"
                            ? "success"
                            : vehicle.status === "IN_USE"
                              ? "default"
                              : "outline"
                        }
                      >
                        {vehicle.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {vehicle.type} • Last maintenance: {vehicle.lastMaintenance}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link to={`/company/vehicles/${vehicle.id}`}>View Vehicle Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/company/vehicles">View All Vehicles</Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 md:grid-cols-2"
          >
            {invoices.slice(0, 4).map((invoice) => (
              <motion.div key={invoice.id} variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Invoice #{invoice.id}</CardTitle>
                      <Badge variant={invoice.status === "PAID" ? "success" : "outline"}>{invoice.status}</Badge>
                    </div>
                    <CardDescription>
                      {new Date(invoice.date).toLocaleDateString()} • Request #{invoice.requestId}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-lg font-bold">${invoice.amount.toFixed(2)}</div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link to={`/company/invoices/${invoice.id}`}>View Invoice</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/company/invoices">View All Invoices</Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="chats" className="space-y-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 md:grid-cols-2"
          >
            {chats.slice(0, 4).map((chat) => (
              <motion.div key={chat.id} variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{chat.user.name}</CardTitle>
                      {chat.unreadCount > 0 && (
                        <Badge variant="default" className="ml-2">
                          {chat.unreadCount} new
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString() : ""} •{" "}
                      {chat.lastMessage?.content || ""}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link to={`/company/chat/${chat.id}`}>View Chat</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/company/chats">View All Chats</Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button asChild variant="outline" className="h-24 flex-col">
                <Link to="/company/services">
                  <PlusCircle className="mb-2 h-6 w-6" />
                  <span>Add New Service</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col">
                <Link to="/company/vehicles">
                  <Truck className="mb-2 h-6 w-6" />
                  <span>Manage Vehicles</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col">
                <Link to="/company/requests">
                  <Wrench className="mb-2 h-6 w-6" />
                  <span>View All Requests</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col">
                <Link to="/company/reviews">
                  <Star className="mb-2 h-6 w-6" />
                  <span>Customer Reviews</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
