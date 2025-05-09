"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { StripePaymentForm } from "@/components/payment/stripe-payment-form"
import { ArrowLeft, Shield } from "lucide-react"
import type { PaymentInvoice } from "@/data/mock-data"
import { mockPaymentInvoice } from "@/data/mock-data"

export default function UserPayment() {
  const { user } = useAuth()
  const { id: invoiceId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [invoice, setInvoice] = useState<PaymentInvoice>(mockPaymentInvoice)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Simulate fetching invoice data
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        // In a real app, fetch from API
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setInvoice({
          ...mockPaymentInvoice,
          id: invoiceId || mockPaymentInvoice.id,
        })
        setIsLoading(false)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error loading invoice",
          description: "Could not load the invoice details. Please try again.",
        })
        setIsLoading(false)
      }
    }

    fetchInvoice()
  }, [invoiceId, toast])

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true)

    // In a real app, update the invoice status in the database
    setInvoice((prev) => ({
      ...prev,
      status: "PAID",
      paymentMethod: "Credit Card",
    }))

    // Redirect to invoices page after a delay
    setTimeout(() => {
      navigate("/user/invoices")
    }, 3000)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invoice details...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/user/invoices")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Payment</h1>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>Review your invoice before payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice #</p>
                  <p className="font-medium">{invoice.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="font-medium">{invoice.service}</p>
                <p className="text-sm text-muted-foreground mt-1">Provided by {invoice.company}</p>
              </div>

              <Separator />

              <div>
                <p className="font-medium mb-2">Items</p>
                <div className="space-y-2">
                  {invoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <p className="text-sm">{item.description}</p>
                      <p className="text-sm font-medium">${item.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <p className="font-bold">Total</p>
                <p className="font-bold">${invoice.amount.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Secure payment via Stripe</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-green-100 p-3">
                      <Shield className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold">Payment Successful!</h3>
                  <p className="text-muted-foreground">
                    Your payment of ${invoice.amount.toFixed(2)} has been processed successfully.
                  </p>
                  <p className="text-muted-foreground">You will be redirected to the invoices page shortly.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Shield className="h-4 w-4" />
                    <span>Your payment information is secure and encrypted</span>
                  </div>

                  <StripePaymentForm
                    amount={invoice.amount}
                    invoiceId={invoice.id}
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => navigate("/user/invoices")}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
