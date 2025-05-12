"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import { ChatInterface } from "@/components/chat/chat-interface"
import type { Chat, Message, RequestDetails } from "@/types/chat"
import api from "@/services/api"

export default function CompanyChat() {
  const { user } = useAuth()
  const { id: requestId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [chat, setChat] = useState<Chat | null>(null)
  const [requestDetails, setRequestDetails] = useState<RequestDetails | null>(null)

  // Fetch chat and request details from API
  useEffect(() => {
    const fetchChatData = async () => {
      setIsLoading(true)
      try {
        // Lấy thông tin chat/conversation
        const chatRes = await api.chats.getConversationById(requestId as string)
        setChat(chatRes.data)

        // Lấy chi tiết request liên quan (nếu có)
        if (chatRes.data.requestId) {
          const reqRes = await api.rescueRequests.getRequestById(chatRes.data.requestId)
          setRequestDetails(reqRes.data)
        }
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

    if (requestId) {
      fetchChatData()
    }
  }, [requestId, toast])


  const handleSendMessage = async () => {}
  const handlePriceResponse = async () => {}

  // Gửi tin nhắn mới
  // const handleSendMessage = async (message: Omit<Message, "id" | "timestamp">) => {
  //   setIsLoading(true)
  //   try {
  //     await api.chats.sendMessage(chat?.id as string, {
  //       ...message,
  //       senderId: user?.id,
  //     })
  //     // Sau khi gửi, reload lại messages
  //     const chatRes = await api.chats.getConversationById(requestId as string)
  //     setChat(chatRes.data)
  //   } catch (error) {
  //     toast({
  //       variant: "destructive",
  //       title: "Send message failed",
  //       description: "Could not send the message.",
  //     })
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  // Phản hồi đề nghị giá
  // const handlePriceResponse = async (accepted: boolean, reason?: string) => {
  //   setIsLoading(true)
  //   try {
  //     await api.chats.sendPriceResponse(chat?.id as string, { accepted, reason })
  //     const chatRes = await api.chats.getConversationById(requestId as string)
  //     setChat(chatRes.data)
  //     if (!accepted) {
  //       toast({
  //         title: "Price rejected",
  //         description: "You have rejected the customer's price. This conversation will be archived.",
  //       })
  //     }
  //   } catch (error) {
  //     toast({
  //       variant: "destructive",
  //       title: "Send price response failed",
  //       description: "Could not send the price response.",
  //     })
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

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

  if (!chat) {
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
          otherPartyName={chat.participants.find((p) => p.role === "user")?.name || "Customer"}
          initialMessages={chat.messages}
          onSendMessage={handleSendMessage}
          onPriceResponse={handlePriceResponse}
          isLoading={isLoading}
          currentPrice={0}
          requestStatus={""}
        />
      </motion.div>
    </motion.div>
  )
}
