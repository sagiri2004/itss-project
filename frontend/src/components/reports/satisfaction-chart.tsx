"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import api from "@/services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SatisfactionData {
  period: string;
  averageRating: number;
  totalReviews: number;
}

interface SatisfactionChartProps {
  title?: string;
  timeRange?: "week" | "month" | "year" | "all";
}

export function SatisfactionChart({
  title = "Customer Satisfaction",
  timeRange = "month",
}: SatisfactionChartProps) {
  const { toast } = useToast();
  const [data, setData] = useState<SatisfactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  useEffect(() => {
    fetchData(selectedTimeRange);
  }, [selectedTimeRange]);

  const fetchData = async (range: string) => {
    try {
      setLoading(true);
      const response = await api.admin.getTopRatedServices({
        timeRange: range,
      });
      // Ensure setData always receives an array
      setData(Array.isArray(response.data.byTime) ? response.data.byTime : []);
    } catch (error) {
      console.error("Error fetching satisfaction stats:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load statistics data. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">No data available</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" angle={-45} textAnchor="end" height={60} />
          <YAxis domain={[0, 5]} />
          <Tooltip
            formatter={(value, name) => [
              name === "averageRating"
                ? `${Number(value).toFixed(2)}/5`
                : value,
              name === "averageRating" ? "Average Rating" : "Number of Reviews",
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="averageRating"
            name="Average Rating"
            stroke="#3b82f6"
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="totalReviews"
            name="Number of Reviews"
            stroke="#f59e0b"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Select
          value={selectedTimeRange}
          onValueChange={(value) =>
            setSelectedTimeRange(value as "week" | "month" | "year" | "all")
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
            <SelectItem value="year">This year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}
