"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { MapView } from "@/components/map/map-view"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatStatus, getStatusVariant } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Clock, MapPin, Phone, Car, Info } from "lucide-react"

// Replace the mock data imports
import { mockRequestMap } from "@/data/mock-data"

export default function RequestMap() {
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [request, setRequest] = useState(mockRequestMap)
  const [isLoading, setIsLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.006])
  const [mapZoom, setMapZoom] = useState(13)

  // Simulate fetching request data
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        // In a real app, fetch from API
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setRequest(mockRequestMap)
        setMapCenter(mockRequestMap.location.coordinates)
        setIsLoading(false)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error loading request",
          description: "Could not load the request details. Please try again.",
        })
        setIsLoading(false)
      }
    }

    fetchRequest()
  }, [id, toast])

  // Simulate vehicle movement (for demo purposes)
  useEffect(() => {
    if (!isLoading && request.status === "RESCUE_VEHICLE_DISPATCHED") {
      const interval = setInterval(() => {
        setRequest((prev) => {
          // Move vehicle slightly closer to the request location
          const vehicleLat = prev.vehicle.location.coordinates[0]
          const vehicleLng = prev.vehicle.location.coordinates[1]
          const requestLat = prev.location.coordinates[0]
          const requestLng = prev.location.coordinates[1]

          const newLat = vehicleLat + (requestLat - vehicleLat) * 0.1
          const newLng = vehicleLng + (requestLng - vehicleLng) * 0.1

          // Check if vehicle has arrived (close enough to request)
          const distance = Math.sqrt(Math.pow(newLat - requestLat, 2) + Math.pow(newLng - requestLng, 2))

          if (distance < 0.001) {
            clearInterval(interval)
            return {
              ...prev,
              status: "RESCUE_VEHICLE_ARRIVED",
              vehicle: {
                ...prev.vehicle,
                location: {
                  ...prev.vehicle.location,
                  coordinates: [requestLat, requestLng],
                  lastUpdated: new Date().toISOString(),
                },
              },
            }
          }

          return {
            ...prev,
            vehicle: {
              ...prev.vehicle,
              location: {
                ...prev.vehicle.location,
                coordinates: [newLat, newLng],
                lastUpdated: new Date().toISOString(),
              },
            },
          }
        })
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [isLoading, request.status])

  // Prepare map markers
  const mapMarkers = [
    {
      id: "user-location",
      position: request.location.coordinates,
      type: "user" as const,
      label: "Your Location",
    },
    {
      id: request.vehicle.id,
      position: request.vehicle.location.coordinates,
      type: "vehicle" as const,
      label: `${request.vehicle.name} (${request.vehicle.driver.name})`,
      status: "IN_USE",
    },
  ]

  // Calculate ETA
  const calculateETA = () => {
    if (request.status === "RESCUE_VEHICLE_ARRIVED") {
      return "Vehicle has arrived"
    }

    const now = new Date()
    const eta = new Date(request.estimatedArrival)
    const diffMinutes = Math.round((eta.getTime() - now.getTime()) / 60000)

    if (diffMinutes <= 0) {
      return "Arriving any moment"
    }

    return `${diffMinutes} minutes`
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(`/user/requests/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Track Your Rescue</h1>
        </div>
        <Badge variant={getStatusVariant(request.status) || "outline"}>{formatStatus(request.status)}</Badge>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <MapView markers={mapMarkers} center={mapCenter} zoom={mapZoom} height="500px" />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Rescue Details</CardTitle>
              <CardDescription>Track your roadside assistance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Your Location</div>
                  <div className="text-sm text-muted-foreground">{request.location.address}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Service Type</div>
                  <div className="text-sm text-muted-foreground">{request.serviceType}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Estimated Arrival</div>
                  <div className="text-sm text-muted-foreground">{calculateETA()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Rescue Vehicle</CardTitle>
              <CardDescription>Information about your assigned vehicle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <Car className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{request.vehicle.name}</div>
                  <div className="text-sm text-muted-foreground">{request.vehicle.type}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{request.vehicle.driver.name}</div>
                  <div className="text-sm text-muted-foreground">{request.vehicle.driver.phone}</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => window.open(`tel:${request.vehicle.driver.phone}`)}>
                <Phone className="mr-2 h-4 w-4" />
                Call Driver
              </Button>
            </CardFooter>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  )
}
