import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import React from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { MapView } from "@/components/map/map-view"
import { formatStatus, getStatusVariant } from "@/lib/utils"
import { ArrowLeft, Clock, MapPin, Car, Loader2, Wrench, Search, CheckCircle, AlertTriangle } from "lucide-react"
import api from "@/services/api"
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"

interface Request {
  id: string
  serviceName: string
  companyName: string
  estimatedPrice: number
  finalPrice: number | null
  status: string
  createdAt: string
  description: string
  notes: string | null
  latitude: number
  longitude: number
  vehicleLicensePlate: string | null
  vehicleModel: string | null
  vehicleEquipmentDetails: string[] | null
  vehicleStatus: string | null
  rescueServiceDetails?: {
    id: string
    name: string
    description: string
    price: number
    type: string
  }
  vehicleMake?: string
  vehicleYear?: string
  vehicleImageUrl?: string
}

interface Vehicle {
  id: string
  licensePlate: string
  model: string
  status: string
  equipmentDetails: string[]
  companyId: string
  currentLatitude?: number
  currentLongitude?: number
}

interface Invoice {
  id: string
  amount: number
  status: string
  requestId: string
}

// Status steps mapping
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

// Custom marker icons
const requestIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [41, 41]
})
const vehicleIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [41, 41]
})

// Add icon for company and available vehicles
const companyIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [41, 41]
})

