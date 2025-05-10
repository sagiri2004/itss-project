"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import ChatInterface from "@/components/chat/chat-interface"
import type { Message } from "@/types/chat"
import type { Chat, MessageType, RequestDetails } from "@/types/chat"
import api from "@/services/api"

export default function UserChat() {
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
      if (!requestId) return
      
      setIsLoading(true)
      try {
        // Fetch chat data
        const chatResponse = await api.chats.getChatById(requestId)
        setChat(chatResponse.data)

        // Fetch request details
        const requestResponse = await api.rescueRequests.getRequestById(requestId)
        setRequestDetails({
          id: requestId,
          status: requestResponse.data.status,
          currentPrice: requestResponse.data.price || 0,
        })
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading chat",
          description: error.response?.data?.message || "Could not load the chat. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchChatData()
  }, [requestId, toast])

  const handleSendMessage = async (message: Omit<Message, "id" | "timestamp">) => {
    if (!requestId) return
    
    setIsLoading(true)
    try {
      const response = await api.chats.sendMessage(requestId, {
        content: message.content,
        type: message.type,
        metadata: message.metadata,
      })

      setChat((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          messages: [...prev.messages, response.data],
          lastUpdated: new Date().toISOString(),
        }
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: error.response?.data?.message || "Could not send message. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePriceResponse = async (accepted: boolean, reason?: string) => {
    if (!requestId || !requestDetails) return
    
    setIsLoading(true)
    try {
      const response = await api.rescueRequests.updateRequest(requestId, {
        status: accepted ? "PRICE_ACCEPTED" : "PRICE_REJECTED",
        price: accepted ? requestDetails.currentPrice : undefined,
        reason: reason || "",
      })

      // Update request details with new price if accepted
      if (accepted) {
        setRequestDetails((prev) => ({
          ...prev!,
          currentPrice: response.data.price,
          status: response.data.status,
        }))
      } else {
        // If rejected, update chat status to closed
        setChat((prev) => {
          if (!prev) return null
          return {
            ...prev,
            status: "CLOSED",
            lastUpdated: new Date().toISOString(),
          }
        })

        toast({
          title: "Price rejected",
          description: "You have rejected the price offer. This conversation will be archived.",
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error responding to price offer",
        description: error.response?.data?.message || "Could not process your response. Please try again.",
      })
    } finally {
      setIsLoading(false)
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

  if (isLoading && !chat) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (!chat || !requestDetails) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-center">
          <p className="text-muted-foreground">Chat not found</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="h-[calc(100vh-12rem)]">
      <motion.div variants={itemVariants} className="flex items-center mb-4">
        <Button variant="outline" size="icon" onClick={() => navigate(`/user/requests/${requestId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Chat with Service Provider</h1>
      </motion.div>

      <motion.div variants={itemVariants} className="h-[calc(100%-3rem)]">
        <ChatInterface
          requestId={requestId || ""}
          currentUserId={user?.id || ""}
          currentUserRole="user"
          otherPartyName={chat.participants.find((p: any) => p.role === "company")?.name || "Service Provider"}
          initialMessages={chat.messages}
          onSendMessage={handleSendMessage}
          onPriceResponse={handlePriceResponse}
          isLoading={isLoading}
          currentPrice={requestDetails.currentPrice}
          requestStatus={requestDetails.status}
        />
      </motion.div>
    </motion.div>
  )
}
