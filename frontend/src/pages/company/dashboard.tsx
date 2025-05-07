"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Car, Clock, AlertCircle, PlusCircle, Wrench, Truck, DollarSign } from "lucide-react"

// Mock data
const mockRequests = [
  {
    id: "req-001",
    service: "Flat Tire Replacement",
    status: "ACCEPTED_BY_COMPANY",
    date: "2023-05-01T10:30:00",
    user: "John Doe",
    location: "123 Main St, Anytown",
    price: 85.0,
  },
  {
    id: "req-002",
    service: "Battery Jump Start",
    status: "IN_PROGRESS",
    date: "2023-05-05T14:15:00",
    user: "Jane Smith",
    location: "456 Oak Ave, Somewhere",
    price: 65.0,
  },
  {
    id: "req-003",
    service: "Vehicle Towing",
    status: "CREATED",
    date: "2023-05-07T09:00:00",
    user: "Bob Johnson",
    location: "789 Pine Rd, Nowhere",
    price: null,
  },
  {
    id: "req-004",
    service: "Fuel Delivery",
    status: "COMPLETED",
    date: "2023-05-03T11:20:00",
    user: "Alice Brown",
    location: "321 Elm St, Anytown",
    price: 75.0,
  },
]

const mockVehicles = [
  {
    id: "veh-001",
    name: "Tow Truck #1",
    type: "Tow Truck",
    status: "AVAILABLE",
    lastMaintenance: "2023-04-15",
  },
  {
    id: "veh-002",
    name: "Service Van #1",
    type: "Service Van",
    status: "IN_USE",
    lastMaintenance: "2023-04-20",
  },
  {
    id: "veh-003",
    name: "Tow Truck #2",
    type: "Tow Truck",
    status: "MAINTENANCE",
    lastMaintenance: "2023-05-05",
  },
]

export default function CompanyDashboard() {
  const { user } = useAuth()
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

  const [newRequests, setNewRequests] = useState(0)
  const [activeRequests, setActiveRequests] = useState(0)
  const [completedRequests, setCompletedRequests] = useState(0)
  const [availableVehicles, setAvailableVehicles] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)

  useEffect(() => {
    // Calculate dashboard stats
    setNewRequests(mockRequests.filter((req) => req.status === "CREATED").length)

    setActiveRequests(
      mockRequests.filter((req) =>
        [
          "ACCEPTED_BY_COMPANY",
          "RESCUE_VEHICLE_DISPATCHED",
          "RESCUE_VEHICLE_ARRIVED",
          "INSPECTION_DONE",
          "PRICE_UPDATED",
          "IN_PROGRESS",
        ].includes(req.status),
      ).length,
    )

    setCompletedRequests(mockRequests.filter((req) => ["COMPLETED", "INVOICED", "PAID"].includes(req.status)).length)

    setAvailableVehicles(mockVehicles.filter((veh) => veh.status === "AVAILABLE").length)

    // Calculate total revenue from completed requests
    setTotalRevenue(
      mockRequests
        .filter((req) => ["COMPLETED", "INVOICED", "PAID"].includes(req.status))
        .reduce((sum, req) => sum + (req.price || 0), 0),
    )
  }, [])

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
        <h1 className="text-3xl font-bold tracking-tight">Company Dashboard</h1>
        <Button asChild>
          <Link to="/company/services">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Service
          </Link>
        </Button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{newRequests}</div>
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{activeRequests}</div>
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{availableVehicles}</div>
                <Truck className="h-5 w-5 text-green-500" />
              </div>
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
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="active">Active Requests</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 md:grid-cols-2"
          >
            {mockRequests
              .filter((req) => req.status === "CREATED")
              .map((request) => (
                <motion.div key={request.id} variants={itemVariants}>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{request.service}</CardTitle>
                        <Badge variant="outline">{request.status.replace(/_/g, " ")}</Badge>
                      </div>
                      <CardDescription>
                        {new Date(request.date).toLocaleDateString()} • {request.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center text-sm">
                        <Car className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Customer: {request.user}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/company/requests/${request.id}`}>View Details</Link>
                      </Button>
                      <Button size="sm">Accept Request</Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
          </motion.div>

          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/company/requests">View All Requests</Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 md:grid-cols-2"
          >
            {mockRequests
              .filter((req) =>
                [
                  "ACCEPTED_BY_COMPANY",
                  "RESCUE_VEHICLE_DISPATCHED",
                  "RESCUE_VEHICLE_ARRIVED",
                  "INSPECTION_DONE",
                  "PRICE_UPDATED",
                  "IN_PROGRESS",
                ].includes(req.status),
              )
              .map((request) => (
                <motion.div key={request.id} variants={itemVariants}>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{request.service}</CardTitle>
                        <Badge>{request.status.replace(/_/g, " ")}</Badge>
                      </div>
                      <CardDescription>
                        {new Date(request.date).toLocaleDateString()} • {request.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center text-sm">
                        <Car className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Customer: {request.user}</span>
                      </div>
                      {request.price && <div className="mt-2 text-sm font-medium">${request.price.toFixed(2)}</div>}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/company/requests/${request.id}`}>View Details</Link>
                      </Button>
                      <Button size="sm">Update Status</Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
          </motion.div>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 md:grid-cols-2"
          >
            {mockVehicles.map((vehicle) => (
              <motion.div key={vehicle.id} variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{vehicle.name}</CardTitle>
                      <Badge
                        variant={
                          vehicle.status === "AVAILABLE"
                            ? "success"
                            : vehicle.status === "IN_USE"
                              ? "default"
                              : "outline"
                        }
                      >
                        {vehicle.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {vehicle.type} • Last maintenance: {vehicle.lastMaintenance}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link to={`/company/vehicles/${vehicle.id}`}>View Vehicle Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex justify-center">
            <Button asChild variant="outline">
              <Link to="/company/vehicles">View All Vehicles</Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button asChild variant="outline" className="h-24 flex-col">
                <Link to="/company/services">
                  <PlusCircle className="mb-2 h-6 w-6" />
                  <span>Add New Service</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col">
                <Link to="/company/vehicles">
                  <Truck className="mb-2 h-6 w-6" />
                  <span>Manage Vehicles</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-24 flex-col">
                <Link to="/company/requests">
                  <Wrench className="mb-2 h-6 w-6" />
                  <span>View All Requests</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
