"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { CreditCard, CheckCircle2, AlertCircle } from "lucide-react"

// Giả định rằng bạn sẽ thay thế bằng khóa công khai thực tế của bạn
const stripePromise = loadStripe(
  "pk_test_51NxjSLDJ7oO7XUVnYmkKLYVEJ1DGHYiEHYtUwSmjWTQFJCKXzC8NHDcYvDQiFYEBqxGBJFCq1QzYXeNHp9fTNJ9H00wXrjgQaB",
)

interface PaymentFormProps {
  amount: number
  invoiceId: string
  onSuccess?: () => void
  onCancel?: () => void
}

const PaymentForm = ({ amount, invoiceId, onSuccess, onCancel }: PaymentFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [succeeded, setSucceeded] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js chưa được tải
      return
    }

    if (!cardComplete) {
      setError("Vui lòng điền đầy đủ thông tin thẻ")
      return
    }

    setProcessing(true)

    try {
      // Trong ứng dụng thực tế, bạn sẽ gọi API của mình để tạo PaymentIntent
      // và sử dụng client_secret từ phản hồi

      // Mô phỏng gọi API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mô phỏng thanh toán thành công
      setSucceeded(true)
      setError(null)

      toast({
        title: "Thanh toán thành công",
        description: `Đã thanh toán hóa đơn #${invoiceId} với số tiền $${amount.toFixed(2)}`,
        variant: "default",
      })

      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 1000)
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi xử lý thanh toán của bạn.")
      toast({
        title: "Thanh toán thất bại",
        description: "Đã xảy ra lỗi khi xử lý thanh toán của bạn.",
        variant: "destructive",
      })
    }

    setProcessing(false)
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      navigate(-1)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="card-element">Thông tin thẻ</Label>
        <div className="p-3 border rounded-md">
          <CardElement
            id="card-element"
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
            onChange={(e) => {
              setCardComplete(e.complete)
              setError(e.error ? e.error.message : null)
            }}
          />
        </div>
        {error && (
          <div className="text-sm text-red-500 flex items-center mt-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Tổng thanh toán</p>
          <p className="text-xl font-bold">${amount.toFixed(2)}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={processing}>
            Hủy
          </Button>
          <Button type="submit" disabled={processing || succeeded}>
            {processing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </div>
            ) : succeeded ? (
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Đã thanh toán
              </div>
            ) : (
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Thanh toán ${amount.toFixed(2)}
              </div>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

export const StripePaymentForm = ({ amount, invoiceId, onSuccess, onCancel }: PaymentFormProps) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm amount={amount} invoiceId={invoiceId} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  )
}
