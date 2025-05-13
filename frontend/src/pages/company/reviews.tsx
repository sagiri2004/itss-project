"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/layouts/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Star } from "lucide-react"

// Mock data for reviews
const mockReviews = [
  {
    id: "1",
    userId: "user1",
    userName: "Nguyễn Văn A",
    userAvatar: null,
    rating: 5,
    comment: "Dịch vụ rất tốt, nhân viên nhiệt tình, đến nhanh và giải quyết vấn đề hiệu quả.",
    createdAt: "2023-05-15T08:30:00Z",
    requestId: "req1",
    companyId: "comp1",
  },
  {
    id: "2",
    userId: "user2",
    userName: "Trần Thị B",
    userAvatar: null,
    rating: 4,
    comment: "Dịch vụ tốt, nhưng giá hơi cao so với thị trường.",
    createdAt: "2023-05-10T14:20:00Z",
    requestId: "req2",
    companyId: "comp1",
  },
  {
    id: "3",
    userId: "user3",
    userName: "Lê Văn C",
    userAvatar: null,
    rating: 5,
    comment: "Rất hài lòng với dịch vụ, sẽ sử dụng lại trong tương lai.",
    createdAt: "2023-05-05T10:15:00Z",
    requestId: "req3",
    companyId: "comp1",
  },
  {
    id: "4",
    userId: "user4",
    userName: "Phạm Thị D",
    userAvatar: null,
    rating: 3,
    comment: "Dịch vụ ổn, nhưng thời gian chờ đợi hơi lâu.",
    createdAt: "2023-04-28T16:45:00Z",
    requestId: "req4",
    companyId: "comp1",
  },
  {
    id: "5",
    userId: "user5",
    userName: "Hoàng Văn E",
    userAvatar: null,
    rating: 5,
    comment: "Xuất sắc! Nhân viên rất chuyên nghiệp và thân thiện.",
    createdAt: "2023-04-20T09:30:00Z",
    requestId: "req5",
    companyId: "comp1",
  },
]

// Component to display star rating
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
      ))}
    </div>
  )
}

// Component to display review stats
const ReviewStats = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: [0, 0, 0, 0, 0],
  })

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const totalReviews = mockReviews.length
      const sum = mockReviews.reduce((acc, review) => acc + review.rating, 0)
      const averageRating = sum / totalReviews

      // Count reviews by rating
      const ratingCounts = [0, 0, 0, 0, 0]
      mockReviews.forEach((review) => {
        ratingCounts[review.rating - 1]++
      })

      setStats({
        averageRating,
        totalReviews,
        ratingCounts,
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thống kê đánh giá</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thống kê đánh giá</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</div>
          <div className="flex justify-center mt-2">
            <StarRating rating={Math.round(stats.averageRating)} />
          </div>
          <div className="text-sm text-muted-foreground mt-1">Dựa trên {stats.totalReviews} đánh giá</div>
        </div>

        <div className="space-y-2 mt-4">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingCounts[rating - 1]
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0

            return (
              <div key={rating} className="flex items-center gap-2">
                <div className="w-10 text-sm">{rating} sao</div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400" style={{ width: `${percentage}%` }}></div>
                </div>
                <div className="w-10 text-sm text-right">{count}</div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Component to display a review
const ReviewCard = ({ review }: { review: (typeof mockReviews)[0] }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={review.userAvatar || "/placeholder.svg"} alt={review.userName} />
            <AvatarFallback>{getInitials(review.userName)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{review.userName}</div>
            <div className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</div>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>
      <div className="mt-3">
        <p className="text-sm">{review.comment}</p>
      </div>
    </div>
  )
}

// Component to display a list of reviews
const ReviewList = ({ filter = "all" }: { filter?: string }) => {
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<typeof mockReviews>([])

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      let filteredReviews = [...mockReviews]

      if (filter === "highest") {
        filteredReviews = filteredReviews.sort((a, b) => b.rating - a.rating)
      } else if (filter === "lowest") {
        filteredReviews = filteredReviews.sort((a, b) => a.rating - b.rating)
      } else if (filter === "recent") {
        filteredReviews = filteredReviews.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      }

      setReviews(filteredReviews)
      setLoading(false)
    }, 1000)
  }, [filter])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Không có đánh giá nào.</p>
      </div>
    )
  }

  return (
    <div>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  )
}

export default function CompanyReviewsPage() {
  const { user } = useAuth()
  const [companyId, setCompanyId] = useState<string>("")
  const [currentUserId, setCurrentUserId] = useState<string>("")

  useEffect(() => {
    if (user) {
      setCompanyId(user.companyId || "comp1") // Use mock companyId if not available
      setCurrentUserId(user.id || "company1")
    }
  }, [user])

  return (
    <DashboardLayout role="company">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Đánh giá dịch vụ</h1>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <ReviewStats />
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
                    <ReviewList filter="all" />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recent">
                <Card>
                  <CardHeader>
                    <CardTitle>Đánh giá gần đây</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReviewList filter="recent" />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="highest">
                <Card>
                  <CardHeader>
                    <CardTitle>Đánh giá cao nhất</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReviewList filter="highest" />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="lowest">
                <Card>
                  <CardHeader>
                    <CardTitle>Đánh giá thấp nhất</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReviewList filter="lowest" />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
