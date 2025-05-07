"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Building2, Camera, MapPin, Mail, Phone, Shield, Clock, Trash } from "lucide-react"

// Mock company data
const mockCompanyData = {
  id: "comp-001",
  name: "FastFix Roadside",
  logo: "",
  description:
    "24/7 roadside assistance for all your vehicle needs. From flat tires to towing, we've got you covered with fast and reliable service.",
  address: "123 Service Rd, Mechanics Town, MT 12345",
  phone: "+1 (555) 123-4567",
  email: "contact@fastfixroadside.com",
  website: "https://fastfixroadside.com",
  operatingHours: "24/7",
  serviceArea: "50 mile radius from Mechanics Town",
  serviceTypes: ["Towing", "Flat Tire", "Battery Jump", "Fuel Delivery", "Lockout"],
  isVerified: true,
  foundedYear: "2012",
  employees: "15",
  insuranceInfo: {
    provider: "SafeGuard Insurance",
    policyNumber: "SG123456789",
    expiryDate: "2024-05-15",
  },
}

export default function CompanyProfile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [companyData, setCompanyData] = useState(mockCompanyData)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(mockCompanyData)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked })
  }

  const handleSave = () => {
    // Update the company data
    setCompanyData(formData)
    setIsEditing(false)

    toast({
      title: "Profile updated",
      description: "Your company profile has been updated successfully.",
    })
  }

  const handleCancel = () => {
    // Reset form data to current company data
    setFormData(companyData)
    setIsEditing(false)
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
        <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        )}
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div variants={itemVariants} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Logo</CardTitle>
              <CardDescription>Your company logo used across the platform</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={companyData.logo || `https://avatar.vercel.sh/${companyData.name}`} />
                <AvatarFallback className="text-lg">{companyData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button variant="outline" size="sm">
                  <Camera className="mr-2 h-4 w-4" />
                  Change Logo
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>Your company's verification status</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {companyData.isVerified ? (
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-success/20 p-3 mb-2">
                    <Shield className="h-6 w-6 text-success" />
                  </div>
                  <p className="font-medium text-center">Verified Company</p>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    Your company has been verified by our team.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-muted p-3 mb-2">
                    <Shield className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-center">Not Verified</p>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    We need more information to verify your company.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Complete Verification
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
              <CardDescription>Details about your company's insurance</CardDescription>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Provider</p>
                    <p className="text-sm text-muted-foreground">{companyData.insuranceInfo.provider}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Policy Number</p>
                    <p className="text-sm text-muted-foreground">{companyData.insuranceInfo.policyNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Expiry Date</p>
                    <p className="text-sm text-muted-foreground">{companyData.insuranceInfo.expiryDate}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="insuranceProvider">Provider</Label>
                    <Input
                      id="insuranceProvider"
                      name="insuranceInfo.provider"
                      value={formData.insuranceInfo.provider}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="policyNumber">Policy Number</Label>
                    <Input
                      id="policyNumber"
                      name="insuranceInfo.policyNumber"
                      value={formData.insuranceInfo.policyNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      name="insuranceInfo.expiryDate"
                      type="date"
                      value={formData.insuranceInfo.expiryDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your company's basic details</CardDescription>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{companyData.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Established {companyData.foundedYear} • {companyData.employees} employees
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{companyData.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{companyData.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{companyData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Operating Hours</p>
                      <p className="text-sm text-muted-foreground">{companyData.operatingHours}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Company Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="foundedYear">Founded Year</Label>
                      <Input
                        id="foundedYear"
                        name="foundedYear"
                        value={formData.foundedYear}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="employees">Number of Employees</Label>
                      <Input id="employees" name="employees" value={formData.employees} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" value={formData.address} onChange={handleInputChange} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" value={formData.website} onChange={handleInputChange} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="operatingHours">Operating Hours</Label>
                    <Input
                      id="operatingHours"
                      name="operatingHours"
                      value={formData.operatingHours}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Information</CardTitle>
              <CardDescription>Details about the services you provide</CardDescription>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Services Offered</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {companyData.serviceTypes.map((service, index) => (
                          <Badge key={index} variant="outline">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Service Area</p>
                      <p className="text-sm text-muted-foreground">{companyData.serviceArea}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Description</p>
                      <p className="text-sm text-muted-foreground">{companyData.description}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="serviceArea">Service Area</Label>
                    <Input
                      id="serviceArea"
                      name="serviceArea"
                      value={formData.serviceArea}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isVerified"
                      checked={formData.isVerified}
                      onCheckedChange={(checked) => handleSwitchChange("isVerified", checked)}
                    />
                    <Label htmlFor="isVerified">Verified Company</Label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for your company account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
                <div>
                  <h4 className="font-medium text-destructive">Delete Company Account</h4>
                  <p className="text-sm text-muted-foreground">
                    This will permanently delete your company account and all associated data. This action cannot be
                    undone.
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
