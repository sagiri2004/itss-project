"use client";

import React from "react";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, MapPin, AlertTriangle, Maximize2, X } from "lucide-react";
import api from "@/services/api";
import { uploadImageToCloudinary } from "@/services/cloudinary-service";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaCar, FaMapMarkerAlt, FaInfoCircle, FaUpload } from "react-icons/fa";
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  companyName: string;
  distance?: number;
  averageRating?: number;
  totalRatings?: number;
  company?: {
    id?: string;
    latitude: number;
    longitude: number;
    name: string;
    phone?: string;
    address?: {
      fullAddress: string;
    };
  };
}

interface RequestData {
  rescueServiceId: string;
  location: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  description: string;
}

interface Rating {
  id: string;
  userId: string;
  userName: string;
  stars: number;
  comment: string;
  createdAt: string;
}

export default function CreateRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState({
    serviceType: "",
    location: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    description: "",
    useCurrentLocation: false,
    selectedNearbyService: null as string | null,
  });
  const [nearbyServices, setNearbyServices] = useState<Service[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<
    [number, number] | null
  >(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [vehicleInfo, setVehicleInfo] = useState({
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    color: "",
    description: "",
  });
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<Service | null>(null);
  const [serviceRatings, setServiceRatings] = useState<Rating[]>([]);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
  const [selectedServiceObject, setSelectedServiceObject] = useState<Service | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.rescueServices.getServices();
      setServices(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch services. Please try again.",
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUseCurrentLocation = async () => {
    try {
      const isMobile = Capacitor.isNativePlatform();
      
      if (isMobile) {
        // Kiểm tra quyền truy cập vị trí
        const permissionStatus = await Geolocation.checkPermissions();
        
        if (permissionStatus.location === 'prompt' || permissionStatus.location === 'denied') {
          // Hiển thị dialog yêu cầu quyền
          const requestStatus = await Geolocation.requestPermissions();
          
          if (requestStatus.location !== 'granted') {
            toast({
              variant: "destructive",
              title: "Location permission required",
              description: "Please enable location access in your device settings to use this feature.",
            });
            return;
          }
        }

        // Lấy vị trí hiện tại với độ chính xác cao
        const coordinates = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });

        const { latitude, longitude } = coordinates.coords;
        setFormData((prev) => ({
          ...prev,
          useCurrentLocation: true,
          location: `${latitude},${longitude}`,
        }));

        toast({
          title: "Location detected",
          description: "Using your current location for this request.",
        });
      } else {
        // Fallback cho web browser
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setFormData((prev) => ({
                ...prev,
                useCurrentLocation: true,
                location: `${latitude},${longitude}`,
              }));

              toast({
                title: "Location detected",
                description: "Using your current location for this request.",
              });
            },
            (error) => {
              console.error('Geolocation error:', error);
              toast({
                variant: "destructive",
                title: "Location error",
                description: "Failed to get your location. Please enter it manually.",
              });
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        } else {
          toast({
            variant: "destructive",
            title: "Location not supported",
            description: "Your browser does not support geolocation. Please enter your location manually.",
          });
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
      toast({
        variant: "destructive",
        title: "Location error",
        description: "Failed to get your location. Please enter it manually.",
      });
    }
  };

  const fetchNearbyServices = async () => {
    setIsLoadingNearby(true);
    try {
      const [lat, lng] = formData.location.split(",").map(Number);
      const response = await api.rescueServices.getNearbyServices({
        latitude: lat,
        longitude: lng,
        serviceType: formData.serviceType,
        limit: 5,
      });
      setNearbyServices(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch nearby services. Please try again.",
      });
    } finally {
      setIsLoadingNearby(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload an image file",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Image size should be less than 5MB",
      });
      return;
    }

    setUploadedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    // Validate all required fields from formData and vehicleInfo
    const isVehicleInfoValid =
      vehicleInfo.make &&
      vehicleInfo.model &&
      vehicleInfo.year &&
      vehicleInfo.licensePlate &&
      vehicleInfo.color;

    if (
      !formData.serviceType ||
      !formData.location ||
      !formData.description ||
      !isVehicleInfoValid
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please complete all required fields",
      });
      return;
    }

    let latitude, longitude;
    if (formData.location && formData.location.includes(",")) {
      [latitude, longitude] = formData.location.split(",").map(Number);
    }

    setIsLoading(true);
    try {
      let vehicleImageUrl = null;
      // Upload image if exists
      if (uploadedImage) {
        setIsUploading(true);
        try {
          const result = await uploadImageToCloudinary(uploadedImage);
          vehicleImageUrl = result.secure_url;
        } catch (error) {
          console.error("Error uploading image:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to upload image",
          });
          setIsUploading(false);
          setIsLoading(false);
          return;
        }
        setIsUploading(false);
      }

      const requestData = {
        rescueServiceId: formData.selectedNearbyService,
        description: formData.description,
        latitude,
        longitude,
        vehicleImageUrl,
        vehicleMake: vehicleInfo.make,
        vehicleModel: vehicleInfo.model,
        vehicleYear: vehicleInfo.year,
        vehicleLicensePlate: vehicleInfo.licensePlate,
        vehicleColor: vehicleInfo.color,
      };

      await api.rescueRequests.createRequest(requestData);
      toast({
        title: "Success",
        description: "Rescue request created successfully",
      });
      navigate("/user/requests");
    } catch (error: any) {
      console.error("Error creating request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create request",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

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
  };

  // Helper để lấy center hợp lệ cho map
  function getMapCenter(services: Service[]): [number, number] {
    for (const s of services) {
      if (
        s.company &&
        typeof s.company.latitude === "number" &&
        typeof s.company.longitude === "number"
      ) {
        return [s.company.latitude, s.company.longitude];
      }
    }
    return [21, 105.8];
  }

  // Custom icon cho vị trí xe (user), có thể thay iconUrl nếu muốn
  const userIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  const handleMarkerClick = async (service: Service) => {
    setSelectedServiceDetail(service);
    setIsLoadingRatings(true);
    try {
      const res = await api.rescueServices.getServiceRatings(service.id);
      setServiceRatings(res.data);
    } catch (e) {
      setServiceRatings([]);
    }
    setIsLoadingRatings(false);
    setFormData(prev => ({ ...prev, selectedNearbyService: service.id }));
    setSelectedServiceObject(service);
  };

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-medium text-gray-700">
        <FaCar className="text-blue-600" />
        <span>Vehicle Information</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Make
          </label>
          <input
            type="text"
            value={vehicleInfo.make}
            onChange={(e) =>
              setVehicleInfo({ ...vehicleInfo, make: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="e.g., Toyota"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Model
          </label>
          <input
            type="text"
            value={vehicleInfo.model}
            onChange={(e) =>
              setVehicleInfo({ ...vehicleInfo, model: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="e.g., Camry"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Year
          </label>
          <input
            type="number"
            value={vehicleInfo.year}
            onChange={(e) =>
              setVehicleInfo({ ...vehicleInfo, year: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="e.g., 2020"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            License Plate
          </label>
          <input
            type="text"
            value={vehicleInfo.licensePlate}
            onChange={(e) =>
              setVehicleInfo({ ...vehicleInfo, licensePlate: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="e.g., ABC123"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Color
          </label>
          <input
            type="text"
            value={vehicleInfo.color}
            onChange={(e) =>
              setVehicleInfo({ ...vehicleInfo, color: e.target.value })
            }
            className="mt-1 block w-full rounded-md border border-input bg-background text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="e.g., Red"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Vehicle Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-input rounded-md bg-background">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <div className="space-y-2">
                  <img
                    src={imagePreview}
                    alt="Vehicle preview"
                    className="mx-auto h-32 w-auto object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedImage(null);
                      setImagePreview(null);
                    }}
                    className="text-sm text-red-600 hover:text-red-500"
                  >
                    Remove image
                  </button>
                </div>
              ) : (
                <>
                  <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-6 min-h-screen flex flex-col justify-start"
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Create Rescue Request
          </h1>
        </div>
        <p className="text-muted-foreground">
          Fill out the form below to request roadside assistance.
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between max-w-xl mx-auto w-full mb-8"
      >
        {[1, 2, 3, 4].map((step, idx, arr) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2
                  ${
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
            {idx < arr.length - 1 && (
              <div className="flex-1 h-0.5 bg-muted mx-2" />
            )}
          </React.Fragment>
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
              {currentStep === 1 &&
                "Select the type of service you need and your location"}
              {currentStep === 2 &&
                "Choose a nearby service provider for your request"}
              {currentStep === 3 && "Provide details about your vehicle"}
              {currentStep === 4 &&
                "Review your request details before submitting"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => e.preventDefault()}>
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value) =>
                        handleSelectChange("serviceType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TIRE_REPLACEMENT">
                          Tire Replacement
                        </SelectItem>
                        <SelectItem value="TIRE_REPAIR">Tire Repair</SelectItem>
                        <SelectItem value="FUEL_DELIVERY">
                          Fuel Delivery
                        </SelectItem>
                        <SelectItem value="TOWING">Towing</SelectItem>
                        <SelectItem value="ON_SITE_REPAIR">
                          On-site Repair
                        </SelectItem>
                        <SelectItem value="BATTERY_JUMP_START">
                          Battery Jump Start
                        </SelectItem>
                        <SelectItem value="LOCKOUT_SERVICE">
                          Lockout Service
                        </SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
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
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleUseCurrentLocation}
                      >
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
                  <Button
                    type="button"
                    onClick={fetchNearbyServices}
                    disabled={
                      isLoadingNearby ||
                      !formData.location ||
                      !formData.serviceType
                    }
                  >
                    {isLoadingNearby ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Find Nearby Services
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    You can select a service by clicking a marker on the map or
                    choosing from the list below.
                  </div>

                  {nearbyServices.length > 0 && (
                    <>
                      {isMapFullScreen ? (
                        <div className="fixed inset-x-0 top-16 bottom-0 z-40 bg-black/80 flex flex-col">
                          <div className="flex justify-end p-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setIsMapFullScreen(false)}
                            >
                              <X className="h-6 w-6 text-white" />
                            </Button>
                          </div>
                          <div className="flex-1">
                            <MapContainer
                              center={getMapCenter(nearbyServices)}
                              zoom={13}
                              style={{ height: "100%", width: "100%" }}
                              scrollWheelZoom={true}
                            >
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              {formData.location &&
                                formData.location.includes(",") &&
                                (() => {
                                  const [userLat, userLng] = formData.location
                                    .split(",")
                                    .map(Number);
                                  return (
                                    <Marker
                                      position={[userLat, userLng]}
                                      icon={userIcon}
                                    >
                                      <Popup>
                                        <div>
                                          <b>Your vehicle location</b>
                                        </div>
                                      </Popup>
                                    </Marker>
                                  );
                                })()}
                              {nearbyServices.map((service) =>
                                service.company?.latitude &&
                                service.company?.longitude ? (
                                  <Marker
                                    key={service.id}
                                    position={[
                                      service.company.latitude,
                                      service.company.longitude,
                                    ]}
                                    eventHandlers={{
                                      click: () => handleMarkerClick(service),
                                    }}
                                    icon={
                                      formData.selectedNearbyService ===
                                      service.id
                                        ? new L.Icon.Default({
                                            className: "selected-marker",
                                          })
                                        : new L.Icon.Default()
                                    }
                                  >
                                    <Popup>
                                      <div className="space-y-1">
                                        <div className="font-semibold text-base">{service.name}</div>
                                        <div className="text-sm text-muted-foreground mb-1">{service.description}</div>
                                        <div className="text-xs mb-1">
                                          <span className="font-medium">Type:</span> {service.type}
                                        </div>
                                        <div className="text-xs mb-1">
                                          <span className="font-medium">Price:</span> {service.price}
                                        </div>
                                        <div className="text-xs mb-1">
                                          <span className="font-medium">Distance:</span> {service.distance ? service.distance.toFixed(2) + ' km' : 'N/A'}
                                        </div>
                                        <div className="text-xs mb-1">
                                          <span className="font-medium">Company:</span> {service.company?.name}
                                        </div>
                                        <div className="text-xs mb-1">
                                          <span className="font-medium">Phone:</span> {service.company?.phone}
                                        </div>
                                        <div className="text-xs mb-1">
                                          <span className="font-medium">Address:</span> {service.company?.address?.fullAddress}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs mb-1">
                                          <span className="font-medium">Rating:</span>
                                          <span>{service.averageRating?.toFixed(1) || '0.0'}</span>
                                          <span>({service.totalRatings || 0} reviews)</span>
                                        </div>
                                        <button
                                          className="mt-2 px-2 py-1 bg-primary text-white rounded w-full"
                                          type="button"
                                          onMouseDown={(e) => {
                                            e.stopPropagation();
                                            handleMarkerClick(service);
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
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-end mb-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="md:hidden"
                              onClick={() => setIsMapFullScreen(true)}
                              title="Phóng to bản đồ"
                            >
                              <Maximize2 className="h-5 w-5" />
                            </Button>
                          </div>
                          <div
                            style={{
                              height: "400px",
                              width: "100%",
                              marginBottom: 16,
                              minHeight: 300,
                            }}
                          >
                            <MapContainer
                              center={getMapCenter(nearbyServices)}
                              zoom={13}
                              style={{ height: "100%", width: "100%" }}
                              scrollWheelZoom={true}
                            >
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              {/* User vehicle position marker */}
                              {formData.location &&
                                formData.location.includes(",") &&
                                (() => {
                                  const [userLat, userLng] = formData.location
                                    .split(",")
                                    .map(Number);
                                  return (
                                    <Marker
                                      position={[userLat, userLng]}
                                      icon={userIcon}
                                    >
                                      <Popup>
                                        <div>
                                          <b>Your vehicle location</b>
                                        </div>
                                      </Popup>
                                    </Marker>
                                  );
                                })()}
                              {nearbyServices.map((service) =>
                                service.company?.latitude &&
                                service.company?.longitude ? (
                                  <Marker
                                    key={service.id}
                                    position={[
                                      service.company.latitude,
                                      service.company.longitude,
                                    ]}
                                    eventHandlers={{
                                      click: () => handleMarkerClick(service),
                                    }}
                                    icon={
                                      formData.selectedNearbyService ===
                                      service.id
                                        ? new L.Icon.Default({
                                            className: "selected-marker",
                                          })
                                        : new L.Icon.Default()
                                    }
                                  >
                                    <Popup>
                                      <div className="space-y-1">
                                        <div className="font-semibold text-base">{service.name}</div>
                                        <div className="text-sm text-muted-foreground mb-1">{service.description}</div>
                                        <div className="text-xs mb-1">
                                          <span className="font-medium">Type:</span> {service.type}
                                        </div>
                                        <div className="text-xs mb-1">
                                          <span className="font-medium">Price:</span> {service.price}
                                        </div>
                                        <div className="text-xs mb-1">
                                          <span className="font-medium">Distance:</span> {service.distance ? service.distance.toFixed(2) + ' km' : 'N/A'}
                                        </div>
                                        <div className="text-xs mb-1">
                                          <span className="font-medium">Company:</span> {service.company?.name}
                                        </div>
                                        <div className="text-xs mb-1">
                                          <span className="font-medium">Phone:</span> {service.company?.phone}
                                        </div>
                                        <div className="text-xs mb-1">
                                          <span className="font-medium">Address:</span> {service.company?.address?.fullAddress}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs mb-1">
                                          <span className="font-medium">Rating:</span>
                                          <span>{service.averageRating?.toFixed(1) || '0.0'}</span>
                                          <span>({service.totalRatings || 0} reviews)</span>
                                        </div>
                                        <button
                                          className="mt-2 px-2 py-1 bg-primary text-white rounded w-full"
                                          type="button"
                                          onMouseDown={(e) => {
                                            e.stopPropagation();
                                            handleMarkerClick(service);
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
                        </>
                      )}
                    </>
                  )}
                </div>
              )}

              {currentStep === 3 && renderStep3()}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-2">Service Information</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Service Name:</span> {selectedServiceObject?.name}
                      </p>
                      <p>
                        <span className="font-medium">Description:</span> {selectedServiceObject?.description}
                      </p>
                      <p>
                        <span className="font-medium">Company:</span> {selectedServiceObject?.company?.name}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span> {selectedServiceObject?.company?.phone}
                      </p>
                      <p>
                        <span className="font-medium">Address:</span> {selectedServiceObject?.company?.address?.fullAddress}
                      </p>
                      <p>
                        <span className="font-medium">Price:</span> {selectedServiceObject?.price}
                      </p>
                      <p>
                        <span className="font-medium">Type:</span> {selectedServiceObject?.type}
                      </p>
                      <p>
                        <span className="font-medium">Distance:</span> {selectedServiceObject?.distance?.toFixed(2)} km
                      </p>
                      <p>
                        <span className="font-medium">Rating:</span> {selectedServiceObject?.averageRating?.toFixed(1)} ({selectedServiceObject?.totalRatings} reviews)
                      </p>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (selectedServiceObject?.company?.id) {
                            navigate(`/company/details/${selectedServiceObject.company.id}`);
                          }
                        }}
                      >
                        View Company Details
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-2">User Reviews</h3>
                    <div className="flex gap-2 my-2">
                      <button
                        className={`px-2 py-1 rounded border text-xs flex items-center gap-1 ${selectedRatingFilter === null ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}
                        onClick={() => setSelectedRatingFilter(null)}
                      >
                        All
                      </button>
                      {[5,4,3,2,1].map(star => (
                        <button
                          key={star}
                          className={`px-2 py-1 rounded border text-xs flex items-center gap-1 ${selectedRatingFilter === star ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}
                          onClick={() => setSelectedRatingFilter(star)}
                        >
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {star}
                        </button>
                      ))}
                    </div>
                    {isLoadingRatings ? (
                      <div>Loading ratings...</div>
                    ) : (serviceRatings.length === 0 ? (
                      <div className="text-muted-foreground">No reviews yet.</div>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {serviceRatings
                          .filter(rating => selectedRatingFilter === null || rating.stars === selectedRatingFilter)
                          .map(rating => (
                            <li key={rating.id} className="border-b pb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{rating.userName}</span>
                                <span className="flex gap-0.5">
                                  {[1,2,3,4,5].map(i => (
                                    <Star key={i} className={`h-3 w-3 ${i <= rating.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                  ))}
                                </span>
                                <span className="text-xs text-muted-foreground">{new Date(rating.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="text-sm">{rating.comment}</div>
                            </li>
                          ))
                        }
                        {serviceRatings.filter(rating => selectedRatingFilter === null || rating.stars === selectedRatingFilter).length === 0 && (
                          <div className="text-muted-foreground text-sm">No reviews for this filter.</div>
                        )}
                      </ul>
                    ))}
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-2">Vehicle Information</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Make:</span> {vehicleInfo.make}
                      </p>
                      <p>
                        <span className="font-medium">Model:</span> {vehicleInfo.model}
                      </p>
                      <p>
                        <span className="font-medium">Year:</span> {vehicleInfo.year}
                      </p>
                      <p>
                        <span className="font-medium">License Plate:</span> {vehicleInfo.licensePlate}
                      </p>
                      <p>
                        <span className="font-medium">Color:</span> {vehicleInfo.color}
                      </p>
                      {imagePreview && (
                        <div>
                          <span className="font-medium">Vehicle Image:</span>
                          <br />
                          <img
                            src={imagePreview}
                            alt="Vehicle preview"
                            className="mt-2 h-32 w-auto object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <h3 className="font-semibold text-yellow-800">
                          Important Notice
                        </h3>
                        <p className="text-sm text-yellow-700">
                          By submitting this request, you agree to our terms of
                          service and privacy policy. A service fee may be
                          charged based on the type of service and distance.
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
                  <Button
                    type="button"
                    onClick={nextStep}
                    // disabled={currentStep === 2 && !formData.selectedNearbyService}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit Request
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {selectedServiceDetail && (
        <div className="mt-4 p-4 rounded-lg border bg-card shadow">
          <h3 className="font-bold text-lg mb-2">{selectedServiceDetail.name}</h3>
          <div className="mb-2 text-muted-foreground">{selectedServiceDetail.description}</div>
          <div className="mb-2">
            <span className="font-medium">Company:</span> {selectedServiceDetail.company?.name}
          </div>
          <div className="mb-2">
            <span className="font-medium">Phone:</span> {selectedServiceDetail.company?.phone}
          </div>
          <div className="mb-2">
            <span className="font-medium">Address:</span> {selectedServiceDetail.company?.address?.fullAddress}
          </div>
          <div className="mb-2">
            <span className="font-medium">Price:</span> {selectedServiceDetail.price}
          </div>
          <div className="mb-2">
            <span className="font-medium">Type:</span> {selectedServiceDetail.type}
          </div>
          <div className="mb-2">
            <span className="font-medium">Distance:</span> {selectedServiceDetail.distance?.toFixed(2)} km
          </div>
          <div className="mb-2">
            <span className="font-medium">Rating:</span> {selectedServiceDetail.averageRating?.toFixed(1)} ({selectedServiceDetail.totalRatings} reviews)
          </div>
          <div className="mb-2">
            <span className="font-medium">User Reviews:</span>
            <div className="flex gap-2 my-2">
              <button
                className={`px-2 py-1 rounded border text-xs flex items-center gap-1 ${selectedRatingFilter === null ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}
                onClick={() => setSelectedRatingFilter(null)}
              >
                All
              </button>
              {[5,4,3,2,1].map(star => (
                <button
                  key={star}
                  className={`px-2 py-1 rounded border text-xs flex items-center gap-1 ${selectedRatingFilter === star ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}
                  onClick={() => setSelectedRatingFilter(star)}
                >
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {star}
                </button>
              ))}
            </div>
            {isLoadingRatings ? (
              <div>Loading ratings...</div>
            ) : (serviceRatings.length === 0 ? (
              <div className="text-muted-foreground">No reviews yet.</div>
            ) : (
              <ul className="mt-2 space-y-2">
                {serviceRatings
                  .filter(rating => selectedRatingFilter === null || rating.stars === selectedRatingFilter)
                  .map(rating => (
                    <li key={rating.id} className="border-b pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rating.userName}</span>
                        <span className="flex gap-0.5">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`h-3 w-3 ${i <= rating.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </span>
                        <span className="text-xs text-muted-foreground">{new Date(rating.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm">{rating.comment}</div>
                    </li>
                  ))
                }
                {serviceRatings.filter(rating => selectedRatingFilter === null || rating.stars === selectedRatingFilter).length === 0 && (
                  <div className="text-muted-foreground text-sm">No reviews for this filter.</div>
                )}
              </ul>
            ))}
          </div>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                if (selectedServiceDetail.company?.id) {
                  navigate(`/company/details/${selectedServiceDetail.company.id}`);
                }
              }}
            >
              View Company Details
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
