"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { ReviewList } from "@/components/reviews/review-list"
import { ReviewChart } from "@/components/reviews/review-chart"
import api from "@/services/api"

export default function CompanyReviewsPage() {
  const { user } = useAuth()
  const [companyId, setCompanyId] = useState<string>("")
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [ratingSummary, setRatingSummary] = useState<any>(null)

  useEffect(() => {
    if (user) {
      setCompanyId(user.companyId || "")
      setCurrentUserId(user.id || "")
    }
  }, [user])

  useEffect(() => {
    const fetchSummary = async () => {
      if (!companyId) return
      setLoading(true)
      try {
        const res = await api.ratings.getCompanyRatingSummary(companyId)
        setRatingSummary(res.data)
      } catch {
        setRatingSummary(null)
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [companyId])

  return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Đánh giá dịch vụ</h1>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Thống kê đánh giá</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-60 w-full" />
                ) : ratingSummary ? (
                  <ReviewChart data={ratingSummary} />
                ) : (
                  <div>Không có dữ liệu</div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Tabs defaultValue="all-reviews" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all-reviews">Tất cả đánh giá</TabsTrigger>
                <TabsTrigger value="recent">Gần đây</TabsTrigger>
                <TabsTrigger value="highest">Đánh giá cao nhất</TabsTrigger>
                <TabsTrigger value="lowest">Đánh giá thấp nhất</TabsTrigger>
              </TabsList>
              <TabsContent value="all-reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Tất cả đánh giá</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReviewList companyId={companyId} currentUserId={currentUserId} filter="all" />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="recent">
                <Card>
                  <CardHeader>
                    <CardTitle>Đánh giá gần đây</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReviewList companyId={companyId} currentUserId={currentUserId} filter="recent" />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="highest">
                <Card>
                  <CardHeader>
                    <CardTitle>Đánh giá cao nhất</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReviewList companyId={companyId} currentUserId={currentUserId} filter="highest" />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="lowest">
                <Card>
                  <CardHeader>
                    <CardTitle>Đánh giá thấp nhất</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReviewList companyId={companyId} currentUserId={currentUserId} filter="lowest" />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
  )
}
