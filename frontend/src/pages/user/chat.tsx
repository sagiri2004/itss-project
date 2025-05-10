"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import { ChatInterface } from "@/components/chat/chat-interface"
import type { Message } from "@/types/chat"
import api from "@/services/api"
import { useWebSocketContext } from "@/context/websocket-context"

export default function UserChat() {
  const { user } = useAuth()
  const { id: conversationId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { notifications } = useWebSocketContext()

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [chat, setChat] = useState<any | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const fetchMessages = async (cursor?: string) => {
    if (!conversationId) return
    try {
      const response = await api.chats.getMessages(conversationId, {
        cursor,
        limit: 20,
        sort: 'desc',
        markAsRead: true
      })
      
      const newMessages = response.data.messages || response.data
      if (cursor) {
        setMessages(prev => [...prev, ...newMessages])
      } else {
        setMessages(newMessages)
      }
      
      setNextCursor(response.data.nextCursor || null)
      setHasMore(!!response.data.nextCursor)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading messages",
        description: error.response?.data?.message || "Could not load messages. Please try again.",
      })
    }
  }

  useEffect(() => {
    const fetchChatData = async () => {
      if (!conversationId) return
      setIsLoading(true)
      try {
        // Fetch conversation
        const chatResponse = await api.chats.getConversationById(conversationId)
        setChat(chatResponse.data)
        // Fetch initial messages
        await fetchMessages()
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
  }, [conversationId, toast])

  useEffect(() => {
    if (!conversationId) return;
    if (!notifications || notifications.length === 0) return;
    const latest = notifications[0]; // notifications are prepended
    if (
      latest.type === "CHAT" &&
      latest.additionalData?.conversationId === conversationId
    ) {
      fetchMessages();
    }
  }, [notifications, conversationId]);

  const loadMoreMessages = async () => {
    if (!nextCursor || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      await fetchMessages(nextCursor)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Không dùng sendMessage API ở đây, chỉ demo nhận message
  const handleSendMessage = async () => {}
  const handlePriceResponse = async () => {}

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

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-center">
          <p className="text-muted-foreground">Chat not found</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div className="h-[calc(100vh-12rem)]">
      <motion.div className="flex items-center mb-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Chat with Service Provider</h1>
      </motion.div>
      <motion.div className="h-[calc(100%-3rem)]">
        <ChatInterface
          requestId={conversationId || ""}
          currentUserId={user?.id || ""}
          rescueCompanyId={typeof chat.company === 'object' ? chat.company.id : undefined}
          currentUserRole="user"
          otherPartyName={chat.company?.name || "Service Provider"}
          initialMessages={messages}
          onSendMessage={handleSendMessage}
          onPriceResponse={handlePriceResponse}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={loadMoreMessages}
          currentPrice={0}
          requestStatus={""}
        />
      </motion.div>
    </motion.div>
  )
}
