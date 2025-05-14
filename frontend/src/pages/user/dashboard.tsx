"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Car, FileText, Clock, CheckCircle2, PlusCircle, Wrench, MessageSquare, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import api from "@/services/api"

interface Request {
  id: string
  service: string
  status: string
  date: string
  location: string
  company?: string
  price?: number
}

interface Invoice {
  id: string
  requestId: string
  status: string
  date: string
  amount: number
}

interface Chat {
  id: string
  company: string | { name: string }
  lastMessage: string | { content: string }
  unread: number
  unreadCount?: number
  date: string
  updatedAt?: string
  timestamp?: string
}

// Hàm lấy địa chỉ từ lat/lon bằng Nominatim
async function getAddressFromLatLon(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );
    const data = await response.json();
    return data.display_name || `${lat}, ${lon}`;
  } catch {
    return `${lat}, ${lon}`;
  }
}

export default function UserDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

  const [isLoading, setIsLoading] = useState(true)
  const [requests, setRequests] = useState<Request[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [activeRequests, setActiveRequests] = useState(0)
  const [completedRequests, setCompletedRequests] = useState(0)
  const [pendingInvoices, setPendingInvoices] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [requestsRes, invoicesRes, chatsRes] = await Promise.all([
          api.rescueRequests.getRequests(),
          api.invoices.getUserInvoices(),
          api.chats.getConversations(),
        ])

        console.log("chatsRes", chatsRes)

        // Map requests và lấy địa chỉ từ lat/lon
        const mappedRequests = await Promise.all(
          requestsRes.data.map(async (req: any) => {
            let address = req.description;
            if (!address && req.latitude && req.longitude) {
              address = await getAddressFromLatLon(req.latitude, req.longitude);
            }
            return {
              id: req.id,
              service: req.serviceName,
              status: req.status,
              date: req.createdAt,
              location: address || `${req.latitude}, ${req.longitude}`,
              company: req.companyName,
              price: req.finalPrice ?? req.estimatedPrice,
            };
          })
        );

        setRequests(mappedRequests)
        setInvoices(invoicesRes.data)
        setChats(chatsRes.data)

        // Các thống kê giữ nguyên
    setActiveRequests(
          mappedRequests.filter((req: any) =>
        [
          "CREATED",
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
          mappedRequests.filter((req: any) => ["COMPLETED", "INVOICED", "PAID"].includes(req.status)).length,
    )

        setPendingInvoices(invoicesRes.data.filter((inv: any) => inv.status === "PENDING").length)
        setUnreadMessages(chatsRes.data.reduce((total: number, chat: any) => total + (chat.unreadCount || 0), 0))
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

    fetchDashboardData()
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
    <motion.div style={{ opacity, scale }} className="w-full h-full p-0 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild>
          <Link to="/user/requests/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Request
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{completedRequests}</div>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

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
      </motion.div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Requests</TabsTrigger>
          <TabsTrigger value="invoices">Recent Invoices</TabsTrigger>
          <TabsTrigger value="chats">Recent Chats</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
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
                      <Badge
                        variant={
                          request.status === "COMPLETED"
                            ? "success"
                            : request.status === "IN_PROGRESS"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {request.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <CardDescription>
                      {new Date(request.date).toLocaleDateString()} • {request.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm">
                      <Car className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{request.company || "Awaiting company"}</span>
                    </div>
                    {request.price && <div className="mt-2 text-sm font-medium">${request.price.toFixed(2)}</div>}
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link to={`/user/requests/${request.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/user/requests">View All Requests</Link>
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
                      <Link to={`/user/invoices`}>View Invoice</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/user/invoices">View All Invoices</Link>
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
            {chats.slice(0, 4).map((chat) => {
              // Fallbacks for compatibility with both old and new chat data
              const companyName = typeof chat.company === 'string' ? chat.company : chat.company?.name || 'Unknown';
              const unreadCount = chat.unreadCount ?? chat.unread ?? 0;
              const updatedAt = chat.updatedAt ?? chat.timestamp ?? '';
              const lastMessageContent = typeof chat.lastMessage === 'string' ? chat.lastMessage : chat.lastMessage?.content || '';
              return (
              <motion.div key={chat.id} variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{companyName}</CardTitle>
                        {unreadCount > 0 && (
                          <Badge variant="default" className="ml-2">
                            {unreadCount} new
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                        {updatedAt ? new Date(updatedAt).toLocaleDateString() : ''} • {lastMessageContent}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild variant="ghost" size="sm" className="w-full">
                        <Link to={`/user/chat/${chat.id}`}>View Chat</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
              );
            })}
          </motion.div>

          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/user/chats">View All Chats</Link>
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
                <Link to="/user/requests/new">
                  <PlusCircle className="mb-2 h-6 w-6" />
                  <span>New Rescue Request</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col">
                <Link to="/user/requests">
                  <Wrench className="mb-2 h-6 w-6" />
                  <span>Track Requests</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col">
                <Link to="/user/chats">
                  <MessageSquare className="mb-2 h-6 w-6" />
                  <span>View Chats</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col">
                <Link to="/user/invoices">
                  <FileText className="mb-2 h-6 w-6" />
                  <span>View Invoices</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
