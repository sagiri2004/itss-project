"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Trash2, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { Skeleton } from "@/components/ui/skeleton"
import DashboardLayout from "@/layouts/dashboard-layout"
import type { Topic, TopicSearchParams } from "@/types/topic"
import api from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

const AdminTopicsPage: React.FC = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useState<TopicSearchParams>({
    search: "",
    page: 1,
    limit: 10,
    sortBy: "newest",
  })
  const [totalPages, setTotalPages] = useState(1)
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null)

  useEffect(() => {
    fetchTopics()
  }, [searchParams.page, searchParams.sortBy])

  const fetchTopics = async () => {
    try {
      setLoading(true)
      const response = await api.topics.getTopics(searchParams)
      setTopics(response.data.items)
      setTotalPages(Math.ceil(response.data.total / searchParams.limit!))
    } catch (error) {
      console.error("Error fetching topics:", error)
    } finally {
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

  const handleDeleteTopic = async (id: string) => {
    try {
      setDeletingTopicId(id)
      await api.topics.deleteTopic(id)
      toast({
        title: "Thành công",
        description: "Chủ đề đã được xóa.",
      })
      fetchTopics()
    } catch (error) {
      console.error("Error deleting topic:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa chủ đề.",
        variant: "destructive",
      })
    } finally {
      setDeletingTopicId(null)
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
    <DashboardLayout role="admin">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý chủ đề</h1>
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
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((topic) => (
              <Card key={topic.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="cursor-pointer" onClick={() => navigate(`/user/topics/${topic.id}`)}>
                    <CardTitle className="text-xl">{topic.title}</CardTitle>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn xóa chủ đề này? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteTopic(topic.id)}
                          disabled={deletingTopicId === topic.id}
                        >
                          {deletingTopicId === topic.id ? "Đang xóa..." : "Xóa"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardHeader>
                <CardContent className="cursor-pointer" onClick={() => navigate(`/user/topics/${topic.id}`)}>
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

export default AdminTopicsPage
