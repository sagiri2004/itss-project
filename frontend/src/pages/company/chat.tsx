"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import ChatInterface from "@/components/chat/chat-interface"
import type { Message } from "@/types/chat"

// Mock data for a specific chat
const mockChatData = {
  "chat-001": {
    id: "chat-001",
    requestId: "req-001",
    userId: "user-001",
    userName: "John Doe",
    service: "Flat Tire Replacement",
    status: "ACCEPTED_BY_COMPANY",
    messages: [
      {
        id: "msg-001",
        senderId: "user-001",
        senderName: "John Doe",
        senderRole: "user",
        content: "Hello, my car has a flat tire. Can you help?",
        type: "text",
        timestamp: "2023-05-07T10:15:00",
      },
      {
        id: "msg-002",
        senderId: "company-001",
        senderName: "Your Company",
        senderRole: "company",
        content: "Hi John, we can definitely help. Can you share your location?",
        type: "text",
        timestamp: "2023-05-07T10:17:00",
      },
      {
        id: "msg-003",
        senderId: "user-001",
        senderName: "John Doe",
        senderRole: "user",
        content: "I'm at 123 Main St, Anytown.",
        type: "text",
        timestamp: "2023-05-07T10:18:00",
      },
      {
        id: "msg-004",
        senderId: "company-001",
        senderName: "Your Company",
        senderRole: "company",
        content: "Thank you. Based on our initial assessment, here's our price offer for the service.",
        type: "price_offer",
        timestamp: "2023-05-07T10:20:00",
        metadata: {
          price: 85.0,
        },
      },
      {
        id: "msg-005",
        senderId: "user-001",
        senderName: "John Doe",
        senderRole: "user",
        content: "I accept the price offer.",
        type: "price_accepted",
        timestamp: "2023-05-07T10:22:00",
      },
      {
        id: "msg-006",
        senderId: "company-001",
        senderName: "Your Company",
        senderRole: "company",
        content: "Great! We'll dispatch a technician right away. They should arrive in about 30 minutes.",
        type: "text",
        timestamp: "2023-05-07T10:23:00",
      },
      {
        id: "msg-007",
        senderId: "system",
        senderName: "System",
        senderRole: "system",
        content: "Service status updated to: RESCUE_VEHICLE_DISPATCHED",
        type: "status_update",
        timestamp: "2023-05-07T10:25:00",
      },
      {
        id: "msg-008",
        senderId: "company-001",
        senderName: "Your Company",
        senderRole: "company",
        content: "Our technician is on the way. You can track their location in the app.",
        type: "text",
        timestamp: "2023-05-07T10:30:00",
      },
    ],
  },
  "chat-002": {
    id: "chat-002",
    requestId: "req-002",
    userId: "user-002",
    userName: "Jane Smith",
    service: "Battery Jump Start",
    status: "COMPLETED",
    messages: [
      {
        id: "msg-101",
        senderId: "user-002",
        senderName: "Jane Smith",
        senderRole: "user",
        content: "My car won't start. I think it's the battery.",
        type: "text",
        timestamp: "2023-05-05T14:00:00",
      },
      {
        id: "msg-102",
        senderId: "company-001",
        senderName: "Your Company",
        senderRole: "company",
        content: "Hi Jane, we can help with a jump start. What's your location?",
        type: "text",
        timestamp: "2023-05-05T14:02:00",
      },
      {
        id: "msg-103",
        senderId: "user-002",
        senderName: "Jane Smith",
        senderRole: "user",
        content: "I'm at 456 Oak Ave, Somewhere.",
        type: "text",
        timestamp: "2023-05-05T14:03:00",
      },
      {
        id: "msg-104",
        senderId: "company-001",
        senderName: "Your Company",
        senderRole: "company",
        content: "Here's our price offer for the battery jump start service.",
        type: "price_offer",
        timestamp: "2023-05-05T14:05:00",
        metadata: {
          price: 65.0,
        },
      },
      {
        id: "msg-105",
        senderId: "user-002",
        senderName: "Jane Smith",
        senderRole: "user",
        content: "That's a bit high. Can you do it for less?",
        type: "price_rejected",
        timestamp: "2023-05-05T14:07:00",
        metadata: {
          reason: "The price is higher than I expected.",
        },
      },
      {
        id: "msg-106",
        senderId: "company-001",
        senderName: "Your Company",
        senderRole: "company",
        content: "We can offer a discount. Here's our revised price.",
        type: "price_offer",
        timestamp: "2023-05-05T14:10:00",
        metadata: {
          price: 55.0,
        },
      },
      {
        id: "msg-107",
        senderId: "user-002",
        senderName: "Jane Smith",
        senderRole: "user",
        content: "That works for me. Thank you!",
        type: "price_accepted",
        timestamp: "2023-05-05T14:12:00",
      },
      {
        id: "msg-108",
        senderId: "system",
        senderName: "System",
        senderRole: "system",
        content: "Service status updated to: COMPLETED",
        type: "status_update",
        timestamp: "2023-05-05T15:30:00",
      },
      {
        id: "msg-109",
        senderId: "company-001",
        senderName: "Your Company",
        senderRole: "company",
        content: "Your invoice has been generated. Please check your email.",
        type: "text",
        timestamp: "2023-05-05T15:35:00",
      },
    ],
  },
}

