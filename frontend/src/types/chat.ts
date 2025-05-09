export interface Participant {
  id: string
  name: string
  role: "user" | "company" | "system"
}

export interface MessageMetadata {
  price?: number
  reason?: string
  [key: string]: any
}

export type MessageType = "text" | "system" | "price_offer" | "price_accepted" | "price_rejected" | "status_update"

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: "user" | "company" | "system"
  content: string
  timestamp: string
  type: MessageType
  metadata?: MessageMetadata
}

export interface Chat {
  id: string
  requestId: string
  participants: Participant[]
  messages: Message[]
  status: "ACTIVE" | "CLOSED"
  lastUpdated: string
}

export interface RequestDetails {
  id: string
  status: string
  currentPrice: number
}
