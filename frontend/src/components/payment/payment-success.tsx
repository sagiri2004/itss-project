"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface PaymentSuccessProps {
  amount: number
  invoiceId: string
  onClose: () => void
}

export function PaymentSuccess({ amount, invoiceId, onClose }: PaymentSuccessProps) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
      <Card className="border-green-200">
        <CardHeader className="pb-4 text-center">
          <div className="mx-auto rounded-full bg-green-100 p-4 w-16 h-16 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-xl font-bold text-green-700">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-2">
            Your payment of <span className="font-bold">${amount.toFixed(2)}</span> for invoice{" "}
            <span className="font-bold">#{invoiceId}</span> has been processed successfully.
          </p>
          <p className="text-sm text-muted-foreground">
            A receipt has been sent to your email address. Thank you for your payment.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={onClose}>Return to Invoices</Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
