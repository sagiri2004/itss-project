"use client"

import { useState, useEffect } from "react"
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
import { Plus, Search, Edit, Trash, Check, X } from "lucide-react"
import api from "@/services/api"

// Interface để đồng bộ với backend
interface Service {
  id: string
  name: string
  description: string
  basePrice: number | null
  duration: number | null
  isActive: boolean
  companies: number
  type: string
  createdAt: string
  updatedAt: string
}

interface ServiceFormData {
  name: string
  description: string
  basePrice: string
  duration: string
  type?: string
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
        basePrice: service.basePrice?.toString() || "",
        duration: service.duration?.toString() || "",
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
                    <TableHead>Base Price</TableHead>
                    <TableHead>Est. Duration</TableHead>
                    <TableHead>Companies</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No services found. Try adjusting your search or add a new service.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">{service.description}</div>
                        </TableCell>
                        <TableCell>${service.basePrice?.toFixed(2) ?? '0.00'}</TableCell>
                        <TableCell>{service.duration ?? 0} minutes</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span>{service.companies}</span>
                            <span className="text-xs text-muted-foreground">providers</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={service.isActive ? "success" : "outline"}>
                            {service.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => toggleServiceStatus(service.id, service.isActive)}
                              title={service.isActive ? "Deactivate" : "Activate"}
                            >
                              {service.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenDialog(service)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => deleteService(service.id)}
                              title="Delete"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
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
    </motion.div>
  )
}
