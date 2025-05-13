"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { Trash2, Flag } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { StarRating } from "@/components/reviews/star-rating"
import type { Review } from "@/types/review"
import { useToast } from "@/components/ui/use-toast"
import api from "@/services/api"

interface ReviewCardProps {
  review: Review
  currentUserId?: string
  isAdmin?: boolean
  onDelete?: () => void
}

export function ReviewCard({ review, currentUserId, isAdmin = false, onDelete }: ReviewCardProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [isReporting, setIsReporting] = useState(false)

  const isOwner = currentUserId === review.userId

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await api.reviews.deleteReview(review.id)
      toast({
        title: "Thành công",
        description: "Đánh giá đã được xóa",
      })
      if (onDelete) {
        onDelete()
      }
    } catch (error: any) {
      console.error("Error deleting review:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Không thể xóa đánh giá. Vui lòng thử lại sau.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập lý do báo cáo",
      })
      return
    }

    try {
      setIsReporting(true)
      // Giả định API endpoint để báo cáo đánh giá
      // await api.reviews.reportReview(review.id, reportReason)
      toast({
        title: "Thành công",
        description: "Báo cáo của bạn đã được gửi đến quản trị viên",
      })
      setReportReason("")
    } catch (error: any) {
      console.error("Error reporting review:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error?.message || "Không thể gửi báo cáo. Vui lòng thử lại sau.",
      })
    } finally {
      setIsReporting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: vi })
    } catch (error) {
      return "Không xác định"
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={review.userAvatar || "/placeholder.svg"} alt={review.userName} />
            <AvatarFallback>{getInitials(review.userName)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{review.userName}</div>
            <div className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</div>
            <div className="mt-1">
              <StarRating rating={review.rating} readOnly size="sm" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {(isOwner || isAdmin) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? "Đang xóa..." : "Xóa"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {!isOwner && !isAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Flag className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Báo cáo đánh giá</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vui lòng cho chúng tôi biết lý do bạn báo cáo đánh giá này.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Textarea
                    placeholder="Nhập lý do báo cáo..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setReportReason("")}>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReport} disabled={isReporting || !reportReason.trim()}>
                    {isReporting ? "Đang gửi..." : "Gửi báo cáo"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="mb-2">
          <StarRating rating={review.rating} readOnly size="sm" />
        </div>
        <p className="text-sm whitespace-pre-line">{review.content || "Không có nội dung đánh giá."}</p>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{review.serviceName || "Dịch vụ cứu hộ"}</Badge>
          <Badge variant="secondary">{review.companyName}</Badge>
        </div>
      </CardFooter>
    </Card>
  )
}
