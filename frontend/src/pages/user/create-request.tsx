"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, MapPin, AlertTriangle } from "lucide-react"
import api from "@/services/api"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface Service {
  id: string
  name: string
  description: string
  price: number
  type: string
  companyName: string
  distance?: number
  company?: {
    latitude: number
    longitude: number
    name: string
  }
}

interface RequestData {
  rescueServiceId: string
  location: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  description: string
}

export default function CreateRequest() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [formData, setFormData] = useState({
    serviceType: "",
    serviceTypeEnum: "",
    location: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    description: "",
    useCurrentLocation: false,
    selectedNearbyService: null as string | null,
  })
  const [nearbyServices, setNearbyServices] = useState<Service[]>([])
  const [isLoadingNearby, setIsLoadingNearby] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await api.rescueServices.getServices()
      setServices(response.data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch services. Please try again.",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "serviceType") {
      const selected = services.find((s) => s.id === value)
      setFormData((prev) => ({
        ...prev,
        serviceType: value,
        serviceTypeEnum: selected?.type || "",
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setFormData((prev) => ({
            ...prev,
            useCurrentLocation: true,
            location: `${latitude},${longitude}`,
          }))

          toast({
            title: "Location detected",
            description: "Using your current location for this request.",
          })
        },
        (error) => {
          toast({
            variant: "destructive",
            title: "Location error",
            description: "Failed to get your location. Please enter it manually.",
          })
        }
      )
    } else {
      toast({
        variant: "destructive",
        title: "Location not supported",
        description: "Your browser does not support geolocation. Please enter your location manually.",
      })
    }
  }

  const fetchNearbyServices = async () => {
    setIsLoadingNearby(true)
    try {
      const [lat, lng] = formData.location.split(",").map(Number)
      const response = await api.rescueServices.getServices({
        latitude: lat,
        longitude: lng,
        serviceType: formData.serviceTypeEnum,
        limit: 5,
      })
      setNearbyServices(response.data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch nearby services. Please try again.",
      })
    } finally {
      setIsLoadingNearby(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let latitude, longitude;
      if (formData.location && formData.location.includes(',')) {
        [latitude, longitude] = formData.location.split(',').map(Number);
      }
      const requestData: any = {
        rescueServiceId: formData.serviceType,
        vehicleMake: formData.vehicleMake,
        vehicleModel: formData.vehicleModel,
        vehicleYear: parseInt(formData.vehicleYear),
        description: formData.description,
      };
      if (latitude !== undefined && longitude !== undefined) {
        requestData.latitude = latitude;
        requestData.longitude = longitude;
      }

      await api.rescueRequests.createRequest(requestData)

      toast({
        title: "Request created successfully",
        description: "Your roadside assistance request has been submitted.",
      })

      navigate("/user/requests")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create request",
        description: error.response?.data?.message || "There was an error submitting your request. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
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

  // Helper để lấy center hợp lệ cho map
  function getMapCenter(services: Service[]): [number, number] {
    for (const s of services) {
      if (s.company && typeof s.company.latitude === 'number' && typeof s.company.longitude === 'number') {
        return [s.company.latitude, s.company.longitude]
      }
    }
    return [21, 105.8]
  }

  // Custom icon cho vị trí xe (user), có thể thay iconUrl nếu muốn
  const userIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto max-w-2xl space-y-6">
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Create Rescue Request</h1>
        </div>
        <p className="text-muted-foreground">Fill out the form below to request roadside assistance.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex justify-between">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`flex flex-1 items-center ${step < 4 ? "after:content-[''] after:h-[2px] after:flex-1 after:mx-2 after:bg-muted" : ""}`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                currentStep === step
                  ? "border-primary bg-primary text-primary-foreground"
                  : currentStep > step
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-muted bg-muted/20 text-muted-foreground"
              }`}
            >
              {step}
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Service Information"}
              {currentStep === 2 && "Select Nearby Service"}
              {currentStep === 3 && "Vehicle Information"}
              {currentStep === 4 && "Review & Submit"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Select the type of service you need and your location"}
              {currentStep === 2 && "Choose a nearby service provider for your request"}
              {currentStep === 3 && "Provide details about your vehicle"}
              {currentStep === 4 && "Review your request details before submitting"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={e => e.preventDefault()}>
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value) => handleSelectChange("serviceType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Your Location</Label>
                    <div className="flex gap-2">
                      <Input
                        id="location"
                        name="location"
                        placeholder="Enter your location"
                        value={formData.location}
                        onChange={handleChange}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={handleUseCurrentLocation}>
                        <MapPin className="mr-2 h-4 w-4" />
                        Use GPS
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Problem Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe your issue in detail"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <Button type="button" onClick={fetchNearbyServices} disabled={isLoadingNearby || !formData.location || !formData.serviceTypeEnum}>
                    {isLoadingNearby ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Find Nearby Services
                  </Button>
                  <div className="text-sm text-muted-foreground">You can select a service by clicking a marker on the map or choosing from the list below.</div>
                  {nearbyServices.length > 0 && (
                    <div style={{ height: 350, width: "100%", marginBottom: 16 }}>
                      <MapContainer
                        center={getMapCenter(nearbyServices)}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                        scrollWheelZoom={true}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {/* User vehicle position marker */}
                        {formData.location && formData.location.includes(',') && (() => {
                          const [userLat, userLng] = formData.location.split(',').map(Number)
                          return (
                            <Marker position={[userLat, userLng]} icon={userIcon}>
                              <Popup>
                                <div><b>Your vehicle location</b></div>
                              </Popup>
                            </Marker>
                          )
                        })()}
                        {nearbyServices.map((service) =>
                          service.company?.latitude && service.company?.longitude ? (
                            <Marker
                              key={service.id}
                              position={[service.company.latitude, service.company.longitude]}
                              eventHandlers={{
                                click: () => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    selectedNearbyService: service.id,
                                  }))
                                },
                              }}
                              icon={
                                formData.selectedNearbyService === service.id
                                  ? new L.Icon.Default({ className: "selected-marker" })
                                  : new L.Icon.Default()
                              }
                            >
                              <Popup>
                                <div>
                                  <div className="font-semibold">{service.name}</div>
                                  <div>{service.description}</div>
                                  <div>Price: {service.price}</div>
                                  <div>Company: {service.company?.name}</div>
                                  <button
                                    className="mt-2 px-2 py-1 bg-primary text-white rounded"
                                    type="button"
                                    onMouseDown={e => {
                                      e.stopPropagation();
                                      setFormData(prev => ({
                                        ...prev,
                                        selectedNearbyService: service.id,
                                      }));
                                    }}
                                  >
                                    Select this service
                                  </button>
                                </div>
                              </Popup>
                            </Marker>
                          ) : null
                        )}
                      </MapContainer>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleMake">Vehicle Make</Label>
                    <Input
                      id="vehicleMake"
                      name="vehicleMake"
                      placeholder="e.g., Toyota, Honda, Ford"
                      value={formData.vehicleMake}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleModel">Vehicle Model</Label>
                    <Input
                      id="vehicleModel"
                      name="vehicleModel"
                      placeholder="e.g., Camry, Civic, F-150"
                      value={formData.vehicleModel}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleYear">Vehicle Year</Label>
                    <Input
                      id="vehicleYear"
                      name="vehicleYear"
                      placeholder="e.g., 2020"
                      value={formData.vehicleYear}
                      onChange={handleChange}
                      type="number"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-2">Service Information</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Service Type:</span>{" "}
                        {services.find((s) => s.id === formData.serviceType)?.name}
                      </p>
                      <p>
                        <span className="font-medium">Location:</span> {formData.location}
                      </p>
                      <p>
                        <span className="font-medium">Description:</span> {formData.description}
                      </p>
                      <p>
                        <span className="font-medium">Selected Service:</span> {nearbyServices.find((s) => s.id === formData.selectedNearbyService)?.name}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-2">Vehicle Information</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Make:</span> {formData.vehicleMake}
                      </p>
                      <p>
                        <span className="font-medium">Model:</span> {formData.vehicleModel}
                      </p>
                      <p>
                        <span className="font-medium">Year:</span> {formData.vehicleYear}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <h3 className="font-semibold text-yellow-800">Important Notice</h3>
                        <p className="text-sm text-yellow-700">
                          By submitting this request, you agree to our terms of service and privacy policy. A service fee
                          may be charged based on the type of service and distance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
                {currentStep < 4 ? (
                  <Button type="button" onClick={nextStep} disabled={currentStep === 2 && !formData.selectedNearbyService}>
                    Next
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSubmit} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Request
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
