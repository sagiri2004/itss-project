"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewList } from "@/components/reviews/review-list"
import { ReviewChart } from "@/components/reviews/review-chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import DashboardLayout from "@/layouts/dashboard-layout"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import api from "@/services/api"

export default function UserReviewsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ratingSummary, setRatingSummary] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          setCurrentUserId(user.id)
          const response = await api.ratings.getCompanyRatingSummary(user.id)
          setRatingSummary(response.data)
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch data")
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load review data",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, toast])

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
        <h1 className="text-2xl font-bold mb-6">Reviews & Ratings</h1>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-40 mb-4" />
            <Skeleton className="h-[400px] w-full rounded-md" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Rating Statistics */}
            {ratingSummary && (
              <div className="grid grid-cols-1 gap-6">
                <ReviewChart data={ratingSummary} />
              </div>
            )}

            {/* Reviews List */}
            <Tabs defaultValue="my-reviews" className="space-y-4">
              <TabsList>
                <TabsTrigger value="my-reviews">My Reviews</TabsTrigger>
                <TabsTrigger value="all-reviews">All Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="my-reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>My Reviews</CardTitle>
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
                    <CardTitle>All Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReviewList currentUserId={currentUserId} key={`all-reviews-${currentUserId}`} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
