"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Search, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { mockAdminChats } from "@/data/mock-data"

export default function AdminChats() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [chats, setChats] = useState(mockAdminChats)
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Filter chats
  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.participants.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      chat.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "issues" && chat.hasIssue) ||
      (activeTab === "unread" && chat.unreadCount > 0)

    return matchesSearch && matchesTab
  })

  const handleSelectChat = (chat: any) => {
    setSelectedChat(chat)

    // Mark as read when selected
    if (chat.unreadCount > 0) {
      setChats(
        chats.map((c) =>
          c.id === chat.id
            ? {
                ...c,
                unreadCount: 0,
              }
            : c,
        ),
      )
    }
  }

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return

    // Add message to chat
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: "admin",
      content: message,
      timestamp: new Date().toISOString(),
    }

    setChats(
      chats.map((chat) =>
        chat.id === selectedChat.id
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: newMessage,
            }
          : chat,
      ),
    )

    // Update selected chat
    setSelectedChat({
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage],
      lastMessage: newMessage,
    })

    // Clear input
    setMessage("")

    toast({
      title: "Message sent",
      description: "Your message has been sent to the conversation.",
    })
  }

  const resolveIssue = (chatId: string) => {
    setChats(
      chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              hasIssue: false,
            }
          : chat,
      ),
    )

    if (selectedChat && selectedChat.id === chatId) {
      setSelectedChat({
        ...selectedChat,
        hasIssue: false,
      })
    }

    toast({
      title: "Issue resolved",
      description: "The issue has been marked as resolved.",
    })
  }

  // Helper to format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Chat Management</h1>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="h-[calc(100vh-12rem)]">
          <CardHeader className="pb-3">
            <CardTitle>Support Conversations</CardTitle>
            <CardDescription>Monitor and manage conversations between users and companies</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex h-[calc(100%-5rem)]">
            <div className="w-1/3 border-r h-full flex flex-col">
              <div className="p-4">
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search conversations..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <Tabs defaultValue="all" className="mt-4" onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="issues">Issues</TabsTrigger>
                    <TabsTrigger value="unread">Unread</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex-1 overflow-auto">
                {filteredChats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground">No conversations found</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredChats.map((chat) => (
                      <div
                        key={chat.id}
                        className={`p-4 cursor-pointer hover:bg-muted/50 ${
                          selectedChat?.id === chat.id ? "bg-muted" : ""
                        }`}
                        onClick={() => handleSelectChat(chat)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <div className="font-medium">
                              {chat.participants.find((p) => p.role === "user")?.name} ↔{" "}
                              {chat.participants.find((p) => p.role === "company")?.name}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Request: {chat.requestId}</div>
                          </div>
                          <div className="flex items-center">
                            {chat.unreadCount > 0 && (
                              <div className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center mr-2">
                                {chat.unreadCount}
                              </div>
                            )}
                            {chat.hasIssue && (
                              <div className="text-red-500">
                                <AlertTriangle className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 text-sm truncate">{chat.lastMessage.content}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {new Date(chat.lastMessage.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="w-2/3 h-full flex flex-col">
              {selectedChat ? (
                <>
                  <div className="p-4 border-b flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">
                        {selectedChat.participants.find((p: { role: string }) => p.role === "user")?.name} ↔{" "}
                        {selectedChat.participants.find((p: { role: string }) => p.role === "company")?.name}
                      </h3>
                      <div className="text-xs text-muted-foreground">Request: {selectedChat.requestId}</div>
                    </div>
                    <div className="flex gap-2">
                      {selectedChat.hasIssue && (
                        <Button size="sm" onClick={() => resolveIssue(selectedChat.id)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Resolve Issue
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto p-4 space-y-4">
                    {selectedChat.messages.map((msg: { id: string; sender: string; content: string; timestamp: string }) => {
                      const sender = selectedChat.participants.find((p: { id: string; role: string; name: string }) => p.id === msg.sender)
                      const isAdmin = msg.sender === "admin"
                      const isUser = sender?.role === "user"

                      return (
                        <div key={msg.id} className={`flex ${isAdmin || isUser ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`rounded-lg p-3 max-w-[80%] ${
                              isAdmin
                                ? "bg-primary text-primary-foreground"
                                : isUser
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                                  : "bg-muted"
                            }`}
                          >
                            <div className="text-xs font-medium mb-1">{isAdmin ? "Admin" : sender?.name}</div>
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-xs opacity-70 mt-1">{formatTimestamp(msg.timestamp)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button onClick={handleSendMessage}>Send</Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Conversation Selected</h3>
                  <p className="text-muted-foreground">
                    Select a conversation from the list to view and respond to messages.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
