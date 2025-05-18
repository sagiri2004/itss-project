import { useState, useEffect } from "react";
import api from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { StarRating } from "@/components/reviews/star-rating";

interface ReviewListProps {
  companyId: string;
  currentUserId: string;
  filter: "all" | "recent" | "highest" | "lowest";
  serviceId?: string;
}

export function ReviewList({
  companyId,
  currentUserId,
  filter,
  serviceId,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        let params: any = { companyId };
        if (serviceId) params.serviceId = serviceId;
        if (filter === "recent") params.sortBy = "createdAt.desc";
        else if (filter === "highest") params.sortBy = "stars.desc";
        else if (filter === "lowest") params.sortBy = "stars.asc";

        const res = await api.ratings.searchRatings(params);
        setReviews(res.data);
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.response?.data?.message || "Unable to load reviews",
        });
      } finally {
        setLoading(false);
      }
    };
    if (companyId) fetchReviews();
  }, [companyId, filter, serviceId, toast]);

  const handleDelete = async (ratingId: string) => {
    try {
      await api.ratings.deleteRating(ratingId);
      setReviews(reviews.filter((r) => r.id !== ratingId));
      toast({ title: "Review deleted!" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Unable to delete review",
      });
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div>Loading...</div>
      ) : reviews.length === 0 ? (
        <div>No reviews yet.</div>
      ) : (
        reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{review.userName}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                  <div className="mt-2">
                    <StarRating rating={review.stars} size="sm" />
                  </div>
                  <div className="mt-2">{review.comment}</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Service: {review.serviceName}
                  </div>
                </div>
                {review.userId === currentUserId && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(review.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
