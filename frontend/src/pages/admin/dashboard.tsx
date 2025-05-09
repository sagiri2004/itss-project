"use client"
import { Link } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileText, PlusCircle, Wrench, Truck, DollarSign, Users, Building2, ShieldAlert } from 'lucide-react'

// Replace the mock data imports
import { 
  mockAdminStats, 
  mockRequestsByStatus, 
  mockRecentActivity 
} from "@/data/mock-data"

export default function AdminDashboard() {
  const { user } = useAuth()
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
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

  return (
    <motion.div style={{ opacity, scale }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/reports">
              <FileText className="mr-2 h-4 w-4" />
              Reports
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/settings">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Service
            </Link>
          </Button>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{mockAdminStats.totalRequests}</div>
                <Wrench className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground">{mockAdminStats.activeRequests} active requests</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rescue Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{mockAdminStats.totalCompanies}</div>
                <Building2 className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-xs text-muted-foreground">{mockAdminStats.totalVehicles} registered vehicles</p>
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
                <div className="text-2xl font-bold">{mockAdminStats.totalUsers}</div>
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground">+24 new users this week</p>
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
                <div className="text-2xl font-bold">${mockAdminStats.totalRevenue.toFixed(2)}</div>
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-xs text-muted-foreground">+$1,245.50 this week</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Request Status Overview</CardTitle>
              <CardDescription>Distribution of rescue requests by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRequestsByStatus.map((item) => (
                  <div key={item.status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div>{item.status.replace(/_/g, " ")}</div>
                      <div className="font-medium">{item.count}</div>
                    </div>
                    <Progress value={(item.count / mockAdminStats.totalRequests) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentActivity.map((activity) => (
                <motion.div
                  key={activity.id}
                  variants={itemVariants}
                  className="flex items-start gap-4 rounded-lg border p-3"
                >
                  <div
                    className={`rounded-full p-2 ${
                      activity.type.includes("request")
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                        : activity.type.includes("vehicle")
                          ? "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"
                          : activity.type.includes("invoice")
                            ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                            : "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
                    }`}
                  >
                    {activity.type.includes("request") ? (
                      <Wrench className="h-5 w-5" />
                    ) : activity.type.includes("vehicle") ? (
                      <Truck className="h-5 w-5" />
                    ) : activity.type.includes("invoice") ? (
                      <FileText className="h-5 w-5" />
                    ) : (
                      <Building2 className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{activity.user || activity.company}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
                <Link to="/admin/vehicles">
                  <Truck className="mb-2 h-6 w-6" />
                  <span>Manage Vehicles</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col">
                <Link to="/admin/users">
                  <Users className="mb-2 h-6 w-6" />
                  <span>Manage Users</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
