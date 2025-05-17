"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Search, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import DashboardLayout from "@/layouts/dashboard-layout"
import api from "@/services/api"

interface Keyword {
  id: string
  word: string
  createdAt: string
}

export default function KeywordFilterPage() {
  const { toast } = useToast()
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [newKeyword, setNewKeyword] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [testContent, setTestContent] = useState("")
  const [testResult, setTestResult] = useState<{ isValid: boolean; invalidWords: string[] } | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)

  useEffect(() => {
    fetchKeywords()
  }, [])

  const fetchKeywords = async () => {
    try {
      setLoading(true)
      const response = await api.admin.getKeywords()
      setKeywords(response.data.items)
    } catch (error) {
      console.error("Error fetching keywords:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải danh sách từ khóa. Vui lòng thử lại sau.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập từ khóa.",
      })
      return
    }

    try {
      const response = await api.admin.addKeyword({ word: newKeyword, severity: "low" })
      setKeywords([...keywords, response.data])
      setNewKeyword("")
      setIsAddDialogOpen(false)
      toast({
        title: "Thành công",
        description: "Đã thêm từ khóa mới.",
      })
    } catch (error) {
      console.error("Error adding keyword:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể thêm từ khóa. Vui lòng thử lại sau.",
      })
    }
  }

  const handleDeleteKeyword = async (id: string) => {
    try {
      await api.admin.deleteKeyword(id)
      setKeywords(keywords.filter((keyword) => keyword.id !== id))
      toast({
        title: "Thành công",
        description: "Đã xóa từ khóa.",
      })
    } catch (error) {
      console.error("Error deleting keyword:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa từ khóa. Vui lòng thử lại sau.",
      })
    }
  }

  const handleTestContent = async () => {
    if (!testContent.trim()) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập nội dung cần kiểm tra.",
      })
      return
    }

    try {
      const response = await api.keywords.checkContent(testContent)
      setTestResult(response.data)
    } catch (error) {
      console.error("Error testing content:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể kiểm tra nội dung. Vui lòng thử lại sau.",
      })
    }
  }

  const filteredKeywords = keywords.filter((keyword) => keyword.word.toLowerCase().includes(searchTerm.toLowerCase()))

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

  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý từ khóa không phù hợp</h1>
          <div className="flex gap-2">
            <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <AlertTriangle className="mr-2 h-4 w-4" /> Kiểm tra nội dung
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Kiểm tra nội dung</DialogTitle>
                  <DialogDescription>
                    Nhập nội dung cần kiểm tra để xem có chứa từ khóa không phù hợp hay không.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label htmlFor="test-content" className="text-sm font-medium">
                      Nội dung cần kiểm tra
                    </label>
                    <textarea
                      id="test-content"
                      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Nhập nội dung cần kiểm tra..."
                      value={testContent}
                      onChange={(e) => setTestContent(e.target.value)}
                    />
                  </div>
                  {testResult && (
                    <Alert variant={testResult.isValid ? "default" : "destructive"}>
                      <AlertTitle>{testResult.isValid ? "Nội dung hợp lệ" : "Nội dung không hợp lệ"}</AlertTitle>
                      <AlertDescription>
                        {testResult.isValid
                          ? "Nội dung không chứa từ khóa không phù hợp."
                          : `Nội dung chứa từ khóa không phù hợp: ${testResult.invalidWords.join(", ")}`}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
                    Đóng
                  </Button>
                  <Button onClick={handleTestContent}>Kiểm tra</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Thêm từ khóa
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Thêm từ khóa mới</DialogTitle>
                  <DialogDescription>Thêm từ khóa không phù hợp vào danh sách cấm.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="new-keyword" className="text-sm font-medium">
                      Từ khóa
                    </label>
                    <Input
                      id="new-keyword"
                      placeholder="Nhập từ khóa..."
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleAddKeyword}>Thêm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Danh sách từ khóa không phù hợp</CardTitle>
            <CardDescription>
              Các từ khóa này sẽ được áp dụng để lọc nội dung không phù hợp trong hệ thống.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm từ khóa..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : filteredKeywords.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Không tìm thấy từ khóa nào.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Từ khóa</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKeywords.map((keyword) => (
                    <TableRow key={keyword.id}>
                      <TableCell>
                        <Badge variant="outline">{keyword.word}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(keyword.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteKeyword(keyword.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phạm vi áp dụng</CardTitle>
            <CardDescription>Danh sách từ khóa không phù hợp sẽ được áp dụng cho các nội dung sau:</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Tên topic, nội dung topic</li>
              <li>Nội dung comment trong topic</li>
              <li>Nội dung đánh giá dịch vụ công ty</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
