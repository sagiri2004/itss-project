"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import api from "@/services/api"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface SatisfactionData {
  period: string
  averageRating: number
  totalReviews: number
}

interface SatisfactionChartProps {
  title?: string
  timeRange?: "week" | "month" | "year" | "all"
}

export function SatisfactionChart({
  title = "Mức độ hài lòng của khách hàng",
  timeRange = "month",
}: SatisfactionChartProps) {
  const { toast } = useToast()
  const [data, setData] = useState<SatisfactionData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)

  useEffect(() => {
    fetchData(selectedTimeRange)
  }, [selectedTimeRange])

  const fetchData = async (range: string) => {
    try {
      setLoading(true)
      const response = await api.reports.getSatisfactionStats({ timeRange: range })
      setData(response.data)
    } catch (error) {
      console.error("Error fetching satisfaction stats:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (data.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Không có dữ liệu</p>
        </div>
      )
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
              name === "averageRating" ? `${Number(value).toFixed(2)}/5` : value,
              name === "averageRating" ? "Đánh giá trung bình" : "Số lượng đánh giá",
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="averageRating"
            name="Đánh giá trung bình"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
          <Line type="monotone" dataKey="totalReviews" name="Số lượng đánh giá" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Select value={selectedTimeRange} onValueChange={(value) => setSelectedTimeRange(value as "week" | "month" | "year" | "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn khoảng thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Tuần này</SelectItem>
            <SelectItem value="month">Tháng này</SelectItem>
            <SelectItem value="year">Năm nay</SelectItem>
            <SelectItem value="all">Tất cả</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  )
}
