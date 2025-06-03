"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { useNavigate } from "react-router-dom"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Search, Edit, Trash, Check, X, Eye } from "lucide-react"
import api from "@/services/api"
import { Star } from "lucide-react"

// Interface để đồng bộ với backend
interface Service {
  id: string
  name: string
  description: string
  price: number
  type: string
  companyId: string | null
  companyName: string | null
  distance: number | null
  averageRating: number | null
  totalRatings: number | null
  company?: {
    id: string
    name: string
    phone: string
    description: string
    latitude: number
    longitude: number
    address: {
      street: string
      ward: string
      district: string | null
      city: string
      country: string
      fullAddress: string
      latitude: number
      longitude: number
    }
    createdAt: string
  }
}

interface ServiceFormData {
  name: string
  description: string
  basePrice: string
  duration: string
  type?: string
}

interface Rating {
  id: string
  userId: string
  userName: string
  stars: number
  comment: string
  createdAt: string
}

export default function AdminServices() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [services, setServices] = useState<Service[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentService, setCurrentService] = useState<Service | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [detailService, setDetailService] = useState<Service | null>(null)
  const [serviceRatings, setServiceRatings] = useState<Rating[]>([])
  const [isRatingsLoading, setIsRatingsLoading] = useState(false)
  const [ratingsStatsMap, setRatingsStatsMap] = useState<Record<string, { averageRating: number; totalRatings: number }>>({})
  const ratingsFetchedRef = useRef(false)

  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    basePrice: "",
    duration: "",
  })

  // Fetch services when component mounts
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/login')
      return
    }

    const fetchServices = async () => {
      setIsLoading(true)
      try {
        const response = await api.rescueServices.getServices()
        setServices(response.data)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading services",
          description: error.response?.data?.message || "Could not load services"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [toast, user, navigate])

  // Fetch ratings for all services after services loaded (only once)
  useEffect(() => {
    if (services.length === 0 || ratingsFetchedRef.current) return
    ratingsFetchedRef.current = true
    const fetchAllRatings = async () => {
      const statsMap: Record<string, { averageRating: number; totalRatings: number }> = {}
      await Promise.all(
        services.map(async (service) => {
          try {
            const res = await api.ratings.getServiceRatings(service.id)
            const ratings = res.data
            const total = ratings.length
            const avg = total > 0 ? ratings.reduce((acc: number, r: any) => acc + r.stars, 0) / total : 0
            statsMap[service.id] = { averageRating: avg, totalRatings: total }
          } catch {
            statsMap[service.id] = { averageRating: 0, totalRatings: 0 }
          }
        })
      )
      setRatingsStatsMap(statsMap)
    }
    fetchAllRatings()
  }, [services])

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      basePrice: "",
      duration: "",
    })
    setCurrentService(null)
    setIsEditing(false)
  }

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        basePrice: service.price?.toString() || "",
        duration: service.distance?.toString() || "",
        type: service.type
      })
      setCurrentService(service)
      setIsEditing(true)
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs
    if (!formData.name || !formData.description || !formData.basePrice || !formData.duration) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      })
      return
    }

    try {
      // Create or update service
      if (isEditing && currentService) {
        const response = await api.rescueServices.updateService(currentService.id, {
          name: formData.name,
          description: formData.description,
          basePrice: Number.parseFloat(formData.basePrice),
          duration: Number.parseInt(formData.duration),
          type: formData.type
        })

        setServices(services.map((service) =>
          service.id === currentService.id ? response.data : service
        ))

        toast({
          title: "Service updated",
          description: `${formData.name} has been updated successfully.`,
        })
      } else {
        const response = await api.rescueServices.createService({
          name: formData.name,
          description: formData.description,
          basePrice: Number.parseFloat(formData.basePrice),
          duration: Number.parseInt(formData.duration),
          type: formData.type || 'STANDARD'
        })

        setServices([...services, response.data])

        toast({
          title: "Service created",
          description: `${formData.name} has been created successfully.`,
        })
      }

      handleCloseDialog()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to save service"
      })
    }
  }

  const toggleServiceStatus = async (id: string, isActive: boolean) => {
    try {
      await api.rescueServices.updateService(id, { isActive: !isActive })
      
      setServices(services.map((service) =>
        service.id === id ? { ...service, isActive: !isActive } : service
      ))

      toast({
        title: isActive ? "Service deactivated" : "Service activated",
        description: `Service has been ${isActive ? "deactivated" : "activated"}.`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update service status"
      })
    }
  }

  const deleteService = async (id: string) => {
    try {
      await api.rescueServices.deleteService(id)
      
      setServices(services.filter((service) => service.id !== id))

      toast({
        title: "Service removed",
        description: `Service has been removed from the platform.`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to delete service"
      })
    }
  }

  const openDetailDialog = async (service: Service) => {
    setDetailService(service)
    setDetailDialogOpen(true)
    setIsRatingsLoading(true)
    try {
      const res = await api.ratings.getServiceRatings(service.id)
      setServiceRatings(res.data)
    } catch {
      setServiceRatings([])
    } finally {
      setIsRatingsLoading(false)
    }
  }

  const closeDetailDialog = () => {
    setDetailDialogOpen(false)
    setDetailService(null)
    setServiceRatings([])
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Service Management</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Platform Services</CardTitle>
            <CardDescription>Manage the types of services available on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search services..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Total Ratings</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No services found. Try adjusting your search or add a new service.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>{service.description}</TableCell>
                        <TableCell>{service.type}</TableCell>
                        <TableCell>${service.price?.toLocaleString()}</TableCell>
                        <TableCell>{service.company?.name || service.companyName || "-"}</TableCell>
                        <TableCell>{
                          ratingsStatsMap[service.id]
                            ? ratingsStatsMap[service.id].averageRating.toFixed(1)
                            : "-"
                        }</TableCell>
                        <TableCell>{
                          ratingsStatsMap[service.id]
                            ? ratingsStatsMap[service.id].totalRatings
                            : "-"
                        }</TableCell>
                        <TableCell>
                          <Button variant="outline" size="icon" onClick={() => openDetailDialog(service)} title="Detail">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Service" : "Add New Service"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Update service details below." : "Create a new service for the platform."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Flat Tire Replacement"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Briefly describe the service..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="basePrice">Base Price ($)</Label>
                  <Input
                    id="basePrice"
                    name="basePrice"
                    type="number"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    placeholder="75.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="30"
                    min="1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Service Detail</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết dịch vụ và đánh giá từ người dùng.
            </DialogDescription>
          </DialogHeader>
          {detailService && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-bold text-lg mb-1">{detailService.name}</div>
                  <div className="text-muted-foreground mb-2">{detailService.description}</div>
                  <div className="text-sm mb-1">Type: <span className="font-medium">{detailService.type}</span></div>
                  <div className="text-sm mb-1">Price: <span className="font-medium">${detailService.price?.toLocaleString()}</span></div>
                  <div className="text-sm mb-1">Company: <span className="font-medium">{detailService.company?.name || detailService.companyName || "-"}</span></div>
                  {(() => {
                    let avg = detailService.averageRating
                    let total = detailService.totalRatings
                    if (!avg || !total) {
                      if (serviceRatings.length > 0) {
                        total = serviceRatings.length
                        avg = serviceRatings.reduce((acc, r) => acc + r.stars, 0) / total
                      } else {
                        total = 0
                        avg = 0
                      }
                    }
                    return <>
                      <div className="text-sm mb-1">Rating: <span className="font-medium">{avg ? avg.toFixed(1) : "-"}</span></div>
                      <div className="text-sm mb-1">Total Ratings: <span className="font-medium">{total ?? "-"}</span></div>
                    </>
                  })()}
                </div>
                {detailService.company && (
                  <div className="bg-muted rounded-lg p-3">
                    <div className="font-medium mb-1">Company Info</div>
                    <div className="text-sm">{detailService.company.name}</div>
                    <div className="text-xs text-muted-foreground">{detailService.company.phone}</div>
                    <div className="text-xs text-muted-foreground">{detailService.company.address?.fullAddress}</div>
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium mb-2">Ratings</div>
                {isRatingsLoading ? (
                  <div className="text-muted-foreground">Loading ratings...</div>
                ) : serviceRatings.length === 0 ? (
                  <div className="text-muted-foreground">No ratings for this service.</div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {serviceRatings.map(rating => (
                      <div key={rating.id} className="border rounded p-2 bg-background">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{rating.userName}</span>
                          <span className="flex gap-0.5">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className={`h-4 w-4 ${i <= rating.stars ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                            ))}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">{new Date(rating.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{rating.comment}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDetailDialog}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