export default function CompanyChatDetail() {
  const { user } = useAuth()
  const { chatId } = useParams<{ chatId: string }>()
  const [chat, setChat] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Simulate loading chat data
    setIsLoading(true)
    setTimeout(() => {
      if (chatId && mockChatData[chatId as keyof typeof mockChatData]) {
        const chatData = mockChatData[chatId as keyof typeof mockChatData]
        setChat(chatData)
        // Type assertion to ensure the messages match the expected type
        setMessages(chatData.messages as Message[])
      }
      setIsLoading(false)
    }, 500)
  }, [chatId])

  const handleSendMessage = (message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newMessage])
  }

  const handlePriceOffer = (price: number) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || "company-001",
      senderName: "Your Company",
      senderRole: "company",
      content: "Here's our price offer for the service.",
      type: "price_offer",
      timestamp: new Date().toISOString(),
      metadata: {
        price,
      },
    }

    setMessages((prev) => [...prev, newMessage])
  }

  const handlePriceResponse = (accepted: boolean, reason?: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || "company-001",
      senderName: "Your Company",
      senderRole: "company",
      content: accepted ? "We've accepted the price offer." : "We've declined the price offer.",
      type: accepted ? "price_accepted" : "price_rejected",
      timestamp: new Date().toISOString(),
      metadata: accepted ? undefined : { reason },
    }

    setMessages((prev) => [...prev, newMessage])
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading chat...</p>
        </div>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Chat not found</h2>
              <p className="text-muted-foreground mb-4">
                The chat you're looking for doesn't exist or has been deleted.
              </p>
              <Button asChild>
                <Link to="/company/chats">Back to Chats</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto h-[calc(100vh-10rem)] max-w-4xl"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <Link to="/company/chats">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Chat with {chat.userName}</h1>
        </div>
        <Badge>{chat.status.replace(/_/g, " ")}</Badge>
      </div>

      <Card className="h-[calc(100%-3rem)]">
        <CardHeader className="border-b p-4">
          <CardTitle className="text-lg">
            {chat.service} - Request #{chat.requestId}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ChatInterface
            requestId={chat.requestId}
            currentUserId={user?.id || "company-001"}
            currentUserRole="company"
            otherPartyName={chat.userName}
            initialMessages={messages}
            onSendMessage={handleSendMessage}
            onPriceOffer={handlePriceOffer}
            onPriceResponse={handlePriceResponse}
            isLoading={isLoading}
            currentPrice={85}
            requestStatus={chat.status}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}
