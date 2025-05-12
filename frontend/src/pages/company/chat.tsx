"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import { ChatInterface } from "@/components/chat/chat-interface"
import type { Chat, ChatMessage, SenderType } from "@/types/chat"
import api from "@/services/api"
import { useWebSocketContext } from "@/context/websocket-context"

export default function CompanyChat() {
  const { user } = useAuth()
  const { id: conversationId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { notifications, sendMessage } = useWebSocketContext() // Get sendMessage

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (cursor?: string) => {
    if (!conversationId) return
    try {
      setIsLoadingMore(true);
      const response = await api.chats.getMessages(conversationId, {
        cursor,
        limit: 20,
        sort: 'desc',
        markAsRead: true
      });

      const mappedMessages: ChatMessage[] = (response.data.messages || response.data).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        senderType: msg.senderType as SenderType,
        senderId: msg.senderId,
        sentAt: msg.sentAt,
        conversationId: conversationId
      }))

      if (cursor) {
        setMessages(prev => [...prev, ...mappedMessages])
      } else {
        setMessages(mappedMessages)
      }

      setNextCursor(response.data.nextCursor || null);
      setHasMore(!!response.data.nextCursor);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading messages",
        description: error.response?.data?.message || "Could not load messages",
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const fetchChatData = async () => {
      if (!conversationId) return
      setIsLoading(true)
      try {
        const chatResponse = await api.chats.getConversationById(conversationId)
        setChat(chatResponse.data)
        await fetchMessages()
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading chat",
          description: error.response?.data?.message || "Could not load chat",
        });
      } finally {
        setIsLoading(false)
      }
    }
    fetchChatData()
  }, [conversationId, toast])

  // Listen for new messages via WebSocket
  useEffect(() => {
    if (!conversationId || !notifications || notifications.length === 0) return

    const latestNotification = notifications.find(
        (notification) =>
            notification.type === "CHAT" &&
            notification.additionalData?.conversationId === conversationId
    );

    if (latestNotification) {
        fetchMessages();
    }
  }, [notifications, conversationId]);

  const handleSendMessage = async (messageContent: string) => {
    if (!user || !conversationId) return;

    const newMessage: ChatMessage = {
      id: `temp-${Date.now()}`, // Temporary ID
      content: messageContent,
      senderType: "RESCUE_COMPANY",
      senderId: user.id,
      sentAt: new Date().toISOString(),
      conversationId: conversationId
    }

    sendMessage(newMessage); // Use WebSocket to send message
    setMessages(prevMessages => [...prevMessages, newMessage]); // Optimistically update UI
  };

  const loadMoreMessages = async () => {
    if (!nextCursor || isLoadingMore) return
    await fetchMessages(nextCursor)
  }

  useEffect(() => {
    // Scroll to the bottom of the chat when messages change
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  return (
    <motion.div className="h-[calc(100vh-12rem)]">
      <motion.div className="flex items-center mb-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Chat with Customer</h1>
      </motion.div>
      <motion.div className="h-[calc(100%-3rem)]">
        <ChatInterface
          requestId={conversationId || ""}
          currentUserId={user?.id || ""}
          currentUserRole="RESCUE_COMPANY"
          otherPartyName={chat?.user?.name || "Customer"}
          initialMessages={messages}
          onSendMessage={handleSendMessage} // Use local sendMessage
          onPriceResponse={() => {}} // Optional price response handling
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={loadMoreMessages}
          currentPrice={chat?.currentPrice || 0}
          requestStatus={chat?.status || ""}
          rescueCompanyId={chat?.company?.id}
          chatBottomRef={chatBottomRef}
        />
        <div ref={chatBottomRef} />
      </motion.div>
    </motion.div>
  )
}
