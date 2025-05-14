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
import { ArrowLeft, Clock, MapPin, Phone, Car, Loader2 } from "lucide-react"
import api from "@/services/api"
import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"

interface Request {
  id: string
  userId: string
  serviceId: string
  serviceName: string
  companyId: string
  companyName: string
  latitude: number
  longitude: number
  description: string
  estimatedPrice: number
  finalPrice: number | null
  status: string
  createdAt: string
  notes: string | null
  rescueServiceDetails: {
    id: string
    name: string
    description: string
    price: number
    type: string
    companyId: string
    companyName: string
  } | null
  vehicleLicensePlate: string | null
  vehicleModel: string | null
  vehicleEquipmentDetails: string[] | null
  vehicleStatus: string | null
}

// Status steps mapping (simple)
const MAIN_STATUS_STEPS = [
  { key: 'CREATED', label: 'Created' },
  { key: 'ACCEPTED_BY_COMPANY', label: 'Accepted' },
  { key: 'RESCUE_VEHICLE_DISPATCHED', label: 'Dispatched' },
  { key: 'RESCUE_VEHICLE_ARRIVED', label: 'Arrived' },
  { key: 'INSPECTION_DONE', label: 'Inspected' },
  { key: 'PRICE_UPDATED', label: 'Price Updated' },
  { key: 'PRICE_CONFIRMED', label: 'Price Confirmed' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'INVOICED', label: 'Invoiced' },
  { key: 'PAID', label: 'Paid' },
];
const SPECIAL_STATUS = {
  REJECTED_BY_USER: { key: 'REJECTED', label: 'Rejected' },
  CANCELLED_BY_USER: { key: 'CANCELLED_BY_USER', label: 'User Cancelled' },
  CANCELLED_BY_COMPANY: { key: 'CANCELLED_BY_COMPANY', label: 'Company Cancelled' },
};
function SimpleStatusBar({ status }: { status: string }) {
  let steps = [...MAIN_STATUS_STEPS];
  let currentIdx = steps.findIndex(s => s.key === status);
  const isSpecial = Object.prototype.hasOwnProperty.call(SPECIAL_STATUS, status);
  if (isSpecial) {
    steps = [...MAIN_STATUS_STEPS, (SPECIAL_STATUS as Record<string, { key: string; label: string }>)[status]];
    currentIdx = steps.length - 1;
  }
  const visibleSteps = steps.slice(0, currentIdx + 1);
  return (
    <div className="flex items-center gap-2 py-2">
      {visibleSteps.map((step, idx) => (
        <React.Fragment key={step.key}>
          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold
            ${idx === currentIdx ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}
          `}>
            {idx + 1}
          </div>
          {idx < visibleSteps.length - 1 && (
            <div className="w-8 h-0.5 bg-muted" />
          )}
        </React.Fragment>
      ))}
      <span className="ml-4 text-sm font-medium">{visibleSteps[visibleSteps.length - 1].label}</span>
    </div>
  );
}

export default function RequestMap() {
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [request, setRequest] = useState<Request | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.006])
  const [mapZoom, setMapZoom] = useState(13)

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) {
        toast({
          variant: "destructive",
          title: "Invalid Request",
          description: "Request ID is missing.",
        })
        setIsLoading(false)
        return
      }

      try {
        const response = await api.rescueRequests.getRequestById(id)
        const requestData = response.data
        if (requestData && requestData.latitude && requestData.longitude) {
          setRequest(requestData)
          setMapCenter([requestData.latitude, requestData.longitude])
        } else {
          throw new Error("Invalid request data")
        }
        setIsLoading(false)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading request",
          description: error.response?.data?.message || "Could not load the request details. Please try again.",
        })
        setIsLoading(false)
      }
    }

    fetchRequest()
  }, [id, toast])

  // Simulate vehicle movement (for demo purposes)
  useEffect(() => {
    if (!isLoading && request?.status === "RESCUE_VEHICLE_DISPATCHED" && request.latitude && request.longitude) {
      const interval = setInterval(() => {
        setRequest((prev) => {
          if (!prev) return null
          const vehicleLat = prev.latitude
          const vehicleLng = prev.longitude
          const requestLat = prev.latitude
          const requestLng = prev.longitude

          const newLat = vehicleLat + (requestLat - vehicleLat) * 0.1
          const newLng = vehicleLng + (requestLng - vehicleLng) * 0.1

          const distance = Math.sqrt(Math.pow(newLat - requestLat, 2) + Math.pow(newLng - requestLng, 2))

          if (distance < 0.001) {
            clearInterval(interval)
            return {
              ...prev,
              status: "RESCUE_VEHICLE_ARRIVED",
            }
          }

          return {
            ...prev,
            latitude: newLat,
            longitude: newLng,
          }
        })
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [isLoading, request])

  if (isLoading || !request) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Prepare map markers
  const mapMarkers = request.latitude && request.longitude ? [
    {
      id: "user-location",
      position: [request.latitude, request.longitude] as [number, number],
      type: "user" as const,
      label: "Your Location",
    },
  ] : []

  // Calculate ETA
  const calculateETA = () => {
    if (request.status === "RESCUE_VEHICLE_ARRIVED") {
      return "Vehicle has arrived"
    }

    try {
      const now = new Date()
      const eta = new Date(request.createdAt)
      if (isNaN(eta.getTime())) {
        return "ETA unavailable"
      }
      const diffMinutes = Math.round((eta.getTime() - now.getTime()) / 60000)

      if (diffMinutes <= 0) {
        return "Arriving any moment"
      }

      return `${diffMinutes} minutes`
    } catch {
      return "ETA unavailable"
    }
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

  const canCancel = !["COMPLETED", "CANCELLED_BY_USER", "CANCELLED_BY_COMPANY", "PAID"].includes(request.status)
  const canConfirmPrice = request.status === "PRICE_UPDATED"

  // NEW: Detailed info card and status bar
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full h-full p-0 space-y-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
          <CardDescription>
            <SimpleStatusBar status={request.status} />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Service</h3>
              <div>Name: {request.rescueServiceDetails?.name || request.serviceName}</div>
              <div>Type: {request.rescueServiceDetails?.type}</div>
              <div>Description: {request.rescueServiceDetails?.description}</div>
              <div>Price: {request.rescueServiceDetails?.price ?? request.estimatedPrice}</div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Company</h3>
              <div>Name: {request.companyName}</div>
              <div>ID: {request.companyId}</div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Location</h3>
              <div>Lat: {request.latitude}</div>
              <div>Lng: {request.longitude}</div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Price</h3>
              <div>Estimated: {request.estimatedPrice}</div>
              <div>Final: {request.finalPrice ?? 'N/A'}</div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Status</h3>
              <Badge>{request.status}</Badge>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Created At</h3>
              <div>{new Date(request.createdAt).toLocaleString()}</div>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-semibold mb-2">Description</h3>
              <div>{request.description}</div>
            </div>
            {request.notes && (
              <div className="md:col-span-2">
                <h3 className="font-semibold mb-2">Notes</h3>
                <div>{request.notes}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
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
                  <div className="text-sm text-muted-foreground">{request.description || "N/A"}</div>
                </div>
              </div>

              {request.rescueServiceDetails ? (
                <div>
                  <div className="font-medium">Service Type</div>
                  <div className="text-sm text-muted-foreground">{request.rescueServiceDetails.name || "N/A"}</div>
                  <div className="text-xs text-muted-foreground">{request.rescueServiceDetails.description || "N/A"}</div>
                </div>
              ) : (
                <div>
                  <div className="font-medium">Service Type</div>
                  <div className="text-sm text-muted-foreground">N/A</div>
                </div>
              )}

              {request.companyName ? (
                <div>
                  <div className="font-medium">Rescue Company</div>
                  <div className="text-sm text-muted-foreground">{request.companyName}</div>
                </div>
              ) : (
                <div>
                  <div className="font-medium">Rescue Company</div>
                  <div className="text-sm text-muted-foreground">N/A</div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Estimated Arrival</div>
                  <div className="text-sm text-muted-foreground">{calculateETA()}</div>
                </div>
              </div>

              <div>
                <div className="font-medium">Price</div>
                <div className="text-sm text-muted-foreground">
                  {request.finalPrice !== null
                    ? `${request.finalPrice} đ`
                    : request.estimatedPrice
                      ? `${request.estimatedPrice} đ (estimated)`
                      : "Chưa cập nhật"}
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
              {request.rescueServiceDetails ? (
                <div className="flex items-start gap-2">
                  <Car className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{request.rescueServiceDetails.name || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">{request.rescueServiceDetails.type || "N/A"}</div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-medium">Vehicle Info</div>
                  <div className="text-sm text-muted-foreground">N/A</div>
                </div>
              )}

              {request.rescueServiceDetails ? (
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{request.rescueServiceDetails.companyName || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">{request.rescueServiceDetails.companyId || "N/A"}</div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-medium">Company Info</div>
                  <div className="text-sm text-muted-foreground">N/A</div>
                </div>
              )}

              {request.vehicleModel ? (
                <div>
                  <div className="font-medium">{request.vehicleModel} ({request.vehicleLicensePlate || "N/A"})</div>
                  <div className="text-sm text-muted-foreground">Status: {request.vehicleStatus || "N/A"}</div>
                  <div className="text-xs text-muted-foreground">
                    Equipment: {request.vehicleEquipmentDetails?.length ? request.vehicleEquipmentDetails.join(", ") : "N/A"}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-medium">Vehicle Details</div>
                  <div className="text-sm text-muted-foreground">N/A</div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={!request.rescueServiceDetails?.companyId}
                onClick={() => {
                  if (request.rescueServiceDetails?.companyId) {
                    window.open(`tel:${request.rescueServiceDetails.companyId}`)
                  }
                }}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call Company
              </Button>
            </CardFooter>
          </Card>
        </div>
      </motion.div>

      <div className="flex gap-4 mb-4">
        {canCancel && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Huỷ yêu cầu</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xác nhận huỷ yêu cầu?</DialogTitle>
              </DialogHeader>
              <DialogFooter>
                <Button variant="destructive" onClick={async () => {
                  try {
                    await api.rescueRequests.cancelRequest(request.id)
                    setRequest((prev) => prev ? { ...prev, status: "CANCELLED_BY_USER" } : null)
                    toast({ title: "Đã huỷ yêu cầu", description: "Yêu cầu của bạn đã được huỷ thành công." })
                  } catch (error: any) {
                    toast({ variant: "destructive", title: "Lỗi", description: error.response?.data?.message || "Huỷ yêu cầu thất bại." })
                  }
                }}>Xác nhận huỷ</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {canConfirmPrice && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default">Chấp nhận giá mới</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bạn đồng ý với mức giá mới?</DialogTitle>
              </DialogHeader>
              <DialogFooter className="flex gap-2">
                <Button variant="secondary" onClick={async () => {
                  try {
                    await api.rescueRequests.cancelRequest(request.id)
                    setRequest((prev) => prev ? { ...prev, status: "CANCELLED_BY_USER" } : null)
                    toast({ title: "Đã từ chối giá mới", description: "Bạn đã từ chối mức giá mới và huỷ yêu cầu." })
                  } catch (error: any) {
                    toast({ variant: "destructive", title: "Lỗi", description: error.response?.data?.message || "Từ chối giá mới thất bại." })
                  }
                }}>Từ chối</Button>
                <Button variant="default" onClick={async () => {
                  try {
                    await api.rescueRequests.confirmPrice(request.id)
                    setRequest((prev) => prev ? { ...prev, status: "PRICE_CONFIRMED" } : null)
                    toast({ title: "Đã chấp nhận giá mới", description: "Bạn đã đồng ý với mức giá mới." })
                  } catch (error: any) {
                    toast({ variant: "destructive", title: "Lỗi", description: error.response?.data?.message || "Chấp nhận giá mới thất bại." })
                  }
                }}>Đồng ý</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </motion.div>
  )
}