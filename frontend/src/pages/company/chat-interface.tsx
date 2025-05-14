"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { useAuth } from "@/context/auth-context"
import { useWebSocketContext } from "@/context/websocket-context"
import type { ChatMessage } from "@/services/websocket-service"
import type { Message } from "@/types/chat"
import api from "@/services/api"

type ChatHistoryItem = ChatMessage & { id: string }

export interface ChatInterfaceProps {
  requestId: string;
  currentUserId: string;
  currentUserRole: string;
  otherPartyName: string;
  initialMessages: Message[];
  onSendMessage: (message: Omit<Message, "id" | "timestamp">) => Promise<void>;
  onPriceResponse: (accepted: boolean, reason?: string) => Promise<void>;
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => Promise<void>;
  currentPrice: number;
  requestStatus: string;
  rescueCompanyId?: string;
}

export function ChatInterface({
  requestId,
  currentUserId,
  currentUserRole,
  otherPartyName,
  initialMessages,
  onSendMessage,
  onPriceResponse,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  currentPrice,
  requestStatus,
  rescueCompanyId,
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const { user } = useAuth()
  const { connected, messages, sendMessage } = useWebSocketContext()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Set chatHistory from initialMessages when they change (API response)
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      // Convert Message[] to {id, ...ChatMessage}
      const mapped: ChatHistoryItem[] = initialMessages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        conversationId: msg.conversationId || requestId,
        userId: msg.senderId || msg.userId || "",
        rescueCompanyId: msg.rescueCompanyId || undefined,
        senderType: msg.senderType || "USER",
        isRead: msg.read ?? msg.isRead ?? false,
        sentAt: msg.sentAt || msg.timestamp || "",
      }))
      setChatHistory(mapped)
    } else {
      setChatHistory([])
    }
  }, [initialMessages, requestId])

  // Append new messages from WebSocket
  useEffect(() => {
    if (messages && messages.length > 0) {
      const filteredMessages = messages.filter((msg) => msg.conversationId === requestId)
      if (filteredMessages.length > 0) {
        setChatHistory((prev) => {
          // Only add messages that are not already in chatHistory (by content, sentAt, senderType)
          const newMessages = filteredMessages.filter(
            (newMsg) => !prev.some((existingMsg) =>
              existingMsg.content === newMsg.content &&
              existingMsg.sentAt === newMsg.sentAt &&
              existingMsg.senderType === newMsg.senderType
          )
          ).map((msg) => ({
            ...msg,
            sentAt: msg.sentAt || new Date().toISOString(),
            id: msg.id || Math.random().toString(36).slice(2)
          })) as ChatHistoryItem[]
          return [...prev, ...newMessages]
        })
      }
    }
  }, [messages, requestId])

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatHistory])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || !connected || !user) return

    // Get the chat data to find the correct user ID
    const chatResponse = await api.chats.getConversationById(requestId);
    const chatData = chatResponse.data;
    
    // The userId should be the ID of the user in the conversation
    const userId = chatData.userId || chatData.user?.id;

    if (!userId) return;

    const newMessage: ChatMessage = {
      content: message,
      conversationId: requestId,
      userId: userId,
      rescueCompanyId: user.companyId || undefined,
      senderType: "RESCUE_COMPANY",
      isRead: false,
      sentAt: new Date().toISOString(),
    }

    sendMessage(newMessage)

    // Optimistically add to chat history
    setChatHistory((prev) => [
      ...prev,
      { ...newMessage, id: Math.random().toString(36).slice(2) } as ChatHistoryItem
    ])

    // Clear input
    setMessage("")
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget
    if (scrollTop === 0 && hasMore && !isLoadingMore && onLoadMore) {
      onLoadMore()
    }
  }

  return (
    <div className="flex flex-col h-full border rounded-lg">
      <div className="p-4 border-b bg-muted/30">
        <h3 className="font-medium">
          {connected ? (
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              Disconnected
            </span>
          )}
        </h3>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef} onScroll={handleScroll}>
        <div className="space-y-4">
          {isLoadingMore && (
            <div className="flex justify-center py-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
          
          {chatHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</p>
          ) : (
            chatHistory.map((msg, index) => {
              const isCurrentUser = msg.senderType === (user?.role === "company" ? "RESCUE_COMPANY" : "USER")
              return (
                <div key={msg.id || index} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-start gap-2 max-w-[80%] ${isCurrentUser ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-8 w-8">
                      <span className="sr-only">
                        {isCurrentUser ? "You" : msg.senderType === "USER" ? "User" : "Company"}
                      </span>
                    </Avatar>
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${
                        isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <div
                        className={`text-xs mt-1 ${isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                      >
                        {msg.sentAt && !isNaN(Date.parse(msg.sentAt))
                          ? new Date(msg.sentAt).toLocaleTimeString()
                          : ""}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={!connected}
          className="flex-1"
        />
        <Button type="submit" disabled={!connected || !message.trim()}>
          Send
        </Button>
      </form>
    </div>
  )
}