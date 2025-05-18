import { useEffect, useState } from "react";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/reviews/star-rating";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserReviewManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const [userRatings, setUserRatings] = useState<any[]>([]);
  const [unreviewedRequests, setUnreviewedRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRequest, setModalRequest] = useState<any>(null);
  const [modalRating, setModalRating] = useState<any>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoadingRequests(true);
        setLoadingRatings(true);

        const [reqRes, ratingRes] = await Promise.all([
          api.rescueRequests.getRequests(),
          api.ratings.getUserRatings(user.id),
        ]);

        setUserRequests(reqRes.data);
        setUserRatings(ratingRes.data);

        // Filter paid requests and exclude those already reviewed
        const paidRequests = reqRes.data.filter(
          (req: any) => req.status === "PAID"
        );
        const reviewedServiceIds = new Set(
          userRatings.map((rating: any) => rating.serviceId)
        );
        const unreviewed = paidRequests.filter(
          (req: any) => !reviewedServiceIds.has(req.serviceId)
        );
        setUnreviewedRequests(unreviewed);
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.response?.data?.message || "Could not load data",
        });
      } finally {
        setLoadingRequests(false);
        setLoadingRatings(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const handleDelete = async (ratingId: string) => {
    try {
      await api.ratings.deleteRating(ratingId);
      setUserRatings(userRatings.filter((r) => r.id !== ratingId));
      toast({ title: "Review deleted!" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Could not delete review",
      });
    }
  };

  const openReviewModal = (request: any, rating?: any) => {
    setModalRequest(request);
    setModalRating(rating || null);
    setStars(rating?.stars || 5);
    setComment(rating?.comment || "");
    setModalOpen(true);
  };

  const closeReviewModal = () => {
    setModalOpen(false);
    setModalRequest(null);
    setModalRating(null);
    setStars(5);
    setComment("");
  };

  const handleSubmitReview = async () => {
    if (!modalRequest) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot create review. Please select a request.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.ratings.createRating({
        companyId: modalRequest.companyId,
        serviceId: modalRequest.serviceId,
        stars,
        comment,
      });
      toast({ title: modalRating ? "Review updated!" : "Review submitted!" });
      const [ratingRes] = await Promise.all([
        api.ratings.getUserRatings(user!.id),
      ]);
      setUserRatings(ratingRes.data);
      // Re-filter unreviewed requests
      const paidRequests = userRequests.filter(
        (req: any) => req.status === "PAID"
      );
      const reviewedServiceIds = new Set(
        ratingRes.data.map((rating: any) => rating.serviceId)
      );
      const unreviewed = paidRequests.filter(
        (req: any) => !reviewedServiceIds.has(req.serviceId)
      );
      setUnreviewedRequests(unreviewed);
      closeReviewModal();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Could not submit review",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Invalid date"
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Service Review Manager</h1>
      <Tabs defaultValue="unreviewed-services" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="unreviewed-services">
            Unreviewed Services
          </TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed Services</TabsTrigger>
        </TabsList>

        <TabsContent value="unreviewed-services">
          <Card>
            <CardHeader>
              <CardTitle>Unreviewed Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This is a list of paid requests that have not been reviewed yet.
              </p>
              {loadingRequests ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : unreviewedRequests.length === 0 ? (
                <div className="text-muted-foreground">
                  All services have been reviewed!
                </div>
              ) : (
                unreviewedRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex justify-between items-center border-b py-3 last:border-b-0"
                  >
                    <div className="space-y-1">
                      <div>
                        <span className="font-medium">Service:</span>{" "}
                        {request.serviceName}
                      </div>
                      <div>
                        <span className="font-medium">Company:</span>{" "}
                        {request.companyName}
                      </div>
                      <div>
                        <span className="font-medium">Request Date:</span>{" "}
                        {formatDate(request.createdAt)}
                      </div>
                      <div>
                        <span className="font-medium">Notes:</span>{" "}
                        {request.notes || "None"}
                      </div>
                    </div>
                    <Button onClick={() => openReviewModal(request)}>
                      Review
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviewed">
          <Card>
            <CardHeader>
              <CardTitle>Your Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRatings ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : userRatings.length === 0 ? (
                <div className="text-muted-foreground">No reviews yet.</div>
              ) : (
                userRatings.map((rating) => (
                  <div
                    key={rating.id}
                    className="flex justify-between items-center border-b py-3 last:border-b-0"
                  >
                    <div className="space-y-1">
                      <div>
                        <span className="font-medium">Service:</span>{" "}
                        {rating.serviceName}
                      </div>
                      <div>
                        <span className="font-medium">Company:</span>{" "}
                        {rating.companyName}
                      </div>
                      <div>
                        <span className="font-medium">Review Date:</span>{" "}
                        {formatDate(rating.createdAt)}
                      </div>
                      <div>
                        <span className="font-medium">Rating:</span>{" "}
                        {rating.stars} stars - {rating.comment}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => openReviewModal(null, rating)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(rating.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalRating ? "Edit Review" : "Review Service"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <span className="font-medium">Service:</span>{" "}
              {modalRequest?.serviceName || modalRating?.serviceName}
            </div>
            <div>
              <span className="font-medium">Company:</span>{" "}
              {modalRequest?.companyName || modalRating?.companyName}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Stars:</span>
              <StarRating rating={stars} onChange={setStars} size="lg" />
            </div>
            <div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your comments..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeReviewModal}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={
                submitting || !comment.trim() || (!modalRequest && !modalRating)
              }
            >
              {submitting
                ? "Submitting..."
                : modalRating
                ? "Update"
                : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
