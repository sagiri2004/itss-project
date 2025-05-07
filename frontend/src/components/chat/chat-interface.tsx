"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Send, DollarSign, ThumbsUp, ThumbsDown } from "lucide-react"
import type { Message } from "@/types/chat"

export type MessageType = "text" | "system" | "price_offer" | "price_accepted" | "price_rejected" | "status_update"

interface ChatInterfaceProps {
  requestId: string
  currentUserId: string
  currentUserRole: "user" | "company" | "admin"
  otherPartyName: string
  initialMessages: Message[]
  onSendMessage: (message: Omit<Message, "id" | "timestamp">) => void
  onPriceOffer?: (price: number) => void
  onPriceResponse?: (accepted: boolean, reason?: string) => void
  isLoading: boolean
  currentPrice?: number
  requestStatus?: string
}

export default function ChatInterface({
  requestId,
  currentUserId,
  currentUserRole,
  otherPartyName,
  initialMessages,
  onSendMessage,
  onPriceOffer,
  onPriceResponse,
  isLoading,
  currentPrice,
  requestStatus,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false)
  const [priceOfferAmount, setPriceOfferAmount] = useState(currentPrice || 0)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Update messages when initialMessages changes
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return

    onSendMessage({
      senderId: currentUserId,
      senderName: currentUserRole === "user" ? "You" : "Your Company",
      senderRole: currentUserRole === "admin" ? "system" : currentUserRole,
      content: newMessage,
      type: "text",
    })

    setNewMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Update the price offer handling to match the new status flow
  const handlePriceOffer = () => {
    if (onPriceOffer) {
      onPriceOffer(priceOfferAmount)
      setIsPriceDialogOpen(false)

      // Update the request status to WAITING after sending a price offer
      if (requestStatus === "PRICE_UPDATED") {
        // This would typically be handled by the parent component
        // but we're adding this comment to clarify the flow
      }
    }
  }

  const handlePriceResponse = (accepted: boolean) => {
    if (onPriceResponse) {
      if (accepted) {
        onPriceResponse(true)
        // This would update the status to PRICE_CONFIRMED
      } else {
        setIsRejectDialogOpen(true)
        // This would eventually update the status to REJECTED_BY_USER
      }
    }
  }

  const confirmReject = () => {
    if (onPriceResponse) {
      onPriceResponse(false, rejectReason)
      setIsRejectDialogOpen(false)
    }
  }

  // Helper function to format date
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Helper function to group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}

    messages.forEach((message) => {
      const date = new Date(message.timestamp)
      const dateKey = date.toLocaleDateString()

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }

      groups[dateKey].push(message)
    })

    return Object.entries(groups)
  }

  // Check if there's a pending price offer
  const hasPendingPriceOffer = messages.some(
    (msg) =>
      msg.type === "price_offer" &&
      !messages.some(
        (m) =>
          (m.type === "price_accepted" || m.type === "price_rejected") &&
          new Date(m.timestamp) > new Date(msg.timestamp),
      ),
  )

  // Get the last price offer
  const lastPriceOffer = [...messages].reverse().find((msg) => msg.type === "price_offer")

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  }

  return (
    <div className="flex h-full flex-col">
      <Card className="flex h-full flex-col">
        <CardHeader className="border-b p-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={`https://avatar.vercel.sh/${otherPartyName}`} />
              <AvatarFallback>{otherPartyName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{otherPartyName}</h3>
              <p className="text-sm text-muted-foreground">
                Request #{requestId} • {requestStatus?.replace(/_/g, " ")}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            {groupMessagesByDate(messages).map(([dateKey, dateMessages]) => (
              <div key={dateKey} className="space-y-4">
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t"></div>
                  <span className="mx-4 flex-shrink text-xs text-muted-foreground">{dateKey}</span>
                  <div className="flex-grow border-t"></div>
                </div>

                {dateMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    variants={itemVariants}
                    className={`flex ${
                      message.senderRole === "system"
                        ? "justify-center"
                        : message.senderRole === currentUserRole
                          ? "justify-end"
                          : "justify-start"
                    }`}
                  >
                    {message.senderRole === "system" ? (
                      <div className="rounded-md bg-muted px-4 py-2 text-sm text-muted-foreground">
                        {message.content}
                      </div>
                    ) : message.senderRole !== currentUserRole ? (
                      <div className="flex max-w-[80%] items-start space-x-2">
                        <Avatar className="mt-1 h-8 w-8">
                          <AvatarImage src={`https://avatar.vercel.sh/${message.senderName}`} />
                          <AvatarFallback>{message.senderName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="rounded-lg bg-accent p-3">
                            {message.type === "price_offer" ? (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="h-5 w-5 text-primary" />
                                  <span className="font-medium">Price Offer</span>
                                </div>
                                <p>{message.content}</p>
                                <div className="rounded-md bg-primary/10 p-2 text-center">
                                  <span className="text-lg font-bold text-primary">
                                    ${(message.metadata?.price ?? 0).toFixed(2)}
                                  </span>
                                </div>
                                {currentUserRole === "user" &&
                                  hasPendingPriceOffer &&
                                  message.id === lastPriceOffer?.id && (
                                    <div className="mt-2 flex space-x-2">
                                      <Button size="sm" className="w-full" onClick={() => handlePriceResponse(true)}>
                                        <ThumbsUp className="mr-1 h-4 w-4" />
                                        Accept
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => handlePriceResponse(false)}
                                      >
                                        <ThumbsDown className="mr-1 h-4 w-4" />
                                        Reject
                                      </Button>
                                    </div>
                                  )}
                              </div>
                            ) : message.type === "price_accepted" ? (
                              <div className="space-y-2">
                                <Badge variant="success">Price Accepted</Badge>
                                <p>{message.content}</p>
                              </div>
                            ) : message.type === "price_rejected" ? (
                              <div className="space-y-2">
                                <Badge variant="destructive">Price Rejected</Badge>
                                <p>{message.content}</p>
                                {message.metadata?.reason && (
                                  <div className="rounded-md bg-muted p-2 text-sm">
                                    <span className="font-medium">Reason: </span>
                                    {message.metadata.reason}
                                  </div>
                                )}
                              </div>
                            ) : message.type === "status_update" ? (
                              <div className="space-y-2">
                                <Badge>Status Update</Badge>
                                <p>{message.content}</p>
                              </div>
                            ) : (
                              <p>{message.content}</p>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {formatMessageTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex max-w-[80%] flex-col items-end">
                        <div className="rounded-lg bg-primary p-3 text-primary-foreground">
                          {message.type === "price_offer" ? (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <DollarSign className="h-5 w-5" />
                                <span className="font-medium">Price Offer</span>
                              </div>
                              <p>{message.content}</p>
                              <div className="rounded-md bg-primary-foreground/20 p-2 text-center">
                                <span className="text-lg font-bold">${(message.metadata?.price ?? 0).toFixed(2)}</span>
                              </div>
                            </div>
                          ) : message.type === "price_accepted" ? (
                            <div className="space-y-2">
                              <Badge variant="success">Price Accepted</Badge>
                              <p>{message.content}</p>
                            </div>
                          ) : message.type === "price_rejected" ? (
                            <div className="space-y-2">
                              <Badge variant="destructive">Price Rejected</Badge>
                              <p>{message.content}</p>
                              {message.metadata?.reason && (
                                <div className="rounded-md bg-primary-foreground/20 p-2 text-sm">
                                  <span className="font-medium">Reason: </span>
                                  {message.metadata.reason}
                                </div>
                              )}
                            </div>
                          ) : message.type === "status_update" ? (
                            <div className="space-y-2">
                              <Badge>Status Update</Badge>
                              <p>{message.content}</p>
                            </div>
                          ) : (
                            <p>{message.content}</p>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{formatMessageTime(message.timestamp)}</div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </motion.div>
        </CardContent>
        <CardFooter className="border-t p-4">
          <div className="flex w-full items-end space-x-2">
            <div className="flex-1">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[80px] resize-none"
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col space-y-2">
              {currentUserRole === "company" && onPriceOffer && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsPriceDialogOpen(true)}
                  disabled={isLoading}
                  title="Send price offer"
                >
                  <DollarSign className="h-5 w-5" />
                </Button>
              )}
              <Button size="icon" onClick={handleSendMessage} disabled={isLoading || newMessage.trim() === ""}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Price Offer Dialog */}
      <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Price Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price Amount ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={priceOfferAmount}
                onChange={(e) => setPriceOfferAmount(Number.parseFloat(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPriceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePriceOffer} disabled={priceOfferAmount <= 0}>
              Send Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Price Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for rejection (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for rejecting the price offer..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
