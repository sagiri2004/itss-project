"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import { ChatInterface } from "./chat-interface"
import type { Chat, ChatMessage, SenderType, Message } from "@/types/chat"
import type { ChatMessage as WebSocketChatMessage } from "@/services/websocket-service"
import api from "@/services/api"
import { useWebSocketContext } from "@/context/websocket-context"

// Extend Chat interface to include missing properties
interface ExtendedChat extends Chat {
  user?: {
    id: string;
    name: string;
  };
  company?: {
    id: string;
  };
  currentPrice?: number;
}

export default function CompanyChat() {
  const { user } = useAuth()
  const { id: conversationId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { notifications, sendMessage } = useWebSocketContext()

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [chat, setChat] = useState<ExtendedChat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
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

      const mappedMessages: Message[] = (response.data.messages || response.data).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        type: 'TEXT',
        senderId: msg.senderId,
        timestamp: msg.sentAt,
        conversationId: conversationId,
        userId: msg.senderId,
        rescueCompanyId: msg.senderType === 'RESCUE_COMPANY' ? msg.senderId : undefined,
        isRead: msg.isRead || false,
        sentAt: msg.sentAt,
        senderType: msg.senderType
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

  const handleSendMessage = async (message: Omit<Message, "id" | "timestamp">) => {
    if (!user || !conversationId || (user.role === "company" && !user.companyId)) return;

    // Get the chat data to find the correct user ID
    const chatResponse = await api.chats.getConversationById(conversationId);
    const chatData = chatResponse.data;
    
    // The userId should be the ID of the user in the conversation
    const userId = chatData.userId || chatData.user?.id;

    if (!userId) return;

    const wsMessage: WebSocketChatMessage = {
      content: message.content,
      conversationId: message.conversationId,
      userId: userId,
      rescueCompanyId: user.companyId || undefined,
      senderType: "RESCUE_COMPANY",
      isRead: false,
      sentAt: new Date().toISOString()
    }

    sendMessage(wsMessage);
    setMessages(prevMessages => [...prevMessages, {
      ...message,
      id: `temp-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      userId: userId,
      rescueCompanyId: user.companyId || undefined,
      senderType: "RESCUE_COMPANY"
    }]);
  };

  const handlePriceResponse = async (accepted: boolean, reason?: string) => {
    // Implement price response handling
    return Promise.resolve();
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
          onSendMessage={handleSendMessage}
          onPriceResponse={handlePriceResponse}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={loadMoreMessages}
          currentPrice={chat?.currentPrice || 0}
          requestStatus={chat?.status || ""}
          rescueCompanyId={chat?.company?.id}
        />
        <div ref={chatBottomRef} />
      </motion.div>
    </motion.div>
  )
}
