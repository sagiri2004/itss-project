"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { ReviewCard } from "@/components/reviews/review-card"
import type { Review, ReviewSearchParams } from "@/types/review"
import api from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

interface ReviewListProps {
  companyId?: string
  userId?: string
  currentUserId?: string
  isAdmin?: boolean
  limit?: number
}

export function ReviewList({ companyId, userId, currentUserId, isAdmin = false, limit = 10 }: ReviewListProps) {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useState<ReviewSearchParams>({
    companyId,
    userId,
    page: 1,
    limit,
    sortBy: "newest",
  })
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchReviews()
  }, [searchParams.page, searchParams.sortBy, companyId, userId])

  const fetchReviews = async () => {
    try {
      setLoading(true)

      // Try to fetch from API
      try {
        const response = await api.reviews.getReviews({
          ...searchParams,
          search: searchTerm,
        })
        setReviews(response.data.items)
        setTotalPages(Math.ceil(response.data.total / searchParams.limit!))
      } catch (apiError) {
        console.error("API error, using mock data:", apiError)

        // If API fails, use mock data
        setTimeout(() => {
          const mockReviews = [
            {
              id: "1",
              userId: userId || "user1",
              userName: "Nguyễn Văn A",
              userAvatar: null,
              rating: 5,
              content: "Dịch vụ rất tốt, nhân viên nhiệt tình, giá cả hợp lý. Sẽ sử dụng lại dịch vụ này.",
              createdAt: "2023-05-15T08:30:00Z",
              serviceName: "Cứu hộ xe máy",
              companyName: "Công ty Cứu hộ ABC",
              comment: "Excellent service!",
              requestId: "req1",
              companyId: "comp1",
            },
            {
              id: "2",
              userId: "user2",
              userName: "Trần Thị B",
              userAvatar: null,
              rating: 4,
              content:
                "Nhân viên đến khá nhanh, khoảng 30 phút sau khi gọi. Sửa chữa tạm thời để xe có thể di chuyển đến garage.",
              createdAt: "2023-05-10T14:20:00Z",
              serviceName: "Cứu hộ ô tô",
              companyName: "Công ty Cứu hộ XYZ",
              comment: "Quick response!",
              requestId: "req2",
              companyId: "comp2",
            },
            {
              id: "3",
              userId: "user3",
              userName: "Lê Văn C",
              userAvatar: null,
              rating: 3,
              content: "Dịch vụ tạm được, nhưng giá hơi cao so với thị trường. Nhân viên làm việc chuyên nghiệp.",
              createdAt: "2023-05-05T10:15:00Z",
              serviceName: "Thay lốp tại chỗ",
              companyName: "Công ty Cứu hộ 123",
              comment: "Average experience.",
              requestId: "req3",
              companyId: "comp3",
            },
          ]

          // Filter by userId if provided
          const filteredReviews = userId ? mockReviews.filter((review) => review.userId === userId) : mockReviews

          setReviews(filteredReviews)
          setTotalPages(Math.ceil(filteredReviews.length / searchParams.limit!))
        }, 500)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách đánh giá. Vui lòng thử lại sau.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams({ ...searchParams, page: 1 })
    fetchReviews()
  }

  const handleSortChange = (sortBy: "newest" | "oldest" | "highestRating" | "lowestRating") => {
      setSearchParams({ ...searchParams, sortBy, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setSearchParams({ ...searchParams, page: newPage })
    }
  }

  const handleDeleteReview = () => {
    fetchReviews()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Tìm kiếm đánh giá..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit">Tìm kiếm</Button>
        </form>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ArrowUpDown className="mr-2 h-4 w-4" /> Sắp xếp
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleSortChange("newest")}>Mới nhất</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("oldest")}>Cũ nhất</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("highestRating")}>Đánh giá cao nhất</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("lowestRating")}>Đánh giá thấp nhất</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Chưa có đánh giá nào.</p>
        </div>
      ) : (
        <div>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onDelete={handleDeleteReview}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(searchParams.page! - 1)}
                  disabled={searchParams.page === 1}
                >
                  Trước
                </Button>
                {[...Array(totalPages)].map((_, index) => (
                  <Button
                    key={index}
                    variant={searchParams.page === index + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(searchParams.page! + 1)}
                  disabled={searchParams.page === totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
