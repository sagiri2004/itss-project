"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardLayout from "@/layouts/dashboard-layout"
import api from "@/services/api"
import { useToast } from "@/components/ui/use-toast"
import { ReviewChart } from "@/components/reviews/review-chart"
import { SatisfactionChart } from "@/components/reports/satisfaction-chart"
import { Button } from "@/components/ui/button"

function AdminReviewList() {
  const { toast } = useToast()
  const [ratings, setRatings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRatings = async () => {
    setLoading(true)
    try {
      const res = await api.admin.getRatings()
      setRatings(res.data)
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err.response?.data?.message || "Không thể tải đánh giá",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRatings() }, [])

  const handleDelete = async (id: string) => {
    try {
      await api.admin.deleteRating(id)
      setRatings(ratings.filter(r => r.id !== id))
      toast({ title: "Đã xóa đánh giá!" })
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err.response?.data?.message || "Không thể xóa đánh giá",
      })
    }
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <div>Đang tải...</div>
      ) : ratings.length === 0 ? (
        <div>Chưa có đánh giá nào.</div>
      ) : (
        ratings.map(rating => (
          <Card key={rating.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{rating.userName}</div>
                  <div className="text-sm text-muted-foreground">{new Date(rating.createdAt).toLocaleDateString()}</div>
                  <div className="mt-2">{rating.stars} sao</div>
                  <div className="mt-2">{rating.comment}</div>
                  <div className="mt-2 text-sm text-muted-foreground">Dịch vụ: {rating.serviceName}</div>
                  <div className="mt-2 text-sm text-muted-foreground">Công ty: {rating.companyName}</div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(rating.id)}>Xóa</Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

function CompanyRatingStats() {
  const { toast } = useToast()
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCompany, setSelectedCompany] = useState<string>("")
  const [companyStats, setCompanyStats] = useState<any>(null)

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true)
      try {
        const res = await api.admin.getCompanies()
        setCompanies(res.data)
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: err.response?.data?.message || "Không thể tải danh sách công ty",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchCompanies()
  }, [toast])

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedCompany) return
      setLoading(true)
      try {
        const res = await api.ratings.getCompanyRatingSummary(selectedCompany)
        setCompanyStats(res.data)
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: err.response?.data?.message || "Không thể tải thống kê đánh giá",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [selectedCompany, toast])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thống kê đánh giá theo công ty</CardTitle>
        <select
          className="mt-2 border rounded px-3 py-2"
          value={selectedCompany}
          onChange={e => setSelectedCompany(e.target.value)}
        >
          <option value="">Chọn công ty</option>
          {companies.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </CardHeader>
      <CardContent>
        {loading ? <div>Đang tải...</div> : companyStats ? <ReviewChart data={companyStats} /> : <div>Chọn công ty để xem thống kê</div>}
      </CardContent>
    </Card>
  )
}

export default function AdminReviewsPage() {
  return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Quản lý đánh giá</h1>
        <Tabs defaultValue="all-reviews" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all-reviews">Tất cả đánh giá</TabsTrigger>
            <TabsTrigger value="company-stats">Thống kê theo công ty</TabsTrigger>
            <TabsTrigger value="satisfaction">Biểu đồ hài lòng</TabsTrigger>
          </TabsList>
          <TabsContent value="all-reviews">
            <Card>
              <CardHeader>
                <CardTitle>Tất cả đánh giá</CardTitle>
                <CardDescription>Quản lý tất cả đánh giá trên hệ thống</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminReviewList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="company-stats">
            <CompanyRatingStats />
          </TabsContent>
          <TabsContent value="satisfaction">
            <SatisfactionChart title="Biểu đồ hài lòng khách hàng" timeRange="month" />
          </TabsContent>
        </Tabs>
      </div>
  )
}
