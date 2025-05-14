"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RequestChart } from "@/components/reports/request-chart"
import { ServiceUsageChart } from "@/components/reports/service-usage-chart"
import { SatisfactionChart } from "@/components/reports/satisfaction-chart"
import DashboardLayout from "@/layouts/dashboard-layout"

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Thống kê và báo cáo</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="requests">Yêu cầu</TabsTrigger>
            <TabsTrigger value="satisfaction">Đánh giá</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tổng quan hệ thống</CardTitle>
                <CardDescription>Thống kê tổng quan về hoạt động của hệ thống</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <RequestChart timeRange="month" />
                  <ServiceUsageChart timeRange="month" />
                </div>
                <SatisfactionChart timeRange="month" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thống kê yêu cầu cứu hộ</CardTitle>
                <CardDescription>Chi tiết về số lượng và trạng thái các yêu cầu cứu hộ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RequestChart title="Số lượng yêu cầu theo thời gian" timeRange="month" />
                <RequestChart title="Phân bố trạng thái yêu cầu" timeRange="month" showStatus={true} />
                <ServiceUsageChart title="Tần suất sử dụng dịch vụ" timeRange="month" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="satisfaction" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mức độ hài lòng của khách hàng</CardTitle>
                <CardDescription>Thống kê về đánh giá và mức độ hài lòng của khách hàng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SatisfactionChart title="Đánh giá theo thời gian" timeRange="month" />
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Phân bố đánh giá</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center items-center h-64">
                        <p className="text-muted-foreground">Biểu đồ phân bố đánh giá sẽ hiển thị ở đây</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Top dịch vụ được đánh giá cao</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center items-center h-64">
                        <p className="text-muted-foreground">Biểu đồ top dịch vụ sẽ hiển thị ở đây</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
