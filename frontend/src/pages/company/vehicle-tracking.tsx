"use client"

import type React from "react"

import { useState } from "react"
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

// Replace the mock data imports
import { mockTrackingVehicles, mockPendingTrackingRequests } from "@/data/mock-data"

export default function VehicleTracking() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [vehicles, setVehicles] = useState(mockTrackingVehicles)
  const [pendingRequests, setPendingRequests] = useState(mockPendingTrackingRequests)
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.006])
  const [mapZoom, setMapZoom] = useState(12)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "ALL" ? null : value)
  }

  const handleMarkerClick = (id: string) => {
    setSelectedVehicle(id)
    const vehicle = vehicles.find((v) => v.id === id)
    if (vehicle) {
      setMapCenter(vehicle.location.coordinates)
      setMapZoom(14)
    }
  }

  const handleRefresh = () => {
    // In a real app, this would fetch fresh data from the server
    toast({
      title: "Data refreshed",
      description: "Vehicle locations have been updated.",
    })
    setLastRefreshed(new Date())
  }

  // Filter vehicles
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driver.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || vehicle.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Prepare map markers
  const mapMarkers = [
    ...vehicles.map((vehicle) => ({
      id: vehicle.id,
      position: vehicle.location.coordinates,
      type: "vehicle" as const,
      label: vehicle.name,
      status: vehicle.status,
    })),
    ...pendingRequests.map((request) => ({
      id: request.id,
      position: request.location.coordinates,
      type: "request" as const,
      label: `${request.serviceType} - ${request.customerName}`,
      status: request.status,
    })),
    ...vehicles
      .filter((vehicle) => vehicle.currentRequest)
      .map((vehicle) => ({
        id: vehicle.currentRequest!.id,
        position: vehicle.currentRequest!.location.coordinates,
        type: "request" as const,
        label: `${vehicle.currentRequest!.serviceType} - ${vehicle.currentRequest!.customerName}`,
        status: vehicle.currentRequest!.status,
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
        <Button onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
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
              {filteredVehicles.length === 0 ? (
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
                        <span>{vehicle.driver.name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{vehicle.driver.phone}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Last update: {new Date(vehicle.location.lastUpdated).toLocaleTimeString()}</span>
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
              {pendingRequests.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No pending requests at this time.</div>
              ) : (
                pendingRequests.map((request) => (
                  <Card
                    key={request.id}
                    className="cursor-pointer transition-all"
                    onClick={() => {
                      setMapCenter(request.location.coordinates)
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
                        <span>{request.location.address}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Requested: {new Date(request.createdAt).toLocaleTimeString()}</span>
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
