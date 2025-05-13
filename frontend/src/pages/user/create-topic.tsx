"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Upload, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import DashboardLayout from "@/layouts/dashboard-layout"
import api from "@/services/api"
import { useToast } from "@/components/ui/use-toast"

const CreateTopicPage: React.FC = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [contentError, setContentError] = useState<string | null>(null)
  const [titleError, setTitleError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Lỗi",
          description: "Kích thước file không được vượt quá 5MB.",
          variant: "destructive",
        })
        return
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Lỗi",
          description: "Chỉ chấp nhận file hình ảnh.",
          variant: "destructive",
        })
        return
      }

      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const validateForm = async () => {
    let isValid = true

    // Reset errors
    setTitleError(null)
    setContentError(null)

    // Validate title
    if (!title.trim()) {
      setTitleError("Tiêu đề không được để trống")
      isValid = false
    } else if (title.length < 5) {
      setTitleError("Tiêu đề phải có ít nhất 5 ký tự")
      isValid = false
    } else if (title.length > 100) {
      setTitleError("Tiêu đề không được vượt quá 100 ký tự")
      isValid = false
    }

    // Validate content
    if (!content.trim()) {
      setContentError("Nội dung không được để trống")
      isValid = false
    } else if (content.length < 10) {
      setContentError("Nội dung phải có ít nhất 10 ký tự")
      isValid = false
    }

    // Check for inappropriate content
    try {
      if (title) {
        const titleCheckResponse = await api.keywords.checkContent(title)
        if (titleCheckResponse.data.containsInappropriate) {
          setTitleError("Tiêu đề chứa nội dung không phù hợp")
          isValid = false
        }
      }

      if (content) {
        const contentCheckResponse = await api.keywords.checkContent(content)
        if (contentCheckResponse.data.containsInappropriate) {
          setContentError("Nội dung chứa từ ngữ không phù hợp")
          isValid = false
        }
      }
    } catch (error) {
      console.error("Error checking content:", error)
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isValid = await validateForm()
    if (!isValid) return

    try {
      setSubmitting(true)

      const formData = new FormData()
      formData.append("title", title)
      formData.append("content", content)
      if (image) {
        formData.append("image", image)
      }

      const response = await api.topics.createTopic(formData)

      toast({
        title: "Thành công",
        description: "Chủ đề của bạn đã được tạo.",
      })

      navigate(`/user/topics/${response.data.id}`)
    } catch (error) {
      console.error("Error creating topic:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tạo chủ đề. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

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
            <CardTitle className="text-2xl">Tạo chủ đề mới</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề</Label>
                  <Input
                    id="title"
                    placeholder="Nhập tiêu đề chủ đề"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={titleError ? "border-red-500" : ""}
                  />
                  {titleError && <p className="text-sm text-red-500">{titleError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Nội dung</Label>
                  <Textarea
                    id="content"
                    placeholder="Nhập nội dung chủ đề"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={`min-h-[200px] ${contentError ? "border-red-500" : ""}`}
                  />
                  {contentError && <p className="text-sm text-red-500">{contentError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Hình ảnh (không bắt buộc)</Label>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2 h-4 w-4" /> Tải lên hình ảnh
                    </Button>
                    <Input
                      id="image"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <p className="text-sm text-gray-500">Tối đa 5MB. Chỉ chấp nhận định dạng hình ảnh.</p>
                  </div>

                  {imagePreview && (
                    <div className="relative mt-4 inline-block">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="max-w-full max-h-64 rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <Alert variant="default">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Lưu ý</AlertTitle>
                  <AlertDescription>
                    Nội dung chủ đề phải tuân thủ quy định của cộng đồng. Nội dung vi phạm sẽ bị xóa và tài khoản có thể
                    bị khóa.
                  </AlertDescription>
                </Alert>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="button" variant="outline" className="mr-2" onClick={() => navigate("/user/topics")}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !title.trim() || !content.trim()}>
              {submitting ? "Đang tạo..." : "Tạo chủ đề"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default CreateTopicPage
 