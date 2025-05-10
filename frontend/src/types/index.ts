export interface Message {
    content: string;
    conversationId: string;
    rescueCompanyId?: string;
    userId: string;
    senderType: string;
    isRead: boolean;
    sentAt: string;
  }
  
  export interface WebSocketContextType {
    stompClient: any | null; // STOMP client instance
    isConnected: boolean;
    connect: (type: 'user' | 'company', credentials: Credentials) => void;
    disconnect: (type: 'user' | 'company') => void;
    sendMessage: (type: 'user' | 'company', message: Message) => void;
    messages: { [key: string]: Message[] }; // Lưu tin nhắn theo type
  }
  
  export interface Credentials {
    userId: string;
    token: string;
    senderType: string;
    companyId?: string; // Chỉ cần cho company
  }