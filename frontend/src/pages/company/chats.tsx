"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MessageSquare, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import api from "@/services/api"
import type { Chat, ChatMessage, SenderType } from "@/types/chat"

export default function CompanyChats() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchChats = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await api.chats.getConversations()
        setChats(
          response.data.map((item: any) => ({
            id: item.id,
            participants: [
              { 
                id: item.user.id, 
                name: item.user.name, 
                role: "USER" as SenderType 
              },
              { 
                id: item.company.id, 
                name: item.company.name, 
                role: "RESCUE_COMPANY" as SenderType 
              }
            ],
            lastMessage: item.lastMessage ? {
              id: item.lastMessage.id,
              content: item.lastMessage.content,
              senderType: item.lastMessage.senderType as SenderType,
              senderId: item.lastMessage.senderId,
              sentAt: item.lastMessage.sentAt,
              conversationId: item.id
            } : undefined,
            unreadCount: item.unreadCount,
            hasUnreadMessages: item.hasUnreadMessages,
            status: item.status,
            updatedAt: item.updatedAt
          }))
        )
      } catch (error: any) {
        setError("Không thể tải danh sách chat")
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: error.response?.data?.message || "Không thể tải danh sách chat",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchChats()
  }, [toast])

  // Filter chats based on search term and active tab
  const filteredChats = chats.filter(
    (chat) => {
      const matchesSearch =
        chat.participants.some(participant => participant.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (chat.lastMessage?.content || "").toLowerCase().includes(searchTerm.toLowerCase())
      if (activeTab === "all") return matchesSearch
      if (activeTab === "active") return matchesSearch && chat.status === "ACTIVE"
      if (activeTab === "negotiation") return matchesSearch && chat.status === "PRICE_NEGOTIATION"
      if (activeTab === "completed") return matchesSearch && (chat.status === "COMPLETED" || chat.status === "CLOSED")
      return matchesSearch
    }
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        {error}
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full h-full p-0 space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Customer Chats</h1>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Conversations</CardTitle>
            <CardDescription>Chat with customers about their roadside assistance requests</CardDescription>
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
            <Tabs defaultValue="all" className="mb-4" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="negotiation">Negotiation</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
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
                      chat.unreadCount > 0 ? "border-primary/50 bg-primary/5" : ""
                    }`}
                  >
                    <Link to={`/company/chat/${chat.id}`} className="block">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={`https://avatar.vercel.sh/${chat.participants.find(p => p.role === "USER")?.name}`} />
                          <AvatarFallback>{chat.participants.find(p => p.role === "USER")?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{chat.participants.find(p => p.role === "USER")?.name}</h4>
                            <span className="text-xs text-muted-foreground">{formatDate(chat.updatedAt)}</span>
                          </div>
                          <p className="line-clamp-1 text-sm text-muted-foreground">{chat.lastMessage?.content}</p>
                          <div className="flex items-center justify-between pt-1">
                            <div>{getStatusBadge(chat.status)}</div>
                            {chat.unreadCount > 0 && (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                                {chat.unreadCount}
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
