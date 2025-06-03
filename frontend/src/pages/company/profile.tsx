"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { MapPin, Phone, Building2 } from "lucide-react"
import api from "@/services/api"
import { useParams } from "react-router-dom"
import { MapView } from "@/components/map/map-view"
import { MapClickEffect } from "@/components/map/map-click-effect"

interface Address {
  street: string
  ward: string
  district: string | null
  city: string
  country: string
  fullAddress: string
  latitude: number
  longitude: number
}

interface CompanyProfileData {
  id: string
  name: string
  phone: string
  description: string
  address: Address
  latitude: number
  longitude: number
  userId: string
}

export default function CompanyProfile() {
  const { user } = useAuth()
  const { id: paramId } = useParams()
  const { toast } = useToast()
  const [companyData, setCompanyData] = useState<CompanyProfileData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<CompanyProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      const companyId = paramId || user?.companyId
      if (!companyId) return
      setIsLoading(true)
      try {
        const res = await api.rescueCompanies.getCompanyById(companyId)
        setCompanyData(res.data)
        setFormData(res.data)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.response?.data?.message || "Failed to load company profile",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchCompanyProfile()
  }, [user, paramId, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return
    const { name, value } = e.target
    if (name.startsWith("address.")) {
      const key = name.split(".")[1]
      setFormData({
        ...formData,
        address: { ...formData.address, [key]: value },
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSave = async () => {
    if (!formData) return
    setIsLoading(true)
    try {
      // Chỉ gửi các trường cần thiết
      const payload = {
        name: formData.name,
        phone: formData.phone,
        description: formData.description,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      }
      const response = await api.rescueCompanies.updateCompany(formData.id, payload)
      setCompanyData(response.data)
      setFormData(response.data)
      setIsEditing(false)
      toast({
        title: "Profile updated",
        description: "Your company profile has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.response?.data?.message || "There was an error updating your profile.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(companyData)
    setIsEditing(false)
  }

  // Handler for map click
  const handleMapClick = async (lat: number, lng: number) => {
    if (!isEditing || !formData) return
    // Gọi nominatim reverse geocoding
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const data = await res.json()
      // Parse address fields
      const address = data.address || {}
      setFormData({
        ...formData,
        latitude: lat,
        longitude: lng,
        address: {
          street: address.road || "",
          ward: address.suburb || address.quarter || address.neighbourhood || "",
          district: address.city_district || address.district || address.county || "",
          city: address.city || address.town || address.village || "",
          country: address.country || "",
          fullAddress: data.display_name || "",
          latitude: lat,
          longitude: lng,
        },
      })
    } catch (err) {
      // Nếu lỗi, chỉ cập nhật lat/lon
      setFormData({
        ...formData,
        latitude: lat,
        longitude: lng,
        address: {
          ...formData.address,
          latitude: lat,
          longitude: lng,
        },
      })
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 260, damping: 20 },
    },
  }

  if (isLoading || !formData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-muted-foreground">Loading company profile...</span>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={`https://avatar.vercel.sh/${formData.name}`} />
                <AvatarFallback className="text-lg">{formData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-bold text-xl">{formData.name}</div>
                <div className="text-muted-foreground">ID: {formData.id}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Company Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} disabled={!isEditing} rows={3} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Map Picker */}
            <div className="mb-4 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!isEditing}
                onClick={() => {
                  if (!navigator.geolocation) {
                    toast({
                      variant: "destructive",
                      title: "Geolocation not supported",
                      description: "Trình duyệt của bạn không hỗ trợ định vị vị trí.",
                    })
                    return
                  }
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      const { latitude, longitude } = pos.coords
                      handleMapClick(latitude, longitude)
                    },
                    (err) => {
                      toast({
                        variant: "destructive",
                        title: "Không lấy được vị trí",
                        description: err.message,
                      })
                    }
                  )
                }}
              >
                Lấy tọa độ hiện tại
              </Button>
              <span className="text-xs text-muted-foreground">(Chỉ hoạt động khi Edit)</span>
            </div>
            <div>
              <Label className="mb-2 block">Select Location on Map</Label>
              <MapView
                height="300px"
                center={[
                  Number(formData.latitude) || 21.0285,
                  Number(formData.longitude) || 105.8542,
                ]}
                zoom={15}
                markers={[
                  {
                    id: formData.id,
                    position: [Number(formData.latitude), Number(formData.longitude)],
                    type: "user",
                    label: formData.name,
                  },
                ]}
                onMarkerClick={() => {}}
                showControls={true}
              />
            </div>
            {/* Map click handler effect */}
            {isEditing && (
              <MapClickEffect
                onClick={handleMapClick}
                mapCenter={[
                  Number(formData.latitude) || 21.0285,
                  Number(formData.longitude) || 105.8542,
                ]}
              />
            )}
            {/* Address fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="address.street">Street</Label>
                <Input id="address.street" name="address.street" value={formData.address.street} disabled readOnly />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address.ward">Ward</Label>
                <Input id="address.ward" name="address.ward" value={formData.address.ward || ""} disabled readOnly />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address.district">District</Label>
                <Input id="address.district" name="address.district" value={formData.address.district || ""} disabled readOnly />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address.city">City</Label>
                <Input id="address.city" name="address.city" value={formData.address.city} disabled readOnly />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address.country">Country</Label>
                <Input id="address.country" name="address.country" value={formData.address.country} disabled readOnly />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="address.fullAddress">Full Address</Label>
                <Input id="address.fullAddress" name="address.fullAddress" value={formData.address.fullAddress} disabled readOnly />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address.latitude">Latitude</Label>
                <Input id="address.latitude" name="address.latitude" value={formData.address.latitude} disabled readOnly />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address.longitude">Longitude</Label>
                <Input id="address.longitude" name="address.longitude" value={formData.address.longitude} disabled readOnly />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="latitude">Company Latitude</Label>
                <Input id="latitude" name="latitude" value={formData.latitude} onChange={handleInputChange} disabled={!isEditing} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="longitude">Company Longitude</Label>
                <Input id="longitude" name="longitude" value={formData.longitude} onChange={handleInputChange} disabled={!isEditing} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
