"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { MapView } from "@/components/map/map-view"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { RefreshCw, Car, MapPin, AlertTriangle, Clock } from "lucide-react"

// Mock data for vehicles and requests
const mockVehicles = [
  {
    id: "veh-001",
    name: "Tow Truck #1",
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
    },
    type: "Tow Truck",
    status: "IN_USE",
    location: {
      coordinates: [40.72, -74.01] as [number, number],
      lastUpdated: "2023-06-15T14:45:00Z",
    },
    currentRequest: "req-001",
  },
  {
    id: "veh-002",
    name: "Service Van #1",
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
    },
    type: "Service Van",
    status: "AVAILABLE",
    location: {
      coordinates: [40.73, -73.995] as [number, number],
      lastUpdated: "2023-06-15T14:40:00Z",
    },
    currentRequest: null,
  },
  {
    id: "veh-003",
    name: "Tow Truck #2",
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
    },
    type: "Tow Truck",
    status: "MAINTENANCE",
    location: {
      coordinates: [40.715, -74.02] as [number, number],
      lastUpdated: "2023-06-15T13:30:00Z",
    },
    currentRequest: null,
  },
  {
    id: "veh-004",
    name: "Flatbed Truck #1",
    company: {
      id: "comp-002",
      name: "QuickHelp Auto",
    },
    type: "Flatbed Truck",
    status: "IN_USE",
    location: {
      coordinates: [40.705, -73.99] as [number, number],
      lastUpdated: "2023-06-15T14:30:00Z",
    },
    currentRequest: "req-002",
  },
  {
    id: "veh-005",
    name: "Service Van #2",
    company: {
      id: "comp-002",
      name: "QuickHelp Auto",
    },
    type: "Service Van",
    status: "AVAILABLE",
    location: {
      coordinates: [40.725, -73.98] as [number, number],
      lastUpdated: "2023-06-15T14:20:00Z",
    },
    currentRequest: null,
  },
]

const mockRequests = [
  {
    id: "req-001",
    customerName: "Michael Johnson",
    serviceType: "Flat Tire Replacement",
    location: {
      address: "123 Main St, New York, NY 10001",
      coordinates: [40.7128, -74.006] as [number, number],
    },
    status: "RESCUE_VEHICLE_DISPATCHED",
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
    },
    assignedVehicle: "veh-001",
    createdAt: "2023-06-15T14:30:00Z",
  },
  {
    id: "req-002",
    customerName: "Jennifer Wilson",
    serviceType: "Vehicle Towing",
    location: {
      address: "456 Park Ave, New York, NY 10022",
      coordinates: [40.7, -73.985] as [number, number],
    },
    status: "IN_PROGRESS",
    company: {
      id: "comp-002",
      name: "QuickHelp Auto",
    },
    assignedVehicle: "veh-004",
    createdAt: "2023-06-15T14:20:00Z",
  },
  {
    id: "req-003",
    customerName: "Robert Thompson",
    serviceType: "Battery Jump Start",
    location: {
      address: "789 Broadway, New York, NY 10003",
      coordinates: [40.735, -73.99] as [number, number],
    },
    status: "CREATED",
    company: null,
    assignedVehicle: null,
    createdAt: "2023-06-15T14:50:00Z",
  },
  {
    id: "req-004",
    customerName: "Lisa Anderson",
    serviceType: "Lockout Service",
    location: {
      address: "321 5th Ave, New York, NY 10016",
      coordinates: [40.745, -73.985] as [number, number],
    },
    status: "CREATED",
    company: null,
    assignedVehicle: null,
    createdAt: "2023-06-15T14:55:00Z",
  },
]

export default function MapOverview() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [vehicles, setVehicles] = useState(mockVehicles)
  const [requests, setRequests] = useState(mockRequests)
  const [companyFilter, setCompanyFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.006])
  const [mapZoom, setMapZoom] = useState(12)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  const handleCompanyFilterChange = (value: string) => {
    setCompanyFilter(value === "ALL" ? null : value)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "ALL" ? null : value)
  }

  const handleRefresh = () => {
    // In a real app, this would fetch fresh data from the server
    toast({
      title: "Data refreshed",
      description: "Map data has been updated.",
    })
    setLastRefreshed(new Date())
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
  const mapMarkers = [
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
        <div className="text-sm text-muted-foreground">Last updated: {lastRefreshed.toLocaleTimeString()}</div>
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

      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
        </div>
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
