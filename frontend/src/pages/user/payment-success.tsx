"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckCircle, Star, ArrowRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import api from "@/services/api"
import DashboardLayout from "@/layouts/dashboard-layout"

export default function PaymentSuccessPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!id) return

      try {
        setLoading(true)
        // Giả định API endpoint để lấy thông tin thanh toán
        const response = await api.invoices.getInvoiceById(id)
        setPaymentDetails(response.data)
      } catch (error) {
        console.error("Error fetching payment details:", error)
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải thông tin thanh toán. Vui lòng thử lại sau.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentDetails()
  }, [id, toast])

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

  if (loading) {
    return (
      <DashboardLayout role="user">
        <div className="container mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="user">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto p-4 max-w-2xl"
      >
        <motion.div variants={itemVariants} className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold">Thanh toán thành công!</h1>
          <p className="text-muted-foreground mt-2">
            Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Dưới đây là thông tin chi tiết về thanh toán của bạn.
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã thanh toán:</span>
                <span className="font-medium">{paymentDetails?.id || id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dịch vụ:</span>
                <span className="font-medium">{paymentDetails?.serviceName || "Dịch vụ cứu hộ"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Công ty cung cấp:</span>
                <span className="font-medium">{paymentDetails?.companyName || "Công ty cứu hộ"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày thanh toán:</span>
                <span className="font-medium">
                  {paymentDetails?.paidAt
                    ? new Date(paymentDetails.paidAt).toLocaleDateString()
                    : new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phương thức thanh toán:</span>
                <span className="font-medium">{paymentDetails?.paymentMethod || "Thẻ tín dụng"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng tiền:</span>
                <span className="font-bold text-lg">
                  {paymentDetails?.amount ? `${paymentDetails.amount.toLocaleString()} đ` : "N/A"}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                className="w-full"
                onClick={() => navigate(`/user/review-service/${paymentDetails?.requestId || id}`)}
              >
                <Star className="mr-2 h-4 w-4" />
                Đánh giá dịch vụ
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/user/dashboard")}>
                Về trang chủ
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}
