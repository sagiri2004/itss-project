"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { useNavigate } from "react-router-dom"
import { MapView } from "@/components/map/map-view"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { RefreshCw, Car, MapPin, AlertTriangle, Clock, Loader2 } from "lucide-react"
import api from "@/services/api"

// Interfaces
interface Vehicle {
  id: string
  name: string
  company: {
    id: string
    name: string
  }
  location: {
    coordinates: [number, number]
    lastUpdated: string
  }
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE"
  type: string
}

interface Request {
  id: string
  serviceType: string
  customerName: string
  status: string
  location: {
    coordinates: [number, number]
    address: string
  }
  company?: {
    id: string
    name: string
  }
  createdAt: string
}

interface MapMarker {
  id: string
  position: [number, number]
  type: "vehicle" | "request"
  label: string
  status?: string
}

export default function MapOverview() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [companyFilter, setCompanyFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.0285, 105.8542]) // Default to Hanoi
  const [mapZoom, setMapZoom] = useState(12)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check admin role
    if (user?.role !== 'admin') {
      navigate('/login')
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Admin can access all data
        const [vehiclesRes, requestsRes] = await Promise.all([
          api.admin.getVehicles(),
          api.admin.getRequests()
        ])

        // Map vehicles từ RescueVehicleResponse
        const mappedVehicles: Vehicle[] = vehiclesRes.data.map((v: any) => ({
          id: v.id,
          name: v.name,
          type: v.model || v.type || "",
          company: {
            id: v.companyId,
            name: v.companyName
          },
          location: {
            coordinates: [v.currentLatitude, v.currentLongitude],
            lastUpdated: v.updatedAt || v.lastMaintenanceDate || ""
          },
          status: v.status,
        }))

        // Map requests (giữ nguyên nếu backend không đổi)
        const mappedRequests: Request[] = requestsRes.data.map((r: any) => ({
          id: r.id,
          serviceType: r.serviceType || r.service,
          customerName: r.customerName || r.userName,
          status: r.status,
          location: {
            coordinates: r.location?.coordinates || [r.latitude, r.longitude],
            address: r.location?.address || r.address
          },
          company: r.company ? {
            id: r.company.id,
            name: r.company.name
          } : undefined,
          createdAt: r.createdAt || r.date
        }))

        setVehicles(mappedVehicles)
        setRequests(mappedRequests)
        setLastRefreshed(new Date())
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading map data",
          description: error.response?.data?.message || "Could not load map data"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      handleRefresh()
    }, 30000)

    return () => clearInterval(interval)
  }, [toast, user, navigate])

  const handleCompanyFilterChange = (value: string) => {
    setCompanyFilter(value === "ALL" ? null : value)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "ALL" ? null : value)
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const [vehiclesRes, requestsRes] = await Promise.all([
        api.admin.getVehicles(),
        api.admin.getRequests()
      ])
      // Map lại dữ liệu như fetchData
      const mappedVehicles: Vehicle[] = vehiclesRes.data.map((v: any) => ({
        id: v.id,
        name: v.name,
        type: v.model || v.type || "",
        company: {
          id: v.companyId,
          name: v.companyName
        },
        location: {
          coordinates: [v.currentLatitude, v.currentLongitude],
          lastUpdated: v.updatedAt || v.lastMaintenanceDate || ""
        },
        status: v.status,
      }))
      const mappedRequests: Request[] = requestsRes.data.map((r: any) => ({
        id: r.id,
        serviceType: r.serviceType || r.service,
        customerName: r.customerName || r.userName,
        status: r.status,
        location: {
          coordinates: r.location?.coordinates || [r.latitude, r.longitude],
          address: r.location?.address || r.address
        },
        company: r.company ? {
          id: r.company.id,
          name: r.company.name
        } : undefined,
        createdAt: r.createdAt || r.date
      }))
      setVehicles(mappedVehicles)
      setRequests(mappedRequests)
      toast({
        title: "Data refreshed",
        description: "Map data has been updated."
      })
      setLastRefreshed(new Date())
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error refreshing data",
        description: error.response?.data?.message || "Could not refresh map data"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get unique companies for filter
  const companies = Array.from(
    new Set([
      ...vehicles.map((vehicle) => vehicle.company.id),
      ...requests.filter((req) => req.company).map((req) => req.company!.id),
    ]),
  ).map((companyId) => {
    const vehicle = vehicles.find((v) => v.company.id === companyId)
    const request = requests.find((r) => r.company && r.company.id === companyId)
    return {
      id: companyId,
      name: vehicle?.company.name || request?.company?.name || "",
    }
  })

  // Filter vehicles and requests
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesCompany = !companyFilter || vehicle.company.id === companyFilter
    const matchesStatus = !statusFilter || vehicle.status === statusFilter
    return matchesCompany && matchesStatus
  })

  const filteredRequests = requests.filter((request) => {
    const matchesCompany = !companyFilter || (request.company && request.company.id === companyFilter)
    const matchesStatus = !statusFilter || request.status === statusFilter
    return matchesCompany && matchesStatus
  })

  // Prepare map markers
  const mapMarkers: MapMarker[] = [
    ...filteredVehicles.map((vehicle) => ({
      id: vehicle.id,
      position: vehicle.location.coordinates,
      type: "vehicle" as const,
      label: `${vehicle.name} (${vehicle.company.name})`,
      status: vehicle.status,
    })),
    ...filteredRequests.map((request) => ({
      id: request.id,
      position: request.location.coordinates,
      type: "request" as const,
      label: `${request.serviceType} - ${request.customerName}`,
      status: request.status,
    })),
  ]

  // Statistics
  const stats = {
    totalVehicles: vehicles.length,
    availableVehicles: vehicles.filter((v) => v.status === "AVAILABLE").length,
    inUseVehicles: vehicles.filter((v) => v.status === "IN_USE").length,
    maintenanceVehicles: vehicles.filter((v) => v.status === "MAINTENANCE").length,
    totalRequests: requests.length,
    pendingRequests: requests.filter((r) => r.status === "CREATED").length,
    inProgressRequests: requests.filter((r) => ["RESCUE_VEHICLE_DISPATCHED", "IN_PROGRESS"].includes(r.status)).length,
    completedRequests: requests.filter((r) => r.status === "COMPLETED").length,
  }

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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Map Overview</h1>
        <Button onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Last updated: {lastRefreshed.toLocaleTimeString()}
        </div>
        <div className="flex gap-2">
          <Select onValueChange={handleCompanyFilterChange} defaultValue="ALL">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Companies</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={handleStatusFilterChange} defaultValue="ALL">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="IN_USE">In Use</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="CREATED">Pending Requests</SelectItem>
              <SelectItem value="RESCUE_VEHICLE_DISPATCHED">Dispatched</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalVehicles}</div>
            <div className="mt-1 flex items-center text-sm text-muted-foreground">
              <Car className="mr-1 h-4 w-4" />
              <span>{stats.availableVehicles} available</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.inUseVehicles}</div>
            <div className="mt-1 flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-4 w-4" />
              <span>{stats.maintenanceVehicles} in maintenance</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalRequests}</div>
            <div className="mt-1 flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-1 h-4 w-4" />
              <span>{stats.completedRequests} completed</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingRequests}</div>
            <div className="mt-1 flex items-center text-sm text-muted-foreground">
              <AlertTriangle className="mr-1 h-4 w-4" />
              <span>{stats.inProgressRequests} in progress</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <MapView markers={mapMarkers} center={mapCenter} zoom={mapZoom} height="600px" />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="vehicles">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Status</CardTitle>
                <CardDescription>Overview of all service vehicles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-start space-x-3 rounded-md border p-3"
                      onClick={() => {
                        setMapCenter(vehicle.location.coordinates)
                        setMapZoom(14)
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{vehicle.name}</div>
                          <Badge
                            variant={
                              vehicle.status === "AVAILABLE"
                                ? "success"
                                : vehicle.status === "IN_USE"
                                  ? "default"
                                  : "outline"
                            }
                          >
                            {vehicle.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{vehicle.company.name}</div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Last update: {new Date(vehicle.location.lastUpdated).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Request Status</CardTitle>
                <CardDescription>Overview of all service requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-start space-x-3 rounded-md border p-3"
                      onClick={() => {
                        setMapCenter(request.location.coordinates)
                        setMapZoom(14)
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{request.serviceType}</div>
                          <Badge
                            variant={
                              request.status === "COMPLETED"
                                ? "success"
                                : request.status === "CREATED"
                                  ? "destructive"
                                  : "default"
                            }
                          >
                            {request.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <div className="text-sm">{request.customerName}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{request.location.address}</div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {request.company ? `Assigned to: ${request.company.name}` : "Unassigned"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
