export interface ChatConversation {
  id: string
  userId: string
  userName: string
  rescueCompanyId?: string
  rescueCompanyName?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
}

export interface ChatParticipant {
  id: string
  name: string
  role: "USER" | "RESCUE_COMPANY" | "ADMIN"
  avatarUrl?: string
}

export type SenderType = "USER" | "RESCUE_COMPANY" | "ADMIN"

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  senderId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Chat {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  messages: Message[];
  status: string;
  lastUpdated: string;
}

export type MessageType = 'TEXT' | 'PRICE_OFFER' | 'PRICE_RESPONSE' | 'SYSTEM';

export interface RequestDetails {
  id: string;
  status: string;
  currentPrice: number;
}
