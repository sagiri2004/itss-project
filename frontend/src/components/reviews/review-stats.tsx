"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StarRating } from "@/components/reviews/star-rating"
import type { ReviewStats } from "@/types/review"
import api from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

interface ReviewStatsProps {
  companyId: string
}

export function ReviewStats({ companyId }: ReviewStatsProps) {
  const { toast } = useToast()
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await api.reviews.getCompanyStats(companyId)
        setStats(response.data)
      } catch (error) {
        console.error("Error fetching review stats:", error)
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Không thể tải thống kê đánh giá. Vui lòng thử lại sau.",
        })
      } finally {
        setLoading(false)
      }
    }

    if (companyId) {
      fetchStats()
    }
  }, [companyId, toast])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Chưa có dữ liệu đánh giá</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đánh giá</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <div className="mt-2">
              <StarRating rating={Math.round(stats.averageRating)} readOnly />
            </div>
            <div className="text-sm text-muted-foreground mt-1">Dựa trên {stats.totalReviews} đánh giá</div>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingCounts[rating] || 0
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0

              return (
                <div key={rating} className="flex items-center gap-2">
                  <div className="flex items-center w-12">
                    <span className="text-sm font-medium">{rating}</span>
                    <svg
                      className="w-4 h-4 text-yellow-400 ml-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  </div>
                  <Progress value={percentage} className="h-2 flex-1" />
                  <div className="w-12 text-right text-sm text-muted-foreground">{count}</div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
