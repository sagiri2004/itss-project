"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import api from "@/services/api"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ServiceUsageData {
  name: string
  value: number
}

interface ServiceUsageChartProps {
  title?: string
  timeRange?: "week" | "month" | "year" | "all"
}

export function ServiceUsageChart({ title = "Tần suất sử dụng dịch vụ", timeRange = "month" }: ServiceUsageChartProps) {
  const { toast } = useToast()
  const [data, setData] = useState<ServiceUsageData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)

  useEffect(() => {
    fetchData(selectedTimeRange)
  }, [selectedTimeRange])

  const fetchData = async (range: string) => {
    try {
      setLoading(true)
      const response = await api.admin.getServiceUsageStats({ timeRange: range })
      setData(Array.isArray(response.data.byService) ? response.data.byService : [])
    } catch (error) {
      console.error("Error fetching service usage stats:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.",
      })
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#059669", "#f472b6", "#6366f1"]

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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} yêu cầu`, "Số lượng"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Select value={selectedTimeRange} onValueChange={(value) => setSelectedTimeRange(value as "all" | "week" | "month" | "year")}>
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
