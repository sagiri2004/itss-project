"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Car, FileText, Clock, CheckCircle2, PlusCircle, Wrench, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data
const mockRequests = [
  {
    id: "req-001",
    service: "Flat Tire Replacement",
    status: "COMPLETED",
    date: "2023-05-01T10:30:00",
    company: "FastFix Roadside",
    location: "123 Main St, Anytown",
    price: 85.0,
  },
  {
    id: "req-002",
    service: "Battery Jump Start",
    status: "IN_PROGRESS",
    date: "2023-05-05T14:15:00",
    company: "QuickHelp Auto",
    location: "456 Oak Ave, Somewhere",
    price: 65.0,
  },
  {
    id: "req-003",
    service: "Vehicle Towing",
    status: "CREATED",
    date: "2023-05-07T09:00:00",
    company: null,
    location: "789 Pine Rd, Nowhere",
    price: null,
  },
]

const mockInvoices = [
  {
    id: "inv-001",
    requestId: "req-001",
    amount: 85.0,
    status: "PAID",
    date: "2023-05-01T16:45:00",
  },
  {
    id: "inv-002",
    requestId: "req-002",
    amount: 65.0,
    status: "PENDING",
    date: "2023-05-05T17:30:00",
  },
]

// Mock chats data
const mockChats = [
  {
    id: "chat-001",
    requestId: "req-001",
    companyId: "company-001",
    companyName: "FastFix Roadside",
    lastMessage: "We'll be there in about 15 minutes.",
    timestamp: "2023-05-07T14:30:00",
    unread: 2,
  },
  {
    id: "chat-002",
    requestId: "req-002",
    companyId: "company-002",
    companyName: "QuickHelp Auto",
    lastMessage: "Your invoice has been generated. Please check your email.",
    timestamp: "2023-05-06T11:45:00",
    unread: 0,
  },
]

export default function UserDashboard() {
  const { user } = useAuth()
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

  const [activeRequests, setActiveRequests] = useState(0)
  const [completedRequests, setCompletedRequests] = useState(0)
  const [pendingInvoices, setPendingInvoices] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    // Calculate dashboard stats
    setActiveRequests(
      mockRequests.filter((req) =>
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

    setCompletedRequests(mockRequests.filter((req) => ["COMPLETED", "INVOICED", "PAID"].includes(req.status)).length)

    setPendingInvoices(mockInvoices.filter((inv) => inv.status === "PENDING").length)

    setUnreadMessages(mockChats.reduce((total, chat) => total + chat.unread, 0))
  }, [])

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

  return (
    <motion.div style={{ opacity, scale }} className="space-y-6">
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
            {mockRequests.slice(0, 4).map((request, index) => (
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
            {mockInvoices.map((invoice, index) => (
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
            {mockChats.map((chat, index) => (
              <motion.div key={chat.id} variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{chat.companyName}</CardTitle>
                      {chat.unread > 0 && (
                        <Badge variant="default">
                          {chat.unread} new {chat.unread === 1 ? "message" : "messages"}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {new Date(chat.timestamp).toLocaleDateString()} • Request #{chat.requestId}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="line-clamp-1 text-sm text-muted-foreground">{chat.lastMessage}</div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link to={`/user/chat/${chat.id}`}>View Conversation</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/user/chats">View All Conversations</Link>
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`https://avatar.vercel.sh/${user?.name || "user"}`} />
                <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{user?.name || "John Doe"}</h3>
                <p className="text-sm text-muted-foreground">User • Member since {new Date().getFullYear()}</p>
                <div className="flex space-x-2">
                  <Badge variant="outline">3 Active Requests</Badge>
                  <Badge variant="outline">{completedRequests} Completed</Badge>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/user/profile">Edit Profile</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
