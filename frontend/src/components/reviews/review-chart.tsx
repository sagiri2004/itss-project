"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingStars } from "@/components/rating-stars";

interface RatingDistribution {
  [key: number]: number;
}

interface RatingSummary {
  companyId: string;
  companyName: string;
  averageRating: number;
  totalRatings: number;
  starDistribution: RatingDistribution;
}

interface ReviewChartProps {
  data: RatingSummary;
  title?: string;
}

export function ReviewChart({ data, title = "Rating Distribution" }: ReviewChartProps) {
  const chartData = Object.entries(data.starDistribution).map(([stars, count]) => ({
    stars: `${stars} stars`,
    count,
    percentage: (count / data.totalRatings) * 100
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-2xl font-bold">{data.averageRating.toFixed(1)}</div>
              <div className="flex items-center gap-2">
                <RatingStars rating={data.averageRating} size="sm" />
                <span className="text-sm text-muted-foreground">
                  {data.totalRatings} {data.totalRatings === 1 ? "rating" : "ratings"}
                </span>
              </div>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stars" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value} ratings`, "Count"]}
                />
                <Bar 
                  dataKey="count" 
                  fill="#fbbf24"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 