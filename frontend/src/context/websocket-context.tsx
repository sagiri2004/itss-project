"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useLocation } from "react-router-dom"
import { useAuth } from "./auth-context"
import { websocketService, type ChatMessage, useWebSocket } from "../services/websocket-service"
import type { Notification } from "@/services/websocket-service"

// Pages that should not connect to WebSocket
const EXCLUDED_PATHS = ["/login", "/register"]

type WebSocketContextType = {
  connected: boolean
  messages: ChatMessage[]
  sendMessage: (message: ChatMessage) => void
  notifications: Notification[]
  unreadCount: number
  markAllAsRead: () => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  const { connected, messages, sendMessage } = useWebSocket()

  // console.log("connected", connected)

  const [shouldConnect, setShouldConnect] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // console.log("messages", messages)

  // Determine if we should connect based on the current path
  useEffect(() => {
    const currentPath = location.pathname
    const isExcludedPath = EXCLUDED_PATHS.some((path) => currentPath.startsWith(path))

    setShouldConnect(isAuthenticated && !isExcludedPath)
  }, [location.pathname, isAuthenticated])

  // console.log("shouldConnect", shouldConnect)
  // console.log("connected", connected)
  // console.log("user", user)

  // Connect or disconnect based on shouldConnect state
  useEffect(() => {
    if (shouldConnect && !connected && user) {
      // console.log("Connecting to WebSocket")
      websocketService.connect()
    }
    // Don't disconnect when navigating between included pages
    // The service will handle disconnection when user logs out
  }, [shouldConnect, connected, user])

  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1] as any
      if (last && last.recipientId && last.title && last.type) {
        setNotifications((prev) => [last as Notification, ...prev])
        setUnreadCount((prev) => prev + 1)
      }
    }
  }, [messages])

  const markAllAsRead = () => setUnreadCount(0)

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        messages,
        sendMessage,
        notifications,
        unreadCount,
        markAllAsRead,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider")
  }
  return context
}
