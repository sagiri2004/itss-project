"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RatingStars } from "@/components/rating-stars";

interface RatingStatsProps {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

export function RatingStats({ averageRating, totalRatings, ratingDistribution }: RatingStatsProps) {
  const maxRating = Math.max(...Object.values(ratingDistribution));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
          <div className="flex items-center gap-2">
            <RatingStars rating={averageRating} size="sm" />
            <span className="text-sm text-muted-foreground">
              {totalRatings} {totalRatings === 1 ? "rating" : "ratings"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center gap-2">
            <span className="w-8 text-sm text-muted-foreground">{rating} stars</span>
            <Progress
              value={(ratingDistribution[rating] / maxRating) * 100}
              className="h-2"
            />
            <span className="w-12 text-sm text-muted-foreground">
              {ratingDistribution[rating] || 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 