"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import api from "@/services/api"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface RequestStatsData {
  period: string
  count: number
  status?: string
}

interface RequestChartProps {
  title?: string
  timeRange?: "day" | "week" | "month" | "year"
  showStatus?: boolean
}

export function RequestChart({
  title = "Số lượng yêu cầu cứu hộ",
  timeRange = "month",
  showStatus = false,
}: RequestChartProps) {
  const { toast } = useToast()
  const [data, setData] = useState<RequestStatsData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)

  useEffect(() => {
    fetchData(selectedTimeRange)
  }, [selectedTimeRange])

  const fetchData = async (range: string) => {
    try {
      setLoading(true)
      const response = await api.reports.getRequestStats({ timeRange: range, groupByStatus: showStatus })
      setData(response.data)
    } catch (error) {
      console.error("Error fetching request stats:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.",
      })
    } finally {
      setLoading(false)
    }
  }

  const getColors = () => {
    if (showStatus) {
      return {
        CREATED: "#f59e0b",
        ACCEPTED_BY_COMPANY: "#3b82f6",
        IN_PROGRESS: "#8b5cf6",
        COMPLETED: "#10b981",
        CANCELLED: "#ef4444",
        PAID: "#059669",
      }
    }
    return { count: "#3b82f6" }
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
        <BarChart
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
          <YAxis />
          <Tooltip />
          <Legend />
          {showStatus ? (
            Object.keys(getColors()).map((status) => (
              <Bar
                key={status}
                dataKey={(item: RequestStatsData) => (item.status === status ? item.count : 0)}
                name={status.replace(/_/g, " ")}
                fill={getColors()[status as keyof ReturnType<typeof getColors>]}
              />
            ))
          ) : (
            <Bar dataKey="count" name="Số lượng" fill={getColors().count} />
          )}
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Select value={selectedTimeRange} onValueChange={(value) => setSelectedTimeRange(value as "day" | "week" | "month" | "year")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn khoảng thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Theo ngày</SelectItem>
            <SelectItem value="week">Theo tuần</SelectItem>
            <SelectItem value="month">Theo tháng</SelectItem>
            <SelectItem value="year">Theo năm</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  )
}
