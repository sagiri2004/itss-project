"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { MapView } from "@/components/map/map-view"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Search, Car, MapPin, Clock, User, Phone, Calendar, RefreshCw } from "lucide-react"
import api from "@/services/api"

interface Vehicle {
  id: string
  name: string
  type?: string
  licensePlate?: string
  status: string
  latitude: number
  longitude: number
  driver?: { name?: string; phone?: string }
  lastUpdated?: string
  currentRequest?: {
    id: string
    location: { address: string; coordinates: [number, number] }
    serviceType: string
    customerName: string
    status: string
  }
}

interface Request {
  id: string
  status: string
  latitude: number
  longitude: number
  address?: string
  createdAt?: string
  serviceType?: string
  customerName?: string
}

export default function VehicleTracking() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [pendingRequests, setPendingRequests] = useState<Request[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.0285, 105.8542])
  const [mapZoom, setMapZoom] = useState(12)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)

  // Fetch vehicles and requests from API
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [vehicleRes, requestRes] = await Promise.all([
        api.rescueVehicles.getVehicles(),
        api.rescueRequests.getRequests(),
      ])
      setVehicles(
        (vehicleRes.data || []).map((v: any) => ({
          id: v.id,
          name: v.name,
          type: v.type,
          licensePlate: v.licensePlate,
          status: v.status,
          latitude: v.latitude,
          longitude: v.longitude,
          driver: v.driver ? { name: v.driver.name, phone: v.driver.phone } : {},
          lastUpdated: v.lastUpdated,
          currentRequest: v.currentRequest
            ? {
                id: v.currentRequest.id,
                location: {
                  address: v.currentRequest.location?.address || "",
                  coordinates: v.currentRequest.location?.coordinates || [v.currentRequest.latitude, v.currentRequest.longitude],
                },
                serviceType: v.currentRequest.serviceType || "",
                customerName: v.currentRequest.customerName || "",
                status: v.currentRequest.status || "",
              }
            : undefined,
        }))
      )
      setPendingRequests(
        (requestRes.data || [])
          .filter((r: any) => r.status === "CREATED" || r.status === "ACCEPTED_BY_COMPANY")
          .map((r: any) => ({
            id: r.id,
            status: r.status,
            latitude: r.latitude,
            longitude: r.longitude,
            address: r.address || "",
            createdAt: r.createdAt,
            serviceType: r.serviceName || "",
            customerName: r.user?.name || "",
          }))
      )
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to load vehicle or request data",
      })
    } finally {
      setIsLoading(false)
      setLastRefreshed(new Date())
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)
  const handleStatusFilterChange = (value: string) => setStatusFilter(value === "ALL" ? null : value)
  const handleMarkerClick = (id: string) => {
    setSelectedVehicle(id)
    const vehicle = vehicles.find((v) => v.id === id)
    if (vehicle) {
      setMapCenter([vehicle.latitude, vehicle.longitude])
      setMapZoom(14)
    }
  }
  const handleRefresh = () => fetchData()

  // Filter vehicles
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || vehicle.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Prepare map markers
  const mapMarkers = [
    ...vehicles
      .filter((v) => v.latitude && v.longitude)
      .map((vehicle) => ({
        id: vehicle.id,
        position: [vehicle.latitude, vehicle.longitude] as [number, number],
        type: "vehicle" as const,
        label: vehicle.name,
        status: vehicle.status,
      })),
    ...pendingRequests
      .filter((r) => r.latitude && r.longitude)
      .map((request) => ({
        id: request.id,
        position: [request.latitude, request.longitude] as [number, number],
        type: "request" as const,
        label: `${request.serviceType || "Request"} - ${request.customerName || ""}`,
        status: request.status,
      })),
  ]

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
        <h1 className="text-3xl font-bold tracking-tight">Vehicle Tracking</h1>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Last updated: {lastRefreshed.toLocaleTimeString()}</div>
        <div className="flex gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search vehicles..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Select onValueChange={handleStatusFilterChange} defaultValue="ALL">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="IN_USE">In Use</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <MapView
            markers={mapMarkers}
            center={mapCenter}
            zoom={mapZoom}
            onMarkerClick={handleMarkerClick}
            height="600px"
          />
        </div>

        <div className="space-y-6">
          <Tabs defaultValue="vehicles">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
              <TabsTrigger value="requests">Pending Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="vehicles" className="space-y-4 mt-4">
              {isLoading ? (
                <div className="text-center py-6 text-muted-foreground">Loading...</div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No vehicles found. Try adjusting your search criteria.
                </div>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <Card
                    key={vehicle.id}
                    className={`cursor-pointer transition-all ${selectedVehicle === vehicle.id ? "ring-2 ring-primary" : ""}`}
                    onClick={() => handleMarkerClick(vehicle.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{vehicle.name}</CardTitle>
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
                      <CardDescription>
                        {vehicle.type} - {vehicle.licensePlate}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{vehicle.driver?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{vehicle.driver?.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Last update:{" "}
                          {vehicle.lastUpdated
                            ? new Date(vehicle.lastUpdated).toLocaleTimeString()
                            : "Unknown"}
                        </span>
                      </div>
                      {vehicle.currentRequest && (
                        <div className="mt-3 rounded-md border p-3 bg-muted/50">
                          <div className="font-medium">Current Assignment</div>
                          <div className="flex items-center gap-2 mt-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{vehicle.currentRequest.location.address}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{vehicle.currentRequest.serviceType}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{vehicle.currentRequest.customerName}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="requests" className="space-y-4 mt-4">
              {isLoading ? (
                <div className="text-center py-6 text-muted-foreground">Loading...</div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No pending requests at this time.</div>
              ) : (
                pendingRequests.map((request) => (
                  <Card
                    key={request.id}
                    className="cursor-pointer transition-all"
                    onClick={() => {
                      setMapCenter([request.latitude, request.longitude])
                      setMapZoom(14)
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{request.serviceType}</CardTitle>
                        <Badge variant="destructive">Pending</Badge>
                      </div>
                      <CardDescription>{request.customerName}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{request.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Requested:{" "}
                          {request.createdAt
                            ? new Date(request.createdAt).toLocaleTimeString()
                            : "Unknown"}
                        </span>
                      </div>
                      <div className="flex justify-end mt-2">
                        <Button size="sm">Assign Vehicle</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </motion.div>
  )
}
