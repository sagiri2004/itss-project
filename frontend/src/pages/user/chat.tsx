"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare } from "lucide-react"

// Mock chat data
const mockChats = [
  {
    id: "chat-001",
    requestId: "req-001",
    companyId: "company-001",
    companyName: "FastFix Roadside",
    lastMessage: "We'll be there in about 15 minutes.",
    timestamp: "2023-05-07T14:30:00",
    unread: 2,
    status: "ACTIVE",
  },
  {
    id: "chat-002",
    requestId: "req-002",
    companyId: "company-002",
    companyName: "QuickHelp Auto",
    lastMessage: "Your invoice has been generated. Please check your email.",
    timestamp: "2023-05-06T11:45:00",
    unread: 0,
    status: "COMPLETED",
  },
  {
    id: "chat-003",
    requestId: "req-003",
    companyId: "company-003",
    companyName: "RoadHeroes Assistance",
    lastMessage: "We need to update the price to $95 due to additional parts needed.",
    timestamp: "2023-05-05T16:20:00",
    unread: 0,
    status: "PRICE_NEGOTIATION",
  },
  {
    id: "chat-004",
    requestId: "req-004",
    companyId: "company-001",
    companyName: "FastFix Roadside",
    lastMessage: "Thank you for using our service!",
    timestamp: "2023-05-02T09:15:00",
    unread: 0,
    status: "CLOSED",
  },
]

export default function UserChats() {
  const { user } = useAuth()
  const [chats, setChats] = useState(mockChats)
  const [searchTerm, setSearchTerm] = useState("")

  // Filter chats based on search term
  const filteredChats = chats.filter(
    (chat) =>
      chat.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default">Active</Badge>
      case "COMPLETED":
        return <Badge variant="success">Completed</Badge>
      case "PRICE_NEGOTIATION":
        return <Badge variant="outline">Price Negotiation</Badge>
      case "CLOSED":
        return <Badge variant="secondary">Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto max-w-4xl space-y-6 p-4"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Chats</h1>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Conversations</CardTitle>
            <CardDescription>Chat with roadside assistance providers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search conversations..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              {filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <MessageSquare className="mb-2 h-10 w-10 text-muted-foreground" />
                  <h3 className="mb-1 text-lg font-medium">No conversations found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? "Try adjusting your search term" : "You don't have any active conversations yet"}
                  </p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    variants={itemVariants}
                    className={`relative rounded-lg border p-4 transition-colors hover:bg-accent/50 ${
                      chat.unread > 0 ? "border-primary/50 bg-primary/5" : ""
                    }`}
                  >
                    <Link to={`/user/chat/${chat.id}`} className="block">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={`https://avatar.vercel.sh/${chat.companyName}`} />
                          <AvatarFallback>{chat.companyName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{chat.companyName}</h4>
                            <span className="text-xs text-muted-foreground">{formatDate(chat.timestamp)}</span>
                          </div>
                          <p className="line-clamp-1 text-sm text-muted-foreground">{chat.lastMessage}</p>
                          <div className="flex items-center justify-between pt-1">
                            <div>{getStatusBadge(chat.status)}</div>
                            {chat.unread > 0 && (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                {chat.unread}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
