"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Plus, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import DashboardLayout from "@/layouts/dashboard-layout"
import type { Topic, TopicSearchParams } from "@/types/topic"

const TopicsPage: React.FC = () => {
  const navigate = useNavigate()
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useState<TopicSearchParams>({
    search: "",
    page: 1,
    limit: 10,
    sortBy: "newest",
  })
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTopics()
  }, [searchParams.page, searchParams.sortBy])

  const fetchTopics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Simulate API call with mock data
      // In a real app, this would be an API call like:
      // const response = await api.topics.getTopics(searchParams)
      // setTopics(response.data.items)
      // setTotalPages(Math.ceil(response.data.total / searchParams.limit!))

      setTimeout(() => {
        const mockTopics = [
          {
            id: "1",
            title: "Xe bị hỏng giữa đường cao tốc, làm thế nào để đảm bảo an toàn?",
            content:
              "Tôi đang lái xe trên cao tốc và xe đột nhiên bị hỏng. Tôi không biết phải làm gì để đảm bảo an toàn cho bản thân và những người xung quanh. Mọi người có kinh nghiệm gì không?",
            imageUrl: null,
            userId: "user1",
            userName: "Nguyễn Văn A",
            userAvatar: null,
            createdAt: "2023-05-15T08:30:00Z",
            updatedAt: "2023-05-15T08:30:00Z",
            commentCount: 12,
            viewCount: 156,
          },
          {
            id: "2",
            title: "Kinh nghiệm xử lý khi xe bị ngập nước",
            content:
              "Mùa mưa đến rồi, tôi muốn chia sẻ một số kinh nghiệm khi xe bị ngập nước và cách xử lý. Mọi người cùng tham gia thảo luận nhé!",
            imageUrl: "/placeholder.svg?height=200&width=300",
            userId: "user2",
            userName: "Trần Thị B",
            userAvatar: null,
            createdAt: "2023-05-10T14:20:00Z",
            updatedAt: "2023-05-10T14:20:00Z",
            commentCount: 25,
            viewCount: 320,
          },
          {
            id: "3",
            title: "Cách xử lý khi xe bị nổ lốp trên đường",
            content:
              "Hôm qua tôi bị nổ lốp khi đang chạy trên đường, rất may là không bị tai nạn. Tôi muốn chia sẻ cách xử lý trong tình huống này.",
            imageUrl: null,
            userId: "user3",
            userName: "Lê Văn C",
            userAvatar: null,
            createdAt: "2023-05-05T10:15:00Z",
            updatedAt: "2023-05-05T10:15:00Z",
            commentCount: 18,
            viewCount: 210,
          },
          {
            id: "4",
            title: "Kinh nghiệm chọn dịch vụ cứu hộ xe máy uy tín",
            content:
              "Tôi muốn chia sẻ một số kinh nghiệm khi chọn dịch vụ cứu hộ xe máy uy tín, tránh bị chặt chém khi gặp sự cố.",
            imageUrl: null,
            userId: "user4",
            userName: "Phạm Thị D",
            userAvatar: null,
            createdAt: "2023-04-28T16:45:00Z",
            updatedAt: "2023-04-28T16:45:00Z",
            commentCount: 30,
            viewCount: 450,
          },
          {
            id: "5",
            title: "Chuẩn bị gì khi đi đường dài để tránh sự cố?",
            content:
              "Sắp tới tôi có kế hoạch đi du lịch bằng ô tô cá nhân. Mọi người có kinh nghiệm gì để chuẩn bị cho chuyến đi dài và tránh các sự cố không mong muốn không?",
            imageUrl: "/placeholder.svg?height=200&width=300",
            userId: "user5",
            userName: "Hoàng Văn E",
            userAvatar: null,
            createdAt: "2023-04-20T09:30:00Z",
            updatedAt: "2023-04-20T09:30:00Z",
            commentCount: 42,
            viewCount: 520,
          },
        ]

        setTopics(mockTopics)
        setTotalPages(3) // Giả lập có 3 trang
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching topics:", error)
      setError("Không thể tải danh sách chủ đề. Vui lòng thử lại sau.")
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams({ ...searchParams, page: 1 })
    fetchTopics()
  }

  const handleSortChange = (sortBy: "newest" | "oldest" | "mostCommented" | "mostViewed") => {
    setSearchParams({ ...searchParams, sortBy, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setSearchParams({ ...searchParams, page: newPage })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
    <DashboardLayout role="user">
      <div className="container mx-auto p-4">
        {error && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md text-red-800 dark:text-red-200">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null)
                fetchTopics()
              }}
              className="mt-2"
            >
              Thử lại
            </Button>
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Chủ đề trao đổi</h1>
          <Button onClick={() => navigate("/user/topics/create")} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Tạo chủ đề mới
          </Button>
        </div>

        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Tìm kiếm chủ đề..."
                className="pl-8"
                value={searchParams.search}
                onChange={(e) => setSearchParams({ ...searchParams, search: e.target.value })}
              />
            </div>
            <Button type="submit">Tìm kiếm</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ArrowUpDown className="mr-2 h-4 w-4" /> Sắp xếp
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleSortChange("newest")}>Mới nhất</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("oldest")}>Cũ nhất</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("mostCommented")}>
                  Nhiều bình luận nhất
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("mostViewed")}>Xem nhiều nhất</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </form>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-6 w-1/3" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Không tìm thấy chủ đề nào.</p>
            <Button onClick={() => navigate("/user/topics/create")} variant="outline" className="mt-4">
              Tạo chủ đề mới
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((topic) => (
              <Card
                key={topic.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/user/topics/${topic.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-xl">{topic.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-gray-600">{topic.content}</p>
                  {topic.imageUrl && (
                    <div className="mt-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <span className="text-xs">Có hình ảnh đính kèm</span>
                      </Badge>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={topic.userAvatar || "/placeholder.svg"} alt={topic.userName} />
                      <AvatarFallback>{getInitials(topic.userName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{topic.userName}</p>
                      <p className="text-xs text-gray-500">{formatDate(topic.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <span>{topic.commentCount}</span>
                      <span className="text-xs">bình luận</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <span>{topic.viewCount}</span>
                      <span className="text-xs">lượt xem</span>
                    </Badge>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
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
    </DashboardLayout>
  )
}

export default TopicsPage
