"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import ChatInterface from "@/components/chat/chat-interface"
import type { Chat, Message, RequestDetails, MessageType } from "@/types/chat"

// Replace the mock data imports
import { generateMockChat, mockChatRequestDetails } from "@/data/mock-data"

// Remove the original mock data declarations
// Replace:
// const generateMockChat = (requestId: string, userId: string, companyId: string) => { ... }

export default function CompanyChat() {
  const { user } = useAuth()
  const { id: requestId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [chat, setChat] = useState<Chat | null>(null)
  const [requestDetails, setRequestDetails] = useState<RequestDetails | null>(null)

  // Fetch chat data
  useEffect(() => {
    const fetchChatData = async () => {
      setIsLoading(true)
      try {
        // In a real app, fetch from API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data
        if (user) {
          const mockChat = generateMockChat(requestId || "unknown", "user-001", user.id) as Chat
          setChat(mockChat)

          setRequestDetails(mockChatRequestDetails)
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error loading chat",
          description: "Could not load the chat. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (requestId) {
      fetchChatData()
    }
  }, [requestId, user, toast])

  const handleSendMessage = (message: Omit<Message, "id" | "timestamp">) => {
    setIsLoading(true)

    // In a real app, send to API
    setTimeout(() => {
      const newMessage = {
        ...message,
        id: `msg-${Date.now()}`,
        timestamp: new Date().toISOString(),
      }

      setChat((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
          lastUpdated: new Date().toISOString(),
        }
      })

      setIsLoading(false)
    }, 500)
  }

  const handlePriceOffer = (price: number) => {
    setIsLoading(true)

    // In a real app, send to API
    setTimeout(() => {
      const newMessage = {
        id: `msg-${Date.now()}`,
        senderId: user?.id || "",
        senderName: "Your Company",
        senderRole: "company" as const,
        content: `We're offering a price of $${price.toFixed(2)} for this service based on the details provided.`,
        timestamp: new Date().toISOString(),
        type: "price_offer" as const,
        metadata: { price },
      }

      setChat((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
          lastUpdated: new Date().toISOString(),
        };
      })

      setIsLoading(false)

      toast({
        title: "Price offer sent",
        description: `You've sent a price offer of $${price.toFixed(2)} to the customer.`,
      })
    }, 800)
  }

  const handlePriceResponse = (accepted: boolean, reason?: string) => {
    setIsLoading(true)

    // In a real app, send to API
    setTimeout(() => {
      const responseType = accepted ? ("price_accepted" as MessageType) : ("price_rejected" as MessageType)
      const responseContent = accepted
        ? "I accept the price offer from the customer."
        : "I cannot accept this price from the customer."

      const newMessage = {
        id: `msg-${Date.now()}`,
        senderId: user?.id || "",
        senderName: "Your Company",
        senderRole: "company" as const,
        content: responseContent,
        timestamp: new Date().toISOString(),
        type: responseType,
        metadata: accepted ? undefined : { reason },
      }

      setChat((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
          lastUpdated: new Date().toISOString(),
        };
      })

      // If rejected, add a system message about chat ending
      if (!accepted) {
        const systemMessage = {
          id: `msg-${Date.now() + 1}`,
          senderId: "system",
          senderName: "System",
          senderRole: "system" as const,
          content: "Price was rejected. This conversation will be archived.",
          timestamp: new Date().toISOString(),
          type: "system" as MessageType,
        }

        setChat((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, systemMessage],
            status: "CLOSED",
            lastUpdated: new Date().toISOString(),
          };
        });

        // Show toast notification
        toast({
          title: "Price rejected",
          description: "You have rejected the customer's price. This conversation will be archived.",
        })
      }

      setIsLoading(false)
    }, 800)
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

  if (!chat || !requestDetails) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="h-[calc(100vh-12rem)]">
      <motion.div variants={itemVariants} className="flex items-center mb-4">
        <Button variant="outline" size="icon" onClick={() => navigate(`/company/requests/${requestId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Chat with Customer</h1>
      </motion.div>

      <motion.div variants={itemVariants} className="h-[calc(100%-3rem)]">
        <ChatInterface
          requestId={requestId || ""}
          currentUserId={user?.id || ""}
          currentUserRole="company"
          otherPartyName={chat.participants.find((p: any) => p.role === "user")?.name || "Customer"}
          initialMessages={chat.messages}
          onSendMessage={handleSendMessage}
          onPriceOffer={handlePriceOffer}
          onPriceResponse={handlePriceResponse}
          isLoading={isLoading}
          currentPrice={requestDetails.currentPrice}
          requestStatus={requestDetails.status}
        />
      </motion.div>
    </motion.div>
  )
}
