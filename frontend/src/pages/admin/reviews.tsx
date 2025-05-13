"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewList } from "@/components/reviews/review-list"
import DashboardLayout from "@/layouts/dashboard-layout"
import { useAuth } from "@/context/auth-context"

export default function AdminReviewsPage() {
  const { user } = useAuth()
  const [currentUserId, setCurrentUserId] = useState<string>("")

  useEffect(() => {
    if (user) {
      setCurrentUserId(user.id)
    }
  }, [user])

  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Quản lý đánh giá</h1>

        <Tabs defaultValue="all-reviews" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all-reviews">Tất cả đánh giá</TabsTrigger>
            <TabsTrigger value="recent">Gần đây</TabsTrigger>
            <TabsTrigger value="reported">Đã báo cáo</TabsTrigger>
          </TabsList>

          <TabsContent value="all-reviews">
            <Card>
              <CardHeader>
                <CardTitle>Tất cả đánh giá</CardTitle>
                <CardDescription>Quản lý tất cả đánh giá trên hệ thống</CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewList currentUserId={currentUserId} isAdmin={true} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Đánh giá gần đây</CardTitle>
                <CardDescription>Các đánh giá mới được thêm vào hệ thống</CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewList currentUserId={currentUserId} isAdmin={true} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reported">
            <Card>
              <CardHeader>
                <CardTitle>Đánh giá đã báo cáo</CardTitle>
                <CardDescription>Các đánh giá bị người dùng báo cáo vi phạm</CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewList currentUserId={currentUserId} isAdmin={true} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
