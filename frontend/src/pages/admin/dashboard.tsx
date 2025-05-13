"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Loader2,
  FileText,
  Wrench,
  DollarSign,
  Users,
  Building2,
  ShieldAlert,
  AlertTriangle,
  MessageCircle,
  Star,
  BarChart,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import api from "@/services/api"
import { KeywordFilterModal } from "@/components/admin/keyword-filter-modal"

// Interfaces cho dữ liệu
interface DashboardStats {
  totalRequests: number
  activeRequests: number
  totalCompanies: number
  totalVehicles: number
  totalUsers: number
  totalRevenue: number
  newUsersThisWeek: number
  revenueThisWeek: number
}

interface RequestStatusCount {
  status: string
  count: number
}

interface ActivityItem {
  id: string
  type: "request" | "invoice" | "user" | "company"
  user?: string
  company?: string
  details: string
  date: string
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [requestStats, setRequestStats] = useState<RequestStatusCount[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState(false)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Kiểm tra quyền admin
      if (user?.role !== "admin") {
        navigate("/login")
        return
      }

      setIsLoading(true)
      try {
        // Gọi API với token admin
        const [usersRes, requestsRes, companiesRes, invoicesRes] = await Promise.all([
          api.users.getUsers(),
          api.rescueRequests.getRequests(),
          api.rescueCompanies.getCompanies(),
          api.invoices.getUserInvoices(),
        ])

        // Tính toán thống kê
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        const newUsers = usersRes.data.filter((user: { createdAt: string }) => new Date(user.createdAt) > oneWeekAgo)

        const newInvoices = invoicesRes.data.filter(
          (inv: { createdAt: string }) => new Date(inv.createdAt) > oneWeekAgo,
        )

        // Set stats
        setStats({
          totalRequests: requestsRes.data.length,
          activeRequests: requestsRes.data.filter((req: { status: string }) => ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(req.status))
            .length,
          totalCompanies: companiesRes.data.length,
          totalVehicles: companiesRes.data.reduce((acc: number, company: { vehicles?: { length: number }[] }) => acc + (company.vehicles?.length || 0), 0),
          totalUsers: usersRes.data.length,
          totalRevenue: invoicesRes.data.reduce((acc: number, inv: { amount?: number }) => acc + (inv.amount || 0), 0),
          newUsersThisWeek: newUsers.length,
          revenueThisWeek: newInvoices.reduce((acc: number, inv: { amount?: number }) => acc + (inv.amount || 0), 0),
        })

        // Tính request stats
        const requestsByStatus = Object.entries(
          requestsRes.data.reduce(
            (acc: Record<string, number>, req: { status: string }) => {
              acc[req.status] = (acc[req.status] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          ),
        ).map(([status, count]) => ({ status, count: count as number }))
        setRequestStats(requestsByStatus)

        // Tạo activity log
        const activities = [
          ...requestsRes.data.map((req: { id: string; status: string; user?: { name: string }; company?: { name: string }; updatedAt?: string; createdAt: string }) => ({
            id: req.id,
            type: "request" as const,
            user: req.user?.name,
            company: req.company?.name,
            details: `Rescue request ${req.status.toLowerCase()}`,
            date: req.updatedAt || req.createdAt,
          })),
          ...invoicesRes.data.map((inv: { id: string; status: string; user?: { name: string }; company?: { name: string }; updatedAt?: string; createdAt: string }) => ({
            id: inv.id,
            type: "invoice" as const,
            user: inv.user?.name,
            company: inv.company?.name,
            details: `Invoice ${inv.status.toLowerCase()}`,
            date: inv.updatedAt || inv.createdAt,
          })),
        ]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10)

        setActivities(activities)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.response?.data?.message || "Could not load dashboard data",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast, user, navigate])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <motion.div className="container mx-auto space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsKeywordModalOpen(true)}>
            <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
            Quản lý từ khóa
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/reports">
              <BarChart className="mr-2 h-4 w-4" />
              Reports
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/settings">
              <ShieldAlert className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats?.totalRequests}</div>
                <Wrench className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground">{stats?.activeRequests} active requests</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Thay thế các card tiếp theo với dữ liệu thật tương tự */}
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rescue Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats?.totalCompanies}</div>
                <Building2 className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-xs text-muted-foreground">{stats?.totalVehicles} registered vehicles</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Registered Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats?.totalUsers}</div>
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground">+{stats?.newUsersThisWeek} new users this week</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">${stats?.totalRevenue.toFixed(2)}</div>
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-xs text-muted-foreground">+${stats?.revenueThisWeek.toFixed(2)} this week</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Request Status Overview */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Card>
          <CardHeader>
            <CardTitle>Request Status Overview</CardTitle>
            <CardDescription>Distribution of rescue requests by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requestStats.map((item) => (
                <div key={item.status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div>{item.status.replace(/_/g, " ")}</div>
                    <div className="font-medium">{item.count}</div>
                  </div>
                  <Progress value={(item.count / (stats?.totalRequests || 1)) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <motion.div
                  key={activity.id}
                  variants={itemVariants}
                  className="flex items-start gap-4 rounded-lg border p-3"
                >
                  <div
                    className={`rounded-full p-2 ${
                      activity.type === "request"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                    }`}
                  >
                    {activity.type === "request" ? <Wrench className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{activity.user || activity.company}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/activity">View All Activity</Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button asChild variant="outline" className="h-24 flex-col">
                <Link to="/admin/services">
                  <ShieldAlert className="mb-2 h-6 w-6" />
                  <span>Manage Services</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col">
                <Link to="/admin/companies">
                  <Building2 className="mb-2 h-6 w-6" />
                  <span>Manage Companies</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col">
                <Link to="/admin/topics">
                  <MessageCircle className="mb-2 h-6 w-6" />
                  <span>Manage Topics</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col">
                <Link to="/admin/reviews">
                  <Star className="mb-2 h-6 w-6" />
                  <span>Manage Reviews</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Keyword Filter Modal */}
      <KeywordFilterModal isOpen={isKeywordModalOpen} onClose={() => setIsKeywordModalOpen(false)} />
    </motion.div>
  )
}
