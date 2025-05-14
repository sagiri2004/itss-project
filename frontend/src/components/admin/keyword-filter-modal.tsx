"use client"

import { useState, useEffect } from "react"
import { Plus, Search, AlertTriangle, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import api from "@/services/api"

// Định nghĩa interface cho từ khóa
interface Keyword {
  id: string
  word: string
  severity: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
}

export function KeywordFilterModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { toast } = useToast()
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [newKeyword, setNewKeyword] = useState("")
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Lấy danh sách từ khóa khi mở modal
  useEffect(() => {
    if (isOpen) {
      fetchKeywords()
    }
  }, [isOpen])

  // Hàm lấy danh sách từ khóa từ API
  const fetchKeywords = async () => {
    setIsLoading(true)
    try {
      // Giả định API endpoint để lấy danh sách từ khóa
      const response = await api.keywords.getKeywords()
      setKeywords(response.data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể tải danh sách từ khóa",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Hàm thêm từ khóa mới
  const addKeyword = async () => {
    if (!newKeyword.trim()) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập từ khóa",
      })
      return
    }

    // Kiểm tra từ khóa đã tồn tại chưa
    if (keywords.some((k) => k.word.toLowerCase() === newKeyword.toLowerCase())) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Từ khóa này đã tồn tại trong danh sách",
      })
      return
    }

    setIsLoading(true)
    try {
      // Giả định API endpoint để thêm từ khóa mới
      const response = await api.keywords.addKeyword({
        word: newKeyword,
        severity: severity,
      })

      setKeywords([...keywords, response.data])
      setNewKeyword("")
      toast({
        title: "Thành công",
        description: "Đã thêm từ khóa vào danh sách cấm",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể thêm từ khóa",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Hàm xóa từ khóa
  const deleteKeyword = async (id: string) => {
    setIsLoading(true)
    try {
      // Giả định API endpoint để xóa từ khóa
      await api.keywords.deleteKeyword(id)
      setKeywords(keywords.filter((keyword) => keyword.id !== id))
      toast({
        title: "Thành công",
        description: "Đã xóa từ khóa khỏi danh sách cấm",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể xóa từ khóa",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Lọc từ khóa theo tab và tìm kiếm
  const filteredKeywords = keywords.filter((keyword) => {
    const matchesSearch = keyword.word.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" || keyword.severity === activeTab
    return matchesSearch && matchesTab
  })

  // Hàm render badge severity
  const renderSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return (
          <Badge variant="destructive" className="ml-2">
            Nghiêm trọng
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="default" className="ml-2 bg-orange-500">
            Trung bình
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="ml-2">
            Nhẹ
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
            Quản lý từ khóa không phù hợp
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center space-x-2 my-4">
          <Input
            placeholder="Thêm từ khóa mới..."
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addKeyword()
              }
            }}
          />
          <div className="flex items-center space-x-2">
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as "low" | "medium" | "high")}
            >
              <option value="low">Nhẹ</option>
              <option value="medium">Trung bình</option>
              <option value="high">Nghiêm trọng</option>
            </select>
            <Button onClick={addKeyword} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-1" /> Thêm
            </Button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm từ khóa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="high">Nghiêm trọng</TabsTrigger>
            <TabsTrigger value="medium">Trung bình</TabsTrigger>
            <TabsTrigger value="low">Nhẹ</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="border rounded-md overflow-y-auto max-h-[300px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-[200px]">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                </div>
              ) : filteredKeywords.length > 0 ? (
                <ul className="divide-y">
                  {filteredKeywords.map((keyword) => (
                    <li key={keyword.id} className="flex items-center justify-between p-3 hover:bg-muted">
                      <div className="flex items-center">
                        <span className="font-medium">{keyword.word}</span>
                        {renderSeverityBadge(keyword.severity)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteKeyword(keyword.id)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mb-2" />
                  <p>Không tìm thấy từ khóa nào</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <div className="text-sm text-muted-foreground">
            Tổng số: {keywords.length} từ khóa ({keywords.filter((k) => k.severity === "high").length} nghiêm trọng)
          </div>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
