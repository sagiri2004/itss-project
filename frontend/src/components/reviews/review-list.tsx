import { useState, useEffect } from "react"
import api from "@/services/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { StarRating } from "@/components/reviews/star-rating"

interface ReviewListProps {
  companyId: string
  currentUserId: string
  filter: "all" | "recent" | "highest" | "lowest"
  serviceId?: string
}

export function ReviewList({ companyId, currentUserId, filter, serviceId }: ReviewListProps) {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
      try {
        let params: any = { companyId }
        if (serviceId) params.serviceId = serviceId
        if (filter === "recent") params.sortBy = "createdAt.desc"
        else if (filter === "highest") params.sortBy = "stars.desc"
        else if (filter === "lowest") params.sortBy = "stars.asc"
        
        const res = await api.ratings.searchRatings(params)
        setReviews(res.data)
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: err.response?.data?.message || "Không thể tải đánh giá",
        })
      } finally {
        setLoading(false)
      }
    }
    if (companyId) fetchReviews()
  }, [companyId, filter, serviceId, toast])

  const handleDelete = async (ratingId: string) => {
    try {
      await api.ratings.deleteRating(ratingId)
      setReviews(reviews.filter(r => r.id !== ratingId))
      toast({ title: "Đã xóa đánh giá!" })
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err.response?.data?.message || "Không thể xóa đánh giá",
      })
    }
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div>Đang tải...</div>
      ) : reviews.length === 0 ? (
        <div>Chưa có đánh giá nào.</div>
      ) : (
        reviews.map(review => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{review.userName}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                  <div className="mt-2">
                    <StarRating rating={review.stars} size="sm" />
                  </div>
                  <div className="mt-2">{review.comment}</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Dịch vụ: {review.serviceName}
                  </div>
                </div>
                {review.userId === currentUserId && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(review.id)}
                  >
                    Xóa
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}