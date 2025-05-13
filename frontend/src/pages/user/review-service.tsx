"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { StarRating } from "@/components/reviews/star-rating"
import DashboardLayout from "@/layouts/dashboard-layout"
import api from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

interface RequestDetails {
  id: string
  companyId: string
  companyName: string
  serviceId: string
  serviceName: string
  status: string
  createdAt: string
  completedAt?: string
}

export default function ReviewServicePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [request, setRequest] = useState<RequestDetails | null>(null)
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState("")
  const [contentError, setContentError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) return

      try {
        setIsLoading(true)
        const response = await api.rescueRequests.getRequestById(id)

        // Kiểm tra xem yêu cầu đã hoàn thành chưa
        if (response.data.status !== "COMPLETED" && response.data.status !== "PAID") {
          toast({
            variant: "destructive",
            title: "Không thể đánh giá",
            description: "Bạn chỉ có thể đánh giá dịch vụ đã hoàn thành.",
          })
          navigate("/user/requests")
          return
        }

        setRequest({
          id: response.data.id,
          companyId: response.data.companyId,
          companyName: response.data.companyName,
          serviceId: response.data.serviceId,
          serviceName: response.data.serviceName,
          status: response.data.status,
          createdAt: response.data.createdAt,
          completedAt: response.data.completedAt,
        })
      } catch (error) {
        console.error("Error fetching request:", error)
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải thông tin yêu cầu. Vui lòng thử lại sau.",
        })
        navigate("/user/requests")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequest()
  }, [id, navigate, toast])

  const validateContent = async () => {
    setContentError(null)

    if (!content.trim()) {
      setContentError("Vui lòng nhập nội dung đánh giá")
      return false
    }

    if (content.length < 10) {
      setContentError("Nội dung đánh giá phải có ít nhất 10 ký tự")
      return false
    }

    try {
      // Kiểm tra nội dung có từ ngữ không phù hợp không
      const response = await api.keywords.checkContent(content)
      if (response.data.containsInappropriate) {
        setContentError("Nội dung đánh giá chứa từ ngữ không phù hợp")
        return false
      }
    } catch (error) {
      console.error("Error checking content:", error)
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isValid = await validateContent()
    if (!isValid || !request) return

    try {
      setIsSubmitting(true)
      await api.reviews.createReview({
        requestId: request.id,
        companyId: request.companyId,
        rating,
        content,
      })

      toast({
        title: "Thành công",
        description: "Cảm ơn bạn đã đánh giá dịch vụ của chúng tôi!",
      })

      navigate("/user/requests")
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể gửi đánh giá. Vui lòng thử lại sau.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!request) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-4">
          <div className="text-center py-10">
            <p className="text-gray-500">Không tìm thấy thông tin yêu cầu.</p>
            <Button onClick={() => navigate("/user/requests")} variant="outline" className="mt-4">
              Quay lại danh sách yêu cầu
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/user/requests")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Đánh giá dịch vụ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Thông tin dịch vụ</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Công ty:</span>
                    <span className="font-medium">{request.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dịch vụ:</span>
                    <span className="font-medium">{request.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày hoàn thành:</span>
                    <span className="font-medium">
                      {request.completedAt
                        ? new Date(request.completedAt).toLocaleDateString()
                        : new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Đánh giá của bạn</h3>
                    <div className="flex items-center">
                      <StarRating rating={rating} onChange={setRating} size="lg" />
                      <span className="ml-2 text-lg font-medium">{rating}/5</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-medium">
                      Nội dung đánh giá
                    </label>
                    <Textarea
                      id="content"
                      placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ này..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className={`min-h-[150px] ${contentError ? "border-red-500" : ""}`}
                    />
                    {contentError && <p className="text-sm text-red-500">{contentError}</p>}
                  </div>

                  <Alert variant="default">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Lưu ý</AlertTitle>
                    <AlertDescription>
                      Đánh giá của bạn sẽ được hiển thị công khai. Vui lòng không chia sẻ thông tin cá nhân và tuân thủ
                      quy định của cộng đồng.
                    </AlertDescription>
                  </Alert>
                </div>
              </form>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              className="mr-2"
              onClick={() => navigate("/user/requests")}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}
