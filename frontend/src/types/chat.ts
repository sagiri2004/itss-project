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
  id: string;
  name: string;
  role: SenderType;
  avatarUrl?: string;
}

export type SenderType = "USER" | "RESCUE_COMPANY" | "ADMIN";

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  senderId: string;
  timestamp: string;
  metadata?: Record<string, any>;
  conversationId: string; // Thêm conversationId
}

export interface ChatMessage {
  id: string;
  content: string;
  senderType: SenderType;
  senderId: string;
  sentAt: string;
  conversationId: string;
}

export interface Chat {
  id: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  hasUnreadMessages: boolean;
  status: string;
  updatedAt: string;
}

export type MessageType = 'TEXT' | 'PRICE_OFFER' | 'PRICE_RESPONSE' | 'SYSTEM';

export interface RequestDetails {
  id: string;
  status: string;
  currentPrice: number;
}
