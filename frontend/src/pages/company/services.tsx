"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Service {
  id: string
  name: string
  description: string
  price: number
  type: RescueServiceType
  status: 'ACTIVE' | 'INACTIVE'
  company?: {
    id: string
    name: string
  }
}

type RescueServiceType = 
  | 'TIRE_REPLACEMENT'
  | 'TIRE_REPAIR'
  | 'FUEL_DELIVERY'
  | 'TOWING'
  | 'ON_SITE_REPAIR'
  | 'BATTERY_JUMP_START'
  | 'LOCKOUT_SERVICE'
  | 'OTHER'

export default function CompanyServices() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [services, setServices] = useState<Service[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentService, setCurrentService] = useState<Service | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteReason, setDeleteReason] = useState("")
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    type: "OTHER" as RescueServiceType,
  })

  // Fetch services from API
  const fetchServices = async () => {
    setIsLoading(true)
    try {
      // Get company ID from user context
      const companyId = user?.companyId
      if (!companyId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Company ID not found",
        })
        return
      }
      const res = await api.rescueServices.getCompanyServices(companyId)
      setServices(res.data)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to load services",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
    // eslint-disable-next-line
  }, [])

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
      price: "",
      type: "OTHER",
    })
    setCurrentService(null)
    setIsEditing(false)
  }

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        price: service.price.toString(),
        type: service.type,
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
    if (!formData.name || !formData.description || !formData.price || !formData.type) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      })
      return
    }

    try {
      if (isEditing && currentService) {
        // Update service with all required fields
        await api.rescueServices.updateService(currentService.id, {
          name: formData.name,
          description: formData.description,
          price: Number.parseFloat(formData.price),
          type: formData.type,
          companyId: currentService.company?.id,
          status: currentService.status // Preserve current status
        })
        toast({
          title: "Service updated",
          description: `${formData.name} has been updated successfully.`,
        })
      } else {
        // Create new service
        await api.rescueServices.createService({
          name: formData.name,
          description: formData.description,
          price: Number.parseFloat(formData.price),
          type: formData.type,
          companyId: user?.companyId,
          status: 'ACTIVE' // Set initial status for new services
        })
        toast({
          title: "Service created",
          description: `${formData.name} has been created successfully.`,
        })
      }
      fetchServices()
      handleCloseDialog()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to save service",
      })
    }
  }

  const toggleServiceStatus = async (id: string, currentStatus: 'ACTIVE' | 'INACTIVE') => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      // Get the current service to preserve other fields
      const currentService = services.find(s => s.id === id)
      if (!currentService) {
        throw new Error('Service not found')
      }

      // Update service with all required fields
      await api.rescueServices.updateService(id, {
        name: currentService.name,
        description: currentService.description,
        price: currentService.price,
        type: currentService.type,
        companyId: currentService.company?.id,
        status: newStatus
      })

      fetchServices()
      toast({
        title: "Service status updated",
        description: `Service has been ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}.`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update service status",
      })
    }
  }

  const handleDeleteRequest = async () => {
    if (!serviceToDelete || !deleteReason) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a reason for deletion",
      })
      return
    }

    try {
      await api.rescueServices.requestServiceDeletion(serviceToDelete.id, deleteReason)
      setIsDeleteDialogOpen(false)
      setDeleteReason("")
      setServiceToDelete(null)
      toast({
        title: "Deletion request sent",
        description: "Your request to delete this service has been sent to the administrator.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to send deletion request",
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

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Services</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Manage Services</CardTitle>
            <CardDescription>Create and manage the services your company offers</CardDescription>
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
                    <TableHead>Price</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredServices.length === 0 ? (
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
                        <TableCell>
                          ${service.price.toFixed(2)}
                        </TableCell>
                        <TableCell>{service.type}</TableCell>
                        <TableCell>
                          {service.company?.name || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={service.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {service.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => toggleServiceStatus(service.id, service.status)}
                              title={service.status === 'ACTIVE' ? "Deactivate" : "Activate"}
                            >
                              {service.status === 'ACTIVE' ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
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
                              onClick={() => {
                                setServiceToDelete(service)
                                setIsDeleteDialogOpen(true)
                              }}
                              title="Request Deletion"
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
                {isEditing ? "Update your service details below." : "Create a new service for your customers."}
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
              <div className="grid gap-2">
                <Label htmlFor="type">Service Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as RescueServiceType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TIRE_REPLACEMENT">Tire Replacement</SelectItem>
                    <SelectItem value="TIRE_REPAIR">Tire Repair</SelectItem>
                    <SelectItem value="FUEL_DELIVERY">Fuel Delivery</SelectItem>
                    <SelectItem value="TOWING">Towing</SelectItem>
                    <SelectItem value="ON_SITE_REPAIR">On-site Repair</SelectItem>
                    <SelectItem value="BATTERY_JUMP_START">Battery Jump Start</SelectItem>
                    <SelectItem value="LOCKOUT_SERVICE">Lockout Service</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="75.00"
                  min="0"
                  step="0.01"
                />
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

      {/* Add Delete Request Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Service Deletion</DialogTitle>
            <DialogDescription>
              Please provide a reason for deleting this service. Your request will be reviewed by an administrator.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Deletion</Label>
              <Textarea
                id="reason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Please explain why you want to delete this service..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setIsDeleteDialogOpen(false)
              setDeleteReason("")
              setServiceToDelete(null)
            }}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteRequest}>
              Request Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
