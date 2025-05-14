"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { ReviewList } from "@/components/reviews/review-list"
import { ReviewChart } from "@/components/reviews/review-chart"
import api from "@/services/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export default function CompanyReviewsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [companyId, setCompanyId] = useState<string>("")
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [loadingServices, setLoadingServices] = useState(true)
  const [ratingSummary, setRatingSummary] = useState<any>(null)
  const [reviewedServices, setReviewedServices] = useState<any[]>([])
  const [selectedServiceId, setSelectedServiceId] = useState<string>("all")

  useEffect(() => {
    if (user) {
      setCompanyId(user.companyId || "")
      setCurrentUserId(user.id || "")
    }
  }, [user])

  useEffect(() => {
    const fetchData = async () => {
      if (!companyId) return

      setLoadingSummary(true)
      setLoadingServices(true)

      try {
        const [summaryRes, servicesRes] = await Promise.all([
          api.ratings.getCompanyRatingSummary(companyId),
          api.ratings.getReviewedServicesByCompany(companyId),
        ])
        setRatingSummary(summaryRes.data)
        setReviewedServices(servicesRes.data)
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: err.response?.data?.message || "Không thể tải dữ liệu đánh giá",
        })
        setRatingSummary(null)
        setReviewedServices([])
      } finally {
        setLoadingSummary(false)
        setLoadingServices(false)
      }
    }
    fetchData()
  }, [companyId, toast])

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Đánh giá dịch vụ</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê đánh giá</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <Skeleton className="h-60 w-full rounded-lg" />
              ) : ratingSummary ? (
                <ReviewChart data={ratingSummary} />
              ) : (
                <div className="text-muted-foreground">Không có dữ liệu thống kê</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Dịch vụ đã được đánh giá</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingServices ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : reviewedServices.length === 0 ? (
                <div className="text-muted-foreground">Chưa có dịch vụ nào được đánh giá</div>
              ) : (
                <div className="space-y-4">
                  <Select
                    value={selectedServiceId}
                    onValueChange={setSelectedServiceId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn dịch vụ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả dịch vụ</SelectItem>
                      {reviewedServices.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} (Trung bình: {service.averageRating.toFixed(1)} sao, {service.totalRatings} đánh giá)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="space-y-4">
                    {reviewedServices.map(service => (
                      <div key={service.id} className="border-b py-3 last:border-b-0">
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">{service.description}</div>
                        <div className="text-sm">
                          Trung bình: {service.averageRating.toFixed(1)} sao ({service.totalRatings} đánh giá)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Tabs defaultValue="all-reviews" className="space-y-4">
            <TabsList className="grid grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="all-reviews">Tất cả</TabsTrigger>
              <TabsTrigger value="recent">Gần đây</TabsTrigger>
              <TabsTrigger value="highest">Cao nhất</TabsTrigger>
              <TabsTrigger value="lowest">Thấp nhất</TabsTrigger>
            </TabsList>
            <TabsContent value="all-reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Tất cả đánh giá</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReviewList
                    companyId={companyId}
                    currentUserId={currentUserId}
                    filter="all"
                    serviceId={selectedServiceId === "all" ? undefined : selectedServiceId}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="recent">
              <Card>
                <CardHeader>
                  <CardTitle>Đánh giá gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReviewList
                    companyId={companyId}
                    currentUserId={currentUserId}
                    filter="recent"
                    serviceId={selectedServiceId === "all" ? undefined : selectedServiceId}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="highest">
              <Card>
                <CardHeader>
                  <CardTitle>Đánh giá cao nhất</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReviewList
                    companyId={companyId}
                    currentUserId={currentUserId}
                    filter="highest"
                    serviceId={selectedServiceId === "all" ? undefined : selectedServiceId}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="lowest">
              <Card>
                <CardHeader>
                  <CardTitle>Đánh giá thấp nhất</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReviewList
                    companyId={companyId}
                    currentUserId={currentUserId}
                    filter="lowest"
                    serviceId={selectedServiceId === "all" ? undefined : selectedServiceId}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}