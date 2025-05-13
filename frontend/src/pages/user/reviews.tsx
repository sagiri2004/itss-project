"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewList } from "@/components/reviews/review-list"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import DashboardLayout from "@/layouts/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"

export default function UserReviewsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Set a timeout to ensure we're not stuck in loading state forever
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false)
        setError("Timed out while loading user data. Please refresh the page.")
      }
    }, 5000)

    if (user) {
      setCurrentUserId(user.id)
      setLoading(false)
    }

    return () => clearTimeout(timeout)
  }, [user, loading])

  if (error) {
    return (
      <DashboardLayout role="user">
        <div className="container mx-auto p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="user">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Đánh giá</h1>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-40 mb-4" />
            <Skeleton className="h-[400px] w-full rounded-md" />
          </div>
        ) : (
          <Tabs defaultValue="my-reviews" className="space-y-4">
            <TabsList>
              <TabsTrigger value="my-reviews">Đánh giá của tôi</TabsTrigger>
              <TabsTrigger value="all-reviews">Tất cả đánh giá</TabsTrigger>
            </TabsList>

            <TabsContent value="my-reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Đánh giá của tôi</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReviewList
                    userId={currentUserId}
                    currentUserId={currentUserId}
                    key={`my-reviews-${currentUserId}`}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all-reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Tất cả đánh giá</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReviewList currentUserId={currentUserId} key={`all-reviews-${currentUserId}`} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}
