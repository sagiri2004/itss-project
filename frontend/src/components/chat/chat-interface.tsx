"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Send, DollarSign, ThumbsUp, ThumbsDown } from "lucide-react"
import type { Message } from "@/types/chat"
import { motion } from "framer-motion"

export interface ChatInterfaceProps {
  requestId: string
  currentUserId: string
  currentUserRole: "user" | "company"
  otherPartyName: string
  initialMessages: Message[]
  onSendMessage: (message: Omit<Message, "id" | "timestamp">) => void
  onPriceOffer?: (price: number) => void
  onPriceResponse: (accepted: boolean, reason?: string) => void
  isLoading: boolean
  currentPrice: number
  requestStatus: string
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
  const [priceOffer, setPriceOffer] = useState(currentPrice.toString())
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [lastPriceOffer, setLastPriceOffer] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Update messages when initialMessages changes
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  // Find the last price offer message
  useEffect(() => {
    const lastOffer = [...messages]
      .reverse()
      .find((msg) => msg.type === "price_offer" && msg.senderRole !== currentUserRole)

    if (lastOffer) {
      setLastPriceOffer(lastOffer)
    }
  }, [messages, currentUserRole])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    onSendMessage({
      senderId: currentUserId,
      senderName: currentUserRole === "user" ? "You" : "Your Company",
      senderRole: currentUserRole,
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

  const handlePriceOfferSubmit = () => {
    const price = Number.parseFloat(priceOffer)
    if (isNaN(price) || price <= 0) return

    onPriceOffer?.(price)
    setIsPriceDialogOpen(false)
    setPriceOffer("")
  }

  const handleRejectSubmit = () => {
    onPriceResponse(false, rejectReason)
    setIsRejectDialogOpen(false)
    setRejectReason("")
  }

  const renderMessage = (message: Message, index: number) => {
    const isCurrentUser = message.senderRole === currentUserRole
    const isSystem = message.senderRole === "system"

    // Determine message style based on type and sender
    let messageClass = "p-3 rounded-lg max-w-[80%] break-words"
    if (isSystem) {
      messageClass += " bg-muted text-muted-foreground text-sm italic mx-auto text-center"
    } else if (isCurrentUser) {
      messageClass += " bg-primary text-primary-foreground ml-auto"
    } else {
      messageClass += " bg-secondary text-secondary-foreground"
    }

    // Special styling for price offers and responses
    if (message.type === "price_offer") {
      messageClass += " border-2 border-yellow-400 bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
    } else if (message.type === "price_accepted") {
      messageClass += " border-2 border-green-400 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100"
    } else if (message.type === "price_rejected") {
      messageClass += " border-2 border-red-400 bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100"
    }

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex flex-col mb-4 ${isSystem ? "w-full" : ""}`}
      >
        {!isSystem && !isCurrentUser && (
          <span className="text-xs text-muted-foreground mb-1">{message.senderName}</span>
        )}
        <div className={messageClass}>
          {message.content}

          {message.type === "price_offer" && message.metadata?.price && (
            <div className="mt-2 font-bold flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              Price: ${message.metadata.price.toFixed(2)}
            </div>
          )}

          {message.type === "price_rejected" && message.metadata?.reason && (
            <div className="mt-2 text-sm italic">Reason: {message.metadata.reason}</div>
          )}

          {/* Price response buttons for the non-sender of the price offer */}
          {message.type === "price_offer" &&
            message.senderRole !== currentUserRole &&
            !messages.some(
              (m) => (m.type === "price_accepted" || m.type === "price_rejected") && m.timestamp > message.timestamp,
            ) && (
              <div className="mt-3 flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300"
                  onClick={() => onPriceResponse(true)}
                  disabled={isLoading}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" /> Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
                  onClick={() => setIsRejectDialogOpen(true)}
                  disabled={isLoading}
                >
                  <ThumbsDown className="h-4 w-4 mr-1" /> Reject
                </Button>
              </div>
            )}
        </div>
        <span className="text-xs text-muted-foreground mt-1 self-end">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </motion.div>
    )
  }

  return (
    <Card className="flex flex-col h-full">
      <CardContent className="flex flex-col h-full p-4">
        <div className="flex-1 overflow-y-auto mb-4 pr-2">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Price offer button for company */}
        {currentUserRole === "company" && (
          <div className="mb-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsPriceDialogOpen(true)}
              disabled={isLoading}
            >
              <DollarSign className="h-4 w-4 mr-2" /> Make Price Offer
            </Button>
          </div>
        )}

        {/* Message input */}
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${otherPartyName}...`}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      {/* Price offer dialog */}
      <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make a Price Offer</DialogTitle>
            <DialogDescription>Enter the price you want to offer for this service.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={priceOffer}
                onChange={(e) => setPriceOffer(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPriceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePriceOfferSubmit}>Send Offer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject price dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Price Offer</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting the price offer.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="The price is too high..."
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectSubmit}>
              Reject Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
