"use client";

import { RatingStars } from "@/components/rating-stars";
import { formatDistanceToNow } from "date-fns";

interface Rating {
  id: string;
  stars: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface RatingListProps {
  ratings: Rating[];
}

export function RatingList({ ratings }: RatingListProps) {
  return (
    <div className="space-y-6">
      {ratings.map((rating) => (
        <div key={rating.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">{rating.user.name}</div>
              <RatingStars rating={rating.stars} size="sm" />
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(rating.createdAt), {
                addSuffix: true,
              })}
            </div>
          </div>
          {rating.comment && (
            <p className="text-sm text-muted-foreground">{rating.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
} 