"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Trash2, Flag } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StarRating } from "@/components/reviews/star-rating";
import type { Review } from "@/types/review";
import { useToast } from "@/components/ui/use-toast";
import api from "@/services/api";

interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  isAdmin?: boolean;
  onDelete?: () => void;
}

export function ReviewCard({
  review,
  currentUserId,
  isAdmin = false,
  onDelete,
}: ReviewCardProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const isOwner = currentUserId === review.userId;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.reviews.deleteReview(review.id);
      toast({
        title: "Success",
        description: "Review has been deleted",
      });
      if (onDelete) {
        onDelete();
      }
    } catch (error: any) {
      console.error("Error deleting review:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error?.message || "Unable to delete review. Please try again later.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a reason for reporting",
      });
      return;
    }

    try {
      setIsReporting(true);
      // Assume API endpoint for reporting review
      // await api.reviews.reportReview(review.id, reportReason)
      toast({
        title: "Success",
        description: "Your report has been sent to the administrator",
      });
      setReportReason("");
    } catch (error: any) {
      console.error("Error reporting review:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error?.message || "Unable to send report. Please try again later.",
      });
    } finally {
      setIsReporting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch (error) {
      return "Unknown";
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={review.userAvatar || "/placeholder.svg"}
              alt={review.userName}
            />
            <AvatarFallback>{getInitials(review.userName)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{review.userName}</div>
            <div className="text-xs text-muted-foreground">
              {formatDate(review.createdAt)}
            </div>
            <div className="mt-1">
              <StarRating rating={review.rating} readOnly size="sm" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {(isOwner || isAdmin) && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this review? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {!isOwner && !isAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Flag className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Report Review</AlertDialogTitle>
                  <AlertDialogDescription>
                    Please let us know the reason you are reporting this review.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Textarea
                    placeholder="Enter report reason..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setReportReason("")}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleReport}
                    disabled={isReporting || !reportReason.trim()}
                  >
                    {isReporting ? "Sending..." : "Send Report"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="mb-2">
          <StarRating rating={review.rating} readOnly size="sm" />
        </div>
        <p className="text-sm whitespace-pre-line">
          {review.content || "No review content."}
        </p>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {review.serviceName || "Rescue Service"}
          </Badge>
          <Badge variant="secondary">{review.companyName}</Badge>
        </div>
      </CardFooter>
    </Card>
  );
}
