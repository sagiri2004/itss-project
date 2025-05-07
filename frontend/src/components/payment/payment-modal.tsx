"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StripePaymentForm } from "./stripe-payment-form"
import { PaymentSuccess } from "./payment-success"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  invoiceId: string
  amount: number
}

export function PaymentModal({ isOpen, onClose, invoiceId, amount }: PaymentModalProps) {
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true)
  }

  const handleClose = () => {
    setPaymentSuccess(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {paymentSuccess ? (
          <PaymentSuccess amount={amount} invoiceId={invoiceId} onClose={handleClose} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Pay Invoice #{invoiceId}</DialogTitle>
              <DialogDescription>
                Complete your payment securely using Stripe. Your payment information is encrypted.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <StripePaymentForm
                amount={amount}
                invoiceId={invoiceId}
                onSuccess={handlePaymentSuccess}
                onCancel={handleClose}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
