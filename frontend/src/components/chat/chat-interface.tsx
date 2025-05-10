"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ScrollArea } from "../ui/scroll-area"
import { Avatar } from "../ui/avatar"
import { useAuth } from "../../context/auth-context"
import { useWebSocketContext } from "../../context/websocket-context"
import type { ChatMessage } from "../../services/websocket-service"
import type { Message } from "@/types/chat"

export interface ChatInterfaceProps {
  requestId: string;
  currentUserId: string;
  currentUserRole: string;
  otherPartyName: string;
  initialMessages: Message[];
  onSendMessage: (message: Omit<Message, "id" | "timestamp">) => Promise<void>;
  onPriceResponse: (accepted: boolean, reason?: string) => Promise<void>;
  isLoading: boolean;
  currentPrice: number;
  requestStatus: string;
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
  currentPrice,
  requestStatus,
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const { user } = useAuth()
  const { connected, messages, sendMessage } = useWebSocketContext()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Filter messages for this specific conversation
  useEffect(() => {
    if (messages && messages.length > 0) {
      const filteredMessages = messages.filter((msg) => msg.conversationId === requestId)

      if (filteredMessages.length > 0) {
        setChatHistory((prev) => {
          const newMessages = filteredMessages.filter(
            (newMsg) =>
              !prev.some(
                (existingMsg) =>
                  // Identify unique messages (this is a simple approach, you might need a more robust one)
                  existingMsg.content === newMsg.content && existingMsg.sentAt === newMsg.sentAt,
              ),
          )

          return [...prev, ...newMessages]
        })
      }
    }
  }, [messages, requestId])

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  }, [chatHistory])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || !connected || !user) return

    const newMessage: ChatMessage = {
      content: message,
      conversationId: requestId,
      userId: currentUserId,
      rescueCompanyId: currentUserRole === "RESCUE_COMPANY" ? currentUserId : undefined,
      senderType: user.role === "company" ? "RESCUE_COMPANY" : "USER",
      isRead: false,
      sentAt: new Date().toISOString(),
    }

    sendMessage(newMessage)

    // Optimistically add to chat history
    setChatHistory((prev) => [...prev, newMessage])

    // Clear input
    setMessage("")
  }

  return (
    <div className={`flex flex-col h-full border rounded-lg`}>
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

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {chatHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</p>
          ) : (
            chatHistory.map((msg, index) => {
              const isCurrentUser = msg.senderType === (user?.role === "company" ? "RESCUE_COMPANY" : "USER")
              return (
                <div key={index} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
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
                        {new Date(msg.sentAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
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
