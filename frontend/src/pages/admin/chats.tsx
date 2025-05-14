"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Search, MessageSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWebSocketContext } from "@/context/websocket-context"
import api from "@/services/api"
import type { Chat, ChatMessage, SenderType, Message } from "@/types/chat"
import { ChatInterface } from "./chat-interface";

export default function AdminChats() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { notifications, sendMessage } = useWebSocketContext() // Get sendMessage
  const [searchTerm, setSearchTerm] = useState("")
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Fetch all conversations
  useEffect(() => {
    const fetchChats = async () => {
      setIsLoading(true)
      try {
        const response = await api.chats.getConversations()
        setChats(
          response.data.map((item: any) => ({
            id: item.id,
            participants: item.participants.map((p: any) => ({
              id: p.id,
              name: p.name,
              role: p.role as SenderType
            })),
            lastMessage: item.lastMessage ? {
              id: item.lastMessage.id,
              content: item.lastMessage.content,
              senderType: item.lastMessage.senderType as SenderType,
              senderId: item.lastMessage.senderId,
              sentAt: item.lastMessage.sentAt,
              conversationId: item.id
            } : undefined,
            unreadCount: item.unreadCount,
            hasUnreadMessages: item.hasUnreadMessages,
            status: item.status,
            updatedAt: item.lastUpdated || item.updatedAt
          }))
        )
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading chats",
          description: error.response?.data?.message || "Could not load chats",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchChats()
  }, [toast])

  // Listen for new messages via WebSocket
  useEffect(() => {
    if (!notifications || notifications.length === 0) return

    const latestNotification = notifications.find(
        (notification) =>
            notification.type === "CHAT" &&
            notification.additionalData?.conversationId === selectedChat?.id
    );

    if (latestNotification) {
        if (selectedChat) {
          fetchMessages(selectedChat.id);
        }
        updateChatList();
    }
  }, [notifications, selectedChat]);

  const updateChatList = async () => {
    try {
      const response = await api.chats.getConversations()
      setChats(response.data)
    } catch (error) {
      console.error("Failed to update chat list:", error)
    }
  }

  const fetchMessages = async (chatId: string, cursor?: string) => {
    if (!chatId) return;
    try {
      const response = await api.chats.getMessages(chatId, {
        cursor,
        limit: 20,
        sort: 'asc', // Changed to ascending
        markAsRead: true
      });

      const newMessages = response.data.messages || response.data;
      if (cursor) {
        setMessages(prev => [...newMessages, ...prev]); // Prepend new messages
      } else {
        setMessages(newMessages);
      }

      setNextCursor(response.data.nextCursor || null);
      setHasMore(!!response.data.nextCursor);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading messages",
        description: error.response?.data?.message || "Could not load messages",
      });
    }
  };

  const handleSelectChat = async (chat: Chat) => {
    setSelectedChat(chat);
    setMessages([]);
    setNextCursor(null);
    setHasMore(true);
    await fetchMessages(chat.id);
  };

  const handleLoadMore = async () => {
    if (!selectedChat?.id || !nextCursor || !hasMore) return
    await fetchMessages(selectedChat.id, nextCursor)
  }

  const handleSendMessage = async (messageContent: string) => {
    if (!user || !selectedChat) return;

    const newMessage = {
      content: messageContent,
      conversationId: selectedChat.id,
      userId: user.id,
      senderType: "ADMIN",
      isRead: false,
      sentAt: new Date().toISOString()
    };

    sendMessage(newMessage); // Use WebSocket to send message
    setMessages(prevMessages => [...prevMessages, newMessage]); // Optimistically update UI
  };

  // Filter chats based on search and active tab
  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.participants.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      chat.messages.some((m) => m.content.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "issues" && chat.status === "ISSUE") ||
      (activeTab === "unread" && chat.status === "UNREAD")

    return matchesSearch && matchesTab
  })

  useEffect(() => {
    // Scroll to the bottom of the chat when messages change
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const renderChatInterface = () => {
    if (!selectedChat) {
      return <div className="text-muted-foreground">Select a chat to view messages.</div>;
    }

    return (
        <ChatInterface
            requestId={selectedChat.id}
            currentUserId={user?.id || ""}
            currentUserRole="ADMIN"
            otherPartyName={selectedChat.participants.find(p => p.id !== user?.id)?.name || "Unknown"}
            initialMessages={messages}
            onSendMessage={handleSendMessage}
            onPriceResponse={() => {
            }}
            isLoading={isLoading}
            isLoadingMore={false}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            chatBottomRef={chatBottomRef}
        />
    );
  };

  return (
    <motion.div className="flex h-[calc(100vh-12rem)] w-full">
      {/* Chat List */}
      <motion.div className="w-1/4 border-r p-4">
        <Card>
          <CardHeader>
            <CardTitle>Chats</CardTitle>
            <CardDescription>Manage conversations with users and companies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search chats..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Tabs defaultValue="all" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="issues">Issues</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="text-muted-foreground">No chats found.</div>
              ) : (
                filteredChats.map((chat) => (
                  <Button
                    key={chat.id}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => handleSelectChat(chat)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {chat.participants.find(p => p.id !== user?.id)?.name || "Unknown"}
                  </Button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Chat Interface */}
      <motion.div className="w-3/4 p-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
              {selectedChat
                ? `Chat with ${selectedChat.participants.find(p => p.id !== user?.id)?.name || "Unknown"}`
                : "Select a Chat"}
            </CardTitle>
            <CardDescription>View and respond to messages</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto" ref={chatContainerRef}>
              {renderChatInterface()}
              <div ref={chatBottomRef} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
