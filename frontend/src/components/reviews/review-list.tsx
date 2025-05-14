"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { RatingStars } from "@/components/rating-stars"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import api from "@/services/api"

interface Review {
  id: string;
  userId: string;
  userName: string;
  companyId: string;
  companyName: string;
  serviceId: string;
  serviceName: string;
  stars: number;
  comment: string;
  createdAt: string;
}

interface ReviewListProps {
  companyId: string;
  currentUserId?: string;
  limit?: number;
  filter?: "all" | "recent" | "highest" | "lowest";
}

export function ReviewList({ companyId, currentUserId, limit = 10, filter = "all" }: ReviewListProps) {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReviews = async () => {
      if (!companyId) {
        setReviews([])
        setLoading(false)
        return
      }
      try {
        const response = await api.ratings.getCompanyRatings(companyId)
        let data: Review[] = response.data
        // Filter/sort
        if (filter === "recent") {
          data = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        } else if (filter === "highest") {
          data = data.sort((a, b) => b.stars - a.stars)
        } else if (filter === "lowest") {
          data = data.sort((a, b) => a.stars - b.stars)
        }
        setReviews(data.slice(0, limit))
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch reviews")
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load reviews",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [companyId, filter, limit, toast])

  const handleDelete = async (reviewId: string) => {
    try {
      await api.ratings.deleteRating(reviewId)
      setReviews(reviews.filter(review => review.id !== reviewId))
      toast({
        title: "Success",
        description: "Review deleted successfully",
      })
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Failed to delete review",
      })
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (reviews.length === 0) {
    return <div className="text-center text-muted-foreground">No reviews found</div>
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{review.userName}</span>
                  {review.serviceName && (
                    <span className="text-sm text-muted-foreground">
                      reviewed {review.serviceName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <RatingStars rating={review.stars} size="sm" />
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(review.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                )}
                <div className="mt-2 text-sm text-muted-foreground">
                  <span>Company: {review.companyName}</span>
                </div>
              </div>
              {currentUserId === review.userId && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(review.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
