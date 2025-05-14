"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, MessageSquare, Eye, Flag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import { Skeleton } from "@/components/ui/skeleton"
import DashboardLayout from "@/layouts/dashboard-layout"
import type { Topic, TopicComment } from "@/types/topic"
import api from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

const TopicDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [comments, setComments] = useState<TopicComment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [reportingTopic, setReportingTopic] = useState(false)
  const [reportingComment, setReportingComment] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchTopic()
      fetchComments()
      fetchCurrentUser()
    }
  }, [id])

  const fetchTopic = async () => {
    try {
      setLoading(true)
      const response = await api.topics.getTopicById(id!)
      setTopic(response.data)
    } catch (error) {
      console.error("Error fetching topic:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin chủ đề.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      setCommentsLoading(true)
      const response = await api.topics.getComments(id!)
      setComments(response.data)
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setCommentsLoading(false)
    }
  }

  const fetchCurrentUser = async () => {
    try {
      const response = await api.users.getProfile()
      setCurrentUserId(response.data.id)
      setIsAdmin(response.data.roles.includes("ADMIN"))
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      setSubmitting(true)
      await api.topics.addComment(id!, { content: newComment })
      setNewComment("")
      fetchComments()
      toast({
        title: "Thành công",
        description: "Bình luận của bạn đã được đăng.",
      })
    } catch (error) {
      console.error("Error posting comment:", error)
      toast({
        title: "Lỗi",
        description: "Không thể đăng bình luận.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTopic = async () => {
    try {
      await api.topics.deleteTopic(id!)
      toast({
        title: "Thành công",
        description: "Chủ đề đã được xóa.",
      })
      navigate("/user/topics")
    } catch (error) {
      console.error("Error deleting topic:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa chủ đề.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.topics.deleteComment(id!, commentId)
      fetchComments()
      toast({
        title: "Thành công",
        description: "Bình luận đã được xóa.",
      })
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa bình luận.",
        variant: "destructive",
      })
    }
  }

  const handleReportTopic = async () => {
    if (!reportReason.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do báo cáo.",
        variant: "destructive",
      })
      return
    }

    try {
      setReportingTopic(true)
      await api.topics.reportTopic(id!, reportReason)
      toast({
        title: "Thành công",
        description: "Báo cáo của bạn đã được gửi đến quản trị viên.",
      })
      setReportReason("")
    } catch (error) {
      console.error("Error reporting topic:", error)
      toast({
        title: "Lỗi",
        description: "Không thể gửi báo cáo.",
        variant: "destructive",
      })
    } finally {
      setReportingTopic(false)
    }
  }

  const handleReportComment = async (commentId: string) => {
    if (!reportReason.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập lý do báo cáo.",
        variant: "destructive",
      })
      return
    }

    try {
      setReportingComment(commentId)
      await api.topics.reportComment(id!, commentId, reportReason)
      toast({
        title: "Thành công",
        description: "Báo cáo của bạn đã được gửi đến quản trị viên.",
      })
      setReportReason("")
    } catch (error) {
      console.error("Error reporting comment:", error)
      toast({
        title: "Lỗi",
        description: "Không thể gửi báo cáo.",
        variant: "destructive",
      })
    } finally {
      setReportingComment(null)
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

  if (loading) {
    return (
      <DashboardLayout role="user">
        <div className="container mx-auto p-4">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate("/user/topics")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Button>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-6 w-1/3" />
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!topic) {
    return (
      <DashboardLayout role="user">
        <div className="container mx-auto p-4">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate("/user/topics")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
            </Button>
          </div>
          <div className="text-center py-10">
            <p className="text-gray-500">Không tìm thấy chủ đề.</p>
            <Button onClick={() => navigate("/user/topics")} variant="outline" className="mt-4">
              Quay lại danh sách chủ đề
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="user">
      <div className="container mx-auto p-4">
        <div className="mb-6 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/user/topics")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
          <div className="flex gap-2">
            {(topic.userId === currentUserId || isAdmin) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" /> Xóa chủ đề
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
                    <AlertDialogAction onClick={handleDeleteTopic}>Xóa</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {topic.userId !== currentUserId && !isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Flag className="mr-2 h-4 w-4" /> Báo cáo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Báo cáo chủ đề</AlertDialogTitle>
                    <AlertDialogDescription>
                      Vui lòng cho chúng tôi biết lý do bạn báo cáo chủ đề này.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Textarea
                    placeholder="Nhập lý do báo cáo..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="my-4"
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setReportReason("")}>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReportTopic} disabled={reportingTopic || !reportReason.trim()}>
                      {reportingTopic ? "Đang gửi..." : "Gửi báo cáo"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{topic.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={topic.userAvatar || "/placeholder.svg"} alt={topic.userName} />
                <AvatarFallback>{getInitials(topic.userName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{topic.userName}</p>
                <p className="text-xs text-gray-500">{formatDate(topic.createdAt)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{topic.content}</p>
            {topic.imageUrl && (
              <div className="mt-4">
                <img
                  src={topic.imageUrl || "/placeholder.svg"}
                  alt="Topic attachment"
                  className="max-w-full rounded-md max-h-96 object-contain"
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{topic.commentCount} bình luận</span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{topic.viewCount} lượt xem</span>
              </Badge>
            </div>
          </CardFooter>
        </Card>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Bình luận</h2>
          <form onSubmit={handleSubmitComment}>
            <Textarea
              placeholder="Viết bình luận của bạn..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-2"
            />
            <Button type="submit" disabled={submitting || !newComment.trim()}>
              {submitting ? "Đang gửi..." : "Gửi bình luận"}
            </Button>
          </form>
        </div>

        <Separator className="my-6" />

        {commentsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-1/4 mb-2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.userAvatar || "/placeholder.svg"} alt={comment.userName} />
                      <AvatarFallback>{getInitials(comment.userName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{comment.userName}</p>
                      <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                      <p className="mt-2 whitespace-pre-line">{comment.content}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(comment.userId === currentUserId || isAdmin) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteComment(comment.id)}>Xóa</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {comment.userId !== currentUserId && !isAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Flag className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Báo cáo bình luận</AlertDialogTitle>
                            <AlertDialogDescription>
                              Vui lòng cho chúng tôi biết lý do bạn báo cáo bình luận này.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <Textarea
                            placeholder="Nhập lý do báo cáo..."
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="my-4"
                          />
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setReportReason("")}>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleReportComment(comment.id)}
                              disabled={reportingComment === comment.id || !reportReason.trim()}
                            >
                              {reportingComment === comment.id ? "Đang gửi..." : "Gửi báo cáo"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default TopicDetailsPage