export default function CompanyRequestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState<Request | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [newPrice, setNewPrice] = useState("")
  const [priceNotes, setPriceNotes] = useState("")
  const [showPriceDialog, setShowPriceDialog] = useState(false)
  const [showDispatchDialog, setShowDispatchDialog] = useState(false)
  const [vehicleSearch, setVehicleSearch] = useState("")
  const [equipmentFilter, setEquipmentFilter] = useState<string | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [assigning, setAssigning] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.006791527347836, 105.8436614805358])
  const [mapZoom, setMapZoom] = useState(13)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [reqRes, vehRes] = await Promise.all([
          api.rescueRequests.getRequestById(id!),
          user?.companyId ? api.rescueVehicles.getCompanyVehicles(user.companyId) : Promise.resolve({ data: [] }),
        ])
        setRequest(reqRes.data)
        setVehicles(vehRes.data)
        if (reqRes.data.latitude && reqRes.data.longitude) {
          setMapCenter([reqRes.data.latitude, reqRes.data.longitude])
        }
        if (["INVOICED", "PAID"].includes(reqRes.data.status)) {
          try {
            const invoiceRes = await api.invoices.getInvoiceById(reqRes.data.id)
            setInvoice(invoiceRes.data)
          } catch {}
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id, user])

  // Action handlers
  const handleDispatchVehicle = async () => {
    if (!selectedVehicle) return
    setAssigning(true)
    await api.rescueRequests.dispatchVehicle(request!.id, selectedVehicle.id)
    setRequest((prev) => prev ? {
      ...prev,
      vehicleLicensePlate: selectedVehicle.licensePlate,
      vehicleModel: selectedVehicle.model,
      vehicleEquipmentDetails: selectedVehicle.equipmentDetails,
      vehicleStatus: selectedVehicle.status,
      status: "RESCUE_VEHICLE_DISPATCHED"
    } : null)
    setAssigning(false)
    setShowDispatchDialog(false)
    setSelectedVehicle(null)
    setVehicleSearch("")
    setEquipmentFilter(null)
  }

  const handleArrived = async () => {
    try {
      await api.rescueRequests.markVehicleArrived(request!.id)
      setRequest((prev) => prev ? { ...prev, status: "RESCUE_VEHICLE_ARRIVED" } : null)
      toast({ title: "Đã đánh dấu xe đã đến nơi" })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error.response?.data?.message || "Thao tác thất bại." })
    }
  }

  const handleInspection = async () => {
    try {
      await api.rescueRequests.markInspectionDone(request!.id)
      setRequest((prev) => prev ? { ...prev, status: "INSPECTION_DONE" } : null)
      toast({ title: "Đã đánh dấu đã kiểm tra xe" })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error.response?.data?.message || "Thao tác thất bại." })
    }
  }

  const handleUpdatePrice = async () => {
    if (!newPrice) return
    try {
      await api.rescueRequests.updatePrice(request!.id, parseFloat(newPrice), priceNotes)
      setRequest((prev) => prev ? {
        ...prev,
        status: "PRICE_UPDATED",
        estimatedPrice: parseFloat(newPrice)
      } : null)
      setShowPriceDialog(false)
      setNewPrice("")
      setPriceNotes("")
      toast({ title: "Đã cập nhật giá mới" })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error.response?.data?.message || "Cập nhật giá thất bại." })
    }
  }

  const handleStartRepair = async () => {
    try {
      await api.rescueRequests.startRepair(request!.id)
      setRequest((prev) => prev ? { ...prev, status: "IN_PROGRESS" } : null)
      toast({ title: "Đã bắt đầu sửa chữa" })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error.response?.data?.message || "Thao tác thất bại." })
    }
  }

  const handleComplete = async () => {
    try {
      await api.rescueRequests.completeRepair(request!.id)
      setRequest((prev) => prev ? { ...prev, status: "COMPLETED" } : null)
      toast({ title: "Đã hoàn thành cứu hộ" })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error.response?.data?.message || "Thao tác thất bại." })
    }
  }

  const handleAccept = async () => {
    try {
      await api.rescueRequests.acceptRequest(request!.id)
      setRequest((prev) => prev ? { ...prev, status: "ACCEPTED_BY_COMPANY" } : null)
      toast({ title: "Đã chấp nhận yêu cầu cứu hộ" })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error.response?.data?.message || "Thao tác thất bại." })
    }
  }

  const handleCancel = async () => {
    try {
      await api.rescueRequests.cancelByCompany(request!.id)
      setRequest((prev) => prev ? { ...prev, status: "CANCELLED_BY_COMPANY" } : null)
      toast({ title: "Đã hủy yêu cầu cứu hộ" })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Lỗi", description: error.response?.data?.message || "Thao tác thất bại." })
    }
  }

  // Prepare vehicle filter
  const allEquipment = Array.from(new Set(vehicles.flatMap(v => v.equipmentDetails)))
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch =
      v.licensePlate.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      v.model.toLowerCase().includes(vehicleSearch.toLowerCase())
    const matchesEquipment = !equipmentFilter || v.equipmentDetails.includes(equipmentFilter)
    return v.status === "AVAILABLE" && matchesSearch && matchesEquipment
  })

  // Prepare map markers
  const mapMarkers = request?.latitude && request?.longitude ? [
    {
      id: "request-location",
      position: [request.latitude, request.longitude] as [number, number],
      type: "request" as const,
      label: "Request Location",
    },
    ...(request.vehicleLicensePlate && vehicles.length > 0 ? vehicles.filter(v => v.licensePlate === request.vehicleLicensePlate && v.currentLatitude && v.currentLongitude).map(vehicle => ({
      id: `vehicle-location-${vehicle.id}`,
      position: [vehicle.currentLatitude, vehicle.currentLongitude] as [number, number],
      type: "vehicle" as const,
      label: `${vehicle.model} (${vehicle.licensePlate})`,
    })) : []),
  ] : []

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  )
  if (!request) return <div className="p-8 text-center">Request not found</div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Request Details</h1>
        </div>
        <Badge variant={getStatusVariant(request.status) || "outline"}>{formatStatus(request.status)}</Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Status</CardTitle>
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

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Rescue Map</CardTitle>
              <CardDescription>Location of the request and assigned vehicle</CardDescription>
            </CardHeader>
            <CardContent>
              <MapView markers={mapMarkers} center={mapCenter} zoom={mapZoom} height="350px" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Vehicle Management</CardTitle>
              <CardDescription>Assign and track rescue vehicles</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Thông tin xe mới */}
              {(request.vehicleMake || request.vehicleModel || request.vehicleYear || request.vehicleImageUrl) && (
                <div className="space-y-2 mb-4">
                  {request.vehicleImageUrl && (
                    <img
                      src={request.vehicleImageUrl}
                      alt="Vehicle"
                      className="w-full max-w-xs rounded border mb-2"
                      style={{objectFit: 'cover'}}
                    />
                  )}
                  <div>
                    <span className="font-medium">Make:</span> {request.vehicleMake || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Model:</span> {request.vehicleModel || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Year:</span> {request.vehicleYear || 'N/A'}
                  </div>
                </div>
              )}
              {/* Thông tin xe được gán (nếu có) */}
              {request.vehicleModel && request.vehicleLicensePlate ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{request.vehicleModel}</span>
                    <span className="text-xs text-muted-foreground">({request.vehicleLicensePlate})</span>
                  </div>
                  {request.vehicleEquipmentDetails && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Wrench className="h-4 w-4" />
                      {request.vehicleEquipmentDetails.join(", ")}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">Status: {request.vehicleStatus}</div>
                </div>
              ) : (
                <>
                  <Button onClick={() => setShowDispatchDialog(true)} className="w-full" variant="secondary">
                    <Car className="mr-2 h-4 w-4" />Cử xe đi
                  </Button>
                  <Dialog open={showDispatchDialog} onOpenChange={setShowDispatchDialog}>
                    <DialogContent className="max-w-2xl w-full">
                      <DialogHeader>
                        <DialogTitle>Chọn xe cứu hộ để điều phối</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2 mb-2">
                            <Input
                              placeholder="Tìm theo biển số, model..."
                              value={vehicleSearch}
                              onChange={e => setVehicleSearch(e.target.value)}
                              className="bg-background text-foreground border border-input focus:ring-2 focus:ring-primary"
                            />
                            <select
                              className="border border-input rounded px-2 py-1 text-sm bg-background text-foreground focus:ring-2 focus:ring-primary"
                              value={equipmentFilter || ''}
                              onChange={e => setEquipmentFilter(e.target.value || null)}
                            >
                              <option value="">Tất cả thiết bị</option>
                              {allEquipment.map(eq => (
                                <option key={eq} value={eq}>{eq}</option>
                              ))}
                            </select>
                          </div>
                          <div className="max-h-60 overflow-y-auto space-y-2">
                            {filteredVehicles.length === 0 && (
                              <div className="text-xs text-muted-foreground text-center py-4">Không có xe phù hợp</div>
                            )}
                            {filteredVehicles.map(vehicle => (
                              <div
                                key={vehicle.id}
                                className={`border rounded-lg p-2 flex items-center gap-3 cursor-pointer transition ${selectedVehicle?.id === vehicle.id ? 'border-primary bg-primary/10' : 'hover:bg-muted'}`}
                                onClick={() => setSelectedVehicle(vehicle)}
                              >
                                <Car className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                  <div className="font-medium">{vehicle.model}</div>
                                  <div className="text-xs text-muted-foreground">{vehicle.licensePlate}</div>
                                  <div className="flex gap-1 flex-wrap text-xs mt-1">
                                    {vehicle.equipmentDetails.map(eq => (
                                      <Badge key={eq} variant="secondary">{eq}</Badge>
                                    ))}
                                  </div>
                                </div>
                                <Badge variant={vehicle.status === "AVAILABLE" ? "default" : "secondary"}>{vehicle.status}</Badge>
                                {selectedVehicle?.id === vehicle.id && <CheckCircle className="h-4 w-4 text-primary ml-2" />}
                              </div>
                            ))}
                          </div>
                          <Button
                            disabled={!selectedVehicle || assigning}
                            onClick={handleDispatchVehicle}
                            className="w-full mt-2"
                          >
                            {assigning ? 'Đang điều phối...' : 'Xác nhận cử xe này'}
                          </Button>
                        </div>
                        <div className="flex-1 min-w-[250px]">
                          <MapContainer
                            center={request.latitude && request.longitude ? [request.latitude, request.longitude] : [21.0285, 105.8542]}
                            zoom={13}
                            style={{ height: 300, width: '100%', borderRadius: 8, zIndex: 0 }}
                            scrollWheelZoom={true}
                            dragging={true}
                          >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {/* Request location */}
                            {request.latitude && request.longitude && (
                              <Marker position={[request.latitude, request.longitude]} icon={requestIcon}>
                                <Popup>Vị trí yêu cầu cứu hộ</Popup>
                              </Marker>
                            )}
                            {/* All company vehicles with location */}
                            {vehicles.map(vehicle => (
                              vehicle.currentLatitude && vehicle.currentLongitude && (
                                <Marker
                                  key={vehicle.id}
                                  position={[vehicle.currentLatitude, vehicle.currentLongitude]}
                                  icon={vehicleIcon}
                                  eventHandlers={{
                                    click: () => setSelectedVehicle(vehicle)
                                  }}
                                >
                                  <Popup>
                                    {vehicle.model} ({vehicle.licensePlate})
                                  </Popup>
                                </Marker>
                              )
                            ))}
                          </MapContainer>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 justify-between">
              {request.status === "CREATED" && (
                <Button className="w-full" onClick={handleAccept}>Chấp nhận yêu cầu</Button>
              )}
              {request.status === "ACCEPTED_BY_COMPANY" && (
                <Dialog open={showDispatchDialog} onOpenChange={setShowDispatchDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full">Cử xe đi</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl w-full">
                    <DialogHeader>
                      <DialogTitle>Chọn xe cứu hộ để điều phối</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2 mb-2">
                          <Input
                            placeholder="Tìm theo biển số, model..."
                            value={vehicleSearch}
                            onChange={e => setVehicleSearch(e.target.value)}
                            className="bg-background text-foreground border border-input focus:ring-2 focus:ring-primary"
                          />
                          <select
                            className="border border-input rounded px-2 py-1 text-sm bg-background text-foreground focus:ring-2 focus:ring-primary"
                            value={equipmentFilter || ''}
                            onChange={e => setEquipmentFilter(e.target.value || null)}
                          >
                            <option value="">Tất cả thiết bị</option>
                            {allEquipment.map(eq => (
                              <option key={eq} value={eq}>{eq}</option>
                            ))}
                          </select>
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {filteredVehicles.length === 0 && (
                            <div className="text-xs text-muted-foreground text-center py-4">Không có xe phù hợp</div>
                          )}
                          {filteredVehicles.map(vehicle => (
                            <div
                              key={vehicle.id}
                              className={`border rounded-lg p-2 flex items-center gap-3 cursor-pointer transition ${selectedVehicle?.id === vehicle.id ? 'border-primary bg-primary/10' : 'hover:bg-muted'}`}
                              onClick={() => setSelectedVehicle(vehicle)}
                            >
                              <Car className="h-5 w-5 text-muted-foreground" />
                              <div className="flex-1">
                                <div className="font-medium">{vehicle.model}</div>
                                <div className="text-xs text-muted-foreground">{vehicle.licensePlate}</div>
                                <div className="flex gap-1 flex-wrap text-xs mt-1">
                                  {vehicle.equipmentDetails.map(eq => (
                                    <Badge key={eq} variant="secondary">{eq}</Badge>
                                  ))}
                                </div>
                              </div>
                              <Badge variant={vehicle.status === "AVAILABLE" ? "default" : "secondary"}>{vehicle.status}</Badge>
                              {selectedVehicle?.id === vehicle.id && <CheckCircle className="h-4 w-4 text-primary ml-2" />}
                            </div>
                          ))}
                        </div>
                        <Button
                          disabled={!selectedVehicle || assigning}
                          onClick={handleDispatchVehicle}
                          className="w-full mt-2"
                        >
                          {assigning ? 'Đang điều phối...' : 'Xác nhận cử xe này'}
                        </Button>
                      </div>
                      <div className="flex-1 min-w-[250px]">
                        <MapContainer
                          center={request.latitude && request.longitude ? [request.latitude, request.longitude] : [21.0285, 105.8542]}
                          zoom={13}
                          style={{ height: 300, width: '100%', borderRadius: 8, zIndex: 0 }}
                          scrollWheelZoom={true}
                          dragging={true}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          {/* Request location */}
                          {request.latitude && request.longitude && (
                            <Marker position={[request.latitude, request.longitude]} icon={requestIcon}>
                              <Popup>Vị trí yêu cầu cứu hộ</Popup>
                            </Marker>
                          )}
                          {/* All company vehicles with location */}
                          {vehicles.map(vehicle => (
                            vehicle.currentLatitude && vehicle.currentLongitude && (
                              <Marker
                                key={vehicle.id}
                                position={[vehicle.currentLatitude, vehicle.currentLongitude]}
                                icon={vehicleIcon}
                                eventHandlers={{
                                  click: () => setSelectedVehicle(vehicle)
                                }}
                              >
                                <Popup>
                                  {vehicle.model} ({vehicle.licensePlate})
                                </Popup>
                              </Marker>
                            )
                          ))}
                        </MapContainer>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {request.status !== "CANCELLED_BY_COMPANY" && request.status !== "CANCELLED_BY_USER" && (
                <Button className="w-full" variant="destructive" onClick={handleCancel}>Hủy yêu cầu</Button>
              )}
              {request.status === "RESCUE_VEHICLE_DISPATCHED" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">Đánh dấu xe đã đến</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Xác nhận xe đã đến nơi?</DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                      <Button onClick={handleArrived} className="w-full">Xác nhận</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {request.status === "RESCUE_VEHICLE_ARRIVED" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">Đánh dấu đã kiểm tra</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Xác nhận đã kiểm tra xe?</DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                      <Button onClick={handleInspection} className="w-full">Xác nhận</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {request.status === "INSPECTION_DONE" && (
                <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full">Cập nhật giá</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cập nhật giá mới</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Giá mới</label>
                        <Input
                          type="number"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          placeholder="Nhập giá mới"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Ghi chú</label>
                        <Input
                          value={priceNotes}
                          onChange={(e) => setPriceNotes(e.target.value)}
                          placeholder="Nhập ghi chú (tuỳ chọn)"
                        />
                      </div>
                      <Button onClick={handleUpdatePrice} className="w-full">Cập nhật</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {(request.status === "PRICE_UPDATED" || request.status === "PRICE_CONFIRMED") && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">Bắt đầu sửa chữa</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Bắt đầu sửa chữa?</DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                      <Button onClick={handleStartRepair} className="w-full">Xác nhận</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {request.status === "IN_PROGRESS" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">Hoàn thành</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Xác nhận hoàn thành cứu hộ?</DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                      <Button onClick={handleComplete} className="w-full">Xác nhận</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardFooter>
          </Card>

          {["INVOICED", "PAID"].includes(request.status) && invoice && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Invoice Details</CardTitle>
                <CardDescription>Payment information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium">Invoice ID</div>
                  <div className="text-sm text-muted-foreground">{invoice.id}</div>
                </div>
                <div>
                  <div className="font-medium">Amount</div>
                  <div className="text-sm text-muted-foreground">{invoice.amount} đ</div>
                </div>
                <div>
                  <div className="font-medium">Status</div>
                  <Badge variant={invoice.status === "PAID" ? "default" : "secondary"}>
                    {invoice.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  )
} 