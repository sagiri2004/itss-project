"use client"

import { useEffect, useState } from "react"
import { Client, type Message } from "@stomp/stompjs"
import { useAuth } from "../context/auth-context"

// Define the Subscription interface based on StompJS
interface Subscription {
  id: string
  unsubscribe: () => void
}

// WebSocket server URL
const WS_BASE_URL = "ws://localhost:9006/ws"

// NotificationType enum khớp với backend
export type NotificationType =
  | 'INVOICE_CREATED'
  | 'INVOICE_PAID'
  | 'RESCUE_REQUEST'
  | 'RESCUE_COMPLETED'
  | 'REQUEST_ACCEPTED'
  | 'REQUEST_CANCELED'
  | 'VEHICLE_DISPATCHED'
  | 'VEHICLE_ARRIVED'
  | 'INSPECTION_COMPLETED'
  | 'PRICE_UPDATED'
  | 'PRICE_CONFIRMED'
  | 'PRICE_REJECTED'
  | 'REPAIR_STARTED'
  | 'REPAIR_COMPLETED'
  | 'PASSWORD_RESET'
  | 'CHAT'

// Notification type khớp với Notification.java
export interface Notification {
  recipientId: string
  title: string
  content: string
  type: NotificationType
  sentAt: string // LocalDateTime, nên để string ISO
  additionalData?: Record<string, any>
}

export interface ChatMessage {
  content: string
  conversationId: string
  rescueCompanyId?: string
  userId: string
  senderType: "USER" | "RESCUE_COMPANY" | "ADMIN"
  isRead: boolean
  sentAt: string
}

export interface WebSocketService {
  connected: boolean
  connect: () => void
  disconnect: () => void
  sendMessage: (message: ChatMessage) => void
  subscribe: (callback: (message: ChatMessage) => void) => () => void
}

class WebSocketServiceImpl implements WebSocketService {
  private client: Client | null = null
  private callbacks: ((message: ChatMessage) => void)[] = []
  private _connected = false
  private subscriptions: Subscription[] = []
  private token: string | null = null

  constructor() {
    this._connected = false
  }

  get connected(): boolean {
    return this._connected
  }

  setToken(token: string | null) {
    this.token = token
  }

  connect = () => {
    // console.log("Connecting to WebSocket")
    // console.log("this.token", this.token)
    if (this.client && this._connected) {
      // console.log("WebSocket already connected")
      return
    }

    if (!this.token) {
      console.error("Cannot connect to WebSocket: No authentication token")
      return
    }

    try {
      // Create WebSocket connection with token
      const wsUrl = `${WS_BASE_URL}?token=${encodeURIComponent(this.token)}`

      // Create a real STOMP client
      const client = new Client({
        brokerURL: wsUrl,
        connectHeaders: {},
        debug: (str) => {
          console.log("STOMP: " + str)
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      })

      // Set up connection handlers
      client.onConnect = (frame) => {
        console.log("Connected: " + frame)
        this._connected = true

        // Subscribe to personal notifications
        this.subscribeToPersonalNotifications()

        // Subscribe to public notifications
        this.subscribeToPublicNotifications()
      }

      client.onStompError = (frame) => {
        console.error("Broker reported error: " + frame.headers["message"])
        console.error("Additional details: " + frame.body)
      }

      client.onWebSocketError = (event) => {
        console.error("WebSocket error:", event)
        this._connected = false
      }

      client.onDisconnect = () => {
        console.log("Disconnected")
        this._connected = false
        this.subscriptions = []
      }

      // Activate the client (establish connection)
      client.activate()
      this.client = client
    } catch (error) {
      console.error("Error creating WebSocket connection:", error)
    }
  }

  disconnect = () => {
    if (this.client) {
      // Unsubscribe from all topics
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe()
      })
      this.subscriptions = []

      // Disconnect the client
      this.client.deactivate()
      this.client = null
      this._connected = false
      console.log("WebSocket disconnected")
    }
  }

  private subscribeToPersonalNotifications = () => {
    if (!this.client || !this._connected) return

    const personalSub = this.client.subscribe("/user/queue/notifications", (messageOutput: Message) => {
      try {
        const message = JSON.parse(messageOutput.body)
        console.log("Personal notification received:", message)
        this.notifySubscribers(message)
      } catch (error) {
        console.error("Error parsing personal notification:", error)
      }
    })

    this.subscriptions.push(personalSub as Subscription)
  }

  private subscribeToPublicNotifications = () => {
    if (!this.client || !this._connected) return

    const publicSub = this.client.subscribe("/topic/public", (messageOutput: Message) => {
      try {
        const message = JSON.parse(messageOutput.body)
        console.log("Public notification received:", message)
        this.notifySubscribers(message)
      } catch (error) {
        console.error("Error parsing public notification:", error)
      }
    })

    this.subscriptions.push(publicSub as Subscription)
  }

  sendMessage = (message: ChatMessage) => {
    if (!this.client || !this._connected) {
      console.error("Cannot send message: WebSocket not connected")
      return
    }

    try {
      this.client.publish({
        destination: "/app/message",
        headers: {},
        body: JSON.stringify(message),
      })
      console.log("Message sent:", message)
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  subscribe = (callback: (message: ChatMessage) => void): (() => void) => {
    this.callbacks.push(callback)

    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index !== -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  private notifySubscribers = (message: ChatMessage) => {
    this.callbacks.forEach((callback) => {
      try {
        callback(message)
      } catch (error) {
        console.error("Error in subscriber callback:", error)
      }
    })
  }
}

// Create singleton instance
export const websocketService = new WebSocketServiceImpl()

// Hook for components to use the WebSocket service
export function useWebSocket() {
  const { user } = useAuth()
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])

  console.log("useWebSocket hook rendered, user:", user)
  
  // Update connection state when it changes
  useEffect(() => {
    console.log("Connection check effect running")
    const checkConnection = () => {
      setConnected(websocketService.connected)
    }

    // Check initially and set up interval
    checkConnection()
    const interval = setInterval(checkConnection, 2000)

    return () => clearInterval(interval)
  }, [])

  // Connect to WebSocket when authentication changes
  useEffect(() => {
    console.log("Auth effect running, user:", user)
    if (user?.id) {
      const token = localStorage.getItem("token")
      console.log("token in websocket service", token)
      if (token) {
        // Set token and connect
        websocketService.setToken(token)
        websocketService.connect()
      }
    } else {
      // Disconnect when user logs out
      websocketService.disconnect()
    }

    // Cleanup on unmount
    return () => {
      // Don't disconnect on component unmount as we want to keep the connection alive
      // across page navigations. The service will handle disconnection when user logs out.
    }
  }, [user])

  // Subscribe to messages
  useEffect(() => {
    console.log("Message subscription effect running")
    const unsubscribe = websocketService.subscribe((message) => {
      setMessages((prev) => [...prev, message])
    })

    return unsubscribe
  }, [])

  return {
    connected,
    messages,
    sendMessage: websocketService.sendMessage,
    connect: websocketService.connect,
    disconnect: websocketService.disconnect,
  }
}
