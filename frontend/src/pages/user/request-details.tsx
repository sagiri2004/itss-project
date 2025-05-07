"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { formatCurrency, getStatusVariant, formatStatus } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  Car,
  Building,
  CreditCard,
  MessageSquare,
  Map,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"

// Mock data for a request
const mockRequest = {
  id: "req-001",
  status: "RESCUE_VEHICLE_DISPATCHED",
  location: "123 Main St, New York, NY 10001",
  serviceType: "Flat Tire Replacement",
  description: "Left rear tire is flat. I have a spare but need help changing it.",
  createdAt: "2023-06-15T14:30:00Z",
  estimatedArrival: "2023-06-15T15:00:00Z",
  vehicle: {
    make: "Toyota",
    model: "Camry",
    year: "2020",
  },
  company: {
    id: "comp-001",
    name: "FastFix Roadside",
    phone: "+1 (555) 123-4567",
  },
  assignedVehicle: {
    id: "veh-001",
    name: "Tow Truck #1",
    driver: {
      name: "John Smith",
      phone: "+1 (555) 987-6543",
    },
  },
  price: 75.0,
  additionalFees: 15.0,
  total: 90.0,
  timeline: [
    {
      status: "CREATED",
      timestamp: "2023-06-15T14:30:00Z",
    },
    {
      status: "ACCEPTED_BY_COMPANY",
      timestamp: "2023-06-15T14:35:00Z",
    },
    {
      status: "RESCUE_VEHICLE_DISPATCHED",
      timestamp: "2023-06-15T14:40:00Z",
    },
  ],
}

export default function RequestDetails() {
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [request, setRequest] = useState(mockRequest)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate fetching request data
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        // In a real app, fetch from API
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setRequest(mockRequest)
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

  // Calculate progress percentage based on status
  const getProgressPercentage = () => {
    const statuses = [
      "CREATED",
      "ACCEPTED_BY_COMPANY",
      "RESCUE_VEHICLE_DISPATCHED",
      "RESCUE_VEHICLE_ARRIVED",
      "IN_PROGRESS",
      "COMPLETED",
      "INVOICED",
      "PAID",
    ]
    const currentIndex = statuses.indexOf(request.status)
    if (currentIndex === -1) return 0
    return Math.round((currentIndex / (statuses.length - 1)) * 100)
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
          <Button variant="outline" size="icon" onClick={() => navigate("/user/requests")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Request Details</h1>
        </div>
        <Badge variant={getStatusVariant(request.status) || "outline"}>{formatStatus(request.status)}</Badge>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Request Progress</CardTitle>
            <CardDescription>Track the status of your roadside assistance request</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={getProgressPercentage()} className="h-2" />
            <div className="mt-4 space-y-4">
              {request.timeline.map((event, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{formatStatus(event.status)}</div>
                    <div className="text-sm text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))}

              {request.status !== "RESCUE_VEHICLE_ARRIVED" && (
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Vehicle Arrival</div>
                    <div className="text-sm text-muted-foreground">
                      Estimated: {new Date(request.estimatedArrival).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate(`/user/requests/${id}/map`)}>
              <Map className="mr-2 h-4 w-4" />
              Track on Map
            </Button>
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Service Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Location</div>
                  <div className="text-sm text-muted-foreground">{request.location}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Car className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Service Type</div>
                  <div className="text-sm text-muted-foreground">{request.serviceType}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Problem Description</div>
                  <div className="text-sm text-muted-foreground">{request.description}</div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-2">
                <Car className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Your Vehicle</div>
                  <div className="text-sm text-muted-foreground">
                    {request.vehicle.year} {request.vehicle.make} {request.vehicle.model}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Request Time</div>
                  <div className="text-sm text-muted-foreground">{new Date(request.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Service Provider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <Building className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Company</div>
                  <div className="text-sm text-muted-foreground">{request.company.name}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Contact</div>
                  <div className="text-sm text-muted-foreground">{request.company.phone}</div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-2">
                <Car className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Assigned Vehicle</div>
                  <div className="text-sm text-muted-foreground">{request.assignedVehicle.name}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Driver</div>
                  <div className="text-sm text-muted-foreground">
                    {request.assignedVehicle.driver.name} - {request.assignedVehicle.driver.phone}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-2">
                <CreditCard className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Pricing</div>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <span className="text-muted-foreground">Base Price:</span>
                    <span>{formatCurrency(request.price)}</span>

                    <span className="text-muted-foreground">Additional Fees:</span>
                    <span>{formatCurrency(request.additionalFees)}</span>

                    <span className="font-medium">Total:</span>
                    <span className="font-medium">{formatCurrency(request.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => window.open(`tel:${request.assignedVehicle.driver.phone}`)}>
                <Phone className="mr-2 h-4 w-4" />
                Call Driver
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
