"use client"

import type React from "react"

import { useState } from "react"
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

// Mock data
const serviceTypes = [
  { id: "flat-tire", name: "Flat Tire Replacement" },
  { id: "battery", name: "Battery Jump Start" },
  { id: "towing", name: "Vehicle Towing" },
  { id: "fuel", name: "Fuel Delivery" },
  { id: "lockout", name: "Lockout Service" },
  { id: "winching", name: "Winching" },
  { id: "other", name: "Other" },
]

export default function CreateRequest() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    serviceType: "",
    location: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    description: "",
    useCurrentLocation: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUseCurrentLocation = () => {
    setFormData((prev) => ({
      ...prev,
      useCurrentLocation: true,
      location: "Current Location (GPS)",
    }))

    toast({
      title: "Location detected",
      description: "Using your current location for this request.",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Request created successfully",
        description: "Your roadside assistance request has been submitted.",
      })

      navigate("/user/requests")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create request",
        description: "There was an error submitting your request. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1)
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

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mx-auto max-w-2xl space-y-6">
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Create Rescue Request</h1>
        </div>
        <p className="text-muted-foreground">Fill out the form below to request roadside assistance.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex justify-between">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`flex flex-1 items-center ${step < 3 ? "after:content-[''] after:h-[2px] after:flex-1 after:mx-2 after:bg-muted" : ""}`}
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
              {currentStep === 2 && "Vehicle Information"}
              {currentStep === 3 && "Review & Submit"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Select the type of service you need and your location"}
              {currentStep === 2 && "Provide details about your vehicle"}
              {currentStep === 3 && "Review your request details before submitting"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
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
                        {serviceTypes.map((service) => (
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
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 font-medium">Service Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Service Type:</div>
                      <div>{serviceTypes.find((s) => s.id === formData.serviceType)?.name || "Not specified"}</div>

                      <div className="text-muted-foreground">Location:</div>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {formData.location || "Not specified"}
                      </div>

                      <div className="text-muted-foreground">Description:</div>
                      <div>{formData.description || "Not provided"}</div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="mb-2 font-medium">Vehicle Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Make:</div>
                      <div>{formData.vehicleMake || "Not specified"}</div>

                      <div className="text-muted-foreground">Model:</div>
                      <div>{formData.vehicleModel || "Not specified"}</div>

                      <div className="text-muted-foreground">Year:</div>
                      <div>{formData.vehicleYear || "Not specified"}</div>
                    </div>
                  </div>

                  <div className="flex items-center rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-800/30 dark:bg-amber-900/20 dark:text-amber-500">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    <p className="text-sm">
                      By submitting this request, you agree to the terms and conditions of our service.
                    </p>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                Previous
              </Button>
            ) : (
              <div></div>
            )}

            {currentStep < 3 ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  )
}
