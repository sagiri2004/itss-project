"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Search, Edit, Trash, Calendar, Wrench, CalendarCheck } from "lucide-react"
import { mockCompanyVehicles, vehicleTypes, vehicleStatuses } from "@/data/mock-data"

export default function CompanyVehicles() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [vehicles, setVehicles] = useState(mockCompanyVehicles)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentVehicle, setCurrentVehicle] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    licensePlate: "",
    status: "AVAILABLE",
    assignedDriver: "",
    capacity: "",
    lastMaintenance: "",
    nextMaintenanceDate: "",
  })

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.assignedDriver.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      licensePlate: "",
      status: "AVAILABLE",
      assignedDriver: "",
      capacity: "",
      lastMaintenance: "",
      nextMaintenanceDate: "",
    })
    setCurrentVehicle(null)
    setIsEditing(false)
  }

  const handleOpenDialog = (vehicle?: any) => {
    if (vehicle) {
      setFormData({
        name: vehicle.name,
        type: vehicle.type,
        licensePlate: vehicle.licensePlate,
        status: vehicle.status,
        assignedDriver: vehicle.assignedDriver,
        capacity: vehicle.capacity,
        lastMaintenance: vehicle.lastMaintenance,
        nextMaintenanceDate: vehicle.nextMaintenanceDate,
      })
      setCurrentVehicle(vehicle)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs
    if (!formData.name || !formData.type || !formData.licensePlate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      })
      return
    }

    // Create or update vehicle
    if (isEditing && currentVehicle) {
      const updatedVehicles = vehicles.map((vehicle) =>
        vehicle.id === currentVehicle.id
          ? {
              ...vehicle,
              name: formData.name,
              type: formData.type,
              licensePlate: formData.licensePlate,
              status: formData.status,
              assignedDriver: formData.assignedDriver,
              capacity: formData.capacity,
              lastMaintenance: formData.lastMaintenance,
              nextMaintenanceDate: formData.nextMaintenanceDate,
            }
          : vehicle,
      )
      setVehicles(updatedVehicles)

      toast({
        title: "Vehicle updated",
        description: `${formData.name} has been updated successfully.`,
      })
    } else {
      const newVehicle = {
        id: `veh-${Date.now()}`,
        name: formData.name,
        type: formData.type,
        licensePlate: formData.licensePlate,
        status: formData.status,
        assignedDriver: formData.assignedDriver,
        capacity: formData.capacity,
        lastMaintenance: formData.lastMaintenance,
        nextMaintenanceDate: formData.nextMaintenanceDate,
      }
      setVehicles([...vehicles, newVehicle])

      toast({
        title: "Vehicle added",
        description: `${formData.name} has been added to your fleet.`,
      })
    }

    handleCloseDialog()
  }

  const deleteVehicle = (id: string) => {
    const vehicle = vehicles.find((v) => v.id === id)
    setVehicles(vehicles.filter((vehicle) => vehicle.id !== id))

    toast({
      title: "Vehicle removed",
      description: `${vehicle?.name} has been removed from your fleet.`,
    })
  }

  const markForMaintenance = (id: string) => {
    setVehicles(vehicles.map((vehicle) => (vehicle.id === id ? { ...vehicle, status: "MAINTENANCE" } : vehicle)))

    const vehicle = vehicles.find((v) => v.id === id)
    toast({
      title: "Maintenance scheduled",
      description: `${vehicle?.name} has been marked for maintenance.`,
    })
  }

  // Helper function to get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "success"
      case "IN_USE":
        return "default"
      case "MAINTENANCE":
        return "outline"
      case "OUT_OF_SERVICE":
        return "destructive"
      default:
        return "outline"
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
        <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Manage Vehicles</CardTitle>
            <CardDescription>Manage your fleet of rescue and service vehicles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search vehicles..."
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
                    <TableHead>Vehicle</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Maintenance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No vehicles found. Try adjusting your search or add a new vehicle.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div className="font-medium">{vehicle.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">{vehicle.type}</div>
                        </TableCell>
                        <TableCell>{vehicle.licensePlate}</TableCell>
                        <TableCell>{vehicle.assignedDriver || "Unassigned"}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(vehicle.status)}>
                            {vehicle.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                            <span>Last: {vehicle.lastMaintenance}</span>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <CalendarCheck className="mr-1 h-3 w-3" />
                            <span>Next: {vehicle.nextMaintenanceDate}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => markForMaintenance(vehicle.id)}
                              title="Schedule Maintenance"
                              disabled={vehicle.status === "MAINTENANCE"}
                            >
                              <Wrench className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenDialog(vehicle)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => deleteVehicle(vehicle.id)}
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
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Update your vehicle details below." : "Add a new vehicle to your rescue fleet."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Vehicle Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Tow Truck #1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Vehicle Type</Label>
                  <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="licensePlate">License Plate</Label>
                  <Input
                    id="licensePlate"
                    name="licensePlate"
                    value={formData.licensePlate}
                    onChange={handleInputChange}
                    placeholder="ABC-1234"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="assignedDriver">Assigned Driver</Label>
                  <Input
                    id="assignedDriver"
                    name="assignedDriver"
                    value={formData.assignedDriver}
                    onChange={handleInputChange}
                    placeholder="Driver Name"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity/Capabilities</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  placeholder="Vehicle capabilities and capacity"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="lastMaintenance">Last Maintenance Date</Label>
                  <Input
                    id="lastMaintenance"
                    name="lastMaintenance"
                    type="date"
                    value={formData.lastMaintenance}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nextMaintenanceDate">Next Maintenance Date</Label>
                  <Input
                    id="nextMaintenanceDate"
                    name="nextMaintenanceDate"
                    type="date"
                    value={formData.nextMaintenanceDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
