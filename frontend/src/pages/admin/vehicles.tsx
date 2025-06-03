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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Search, Eye, Calendar, Truck, Building2, Wrench, AlertTriangle, Loader2 } from "lucide-react"
import api from "@/services/api"

// Types
interface Vehicle {
  id: string
  name: string
  licensePlate: string
  model: string
  make: string
  equipmentDetails: string[]
  status: string
  currentLatitude: number
  currentLongitude: number
  assignedDriverName: string
  companyId: string
  companyName: string
  lastMaintenanceDate?: string
  nextMaintenanceDate?: string
}

export default function AdminVehicles() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [companyFilter, setCompanyFilter] = useState<string | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check admin role
    if (user?.role !== 'admin') {
      navigate('/login')
      return
    }

    const fetchVehicles = async () => {
      setIsLoading(true)
      try {
        const response = await api.admin.getVehicles()
        setVehicles(response.data)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading vehicles",
          description: error.response?.data?.message || "Could not load vehicles"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchVehicles()
  }, [toast, user, navigate])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "ALL" ? null : value)
  }

  const handleCompanyFilterChange = (value: string) => {
    setCompanyFilter(value === "ALL" ? null : value)
  }

  // Get unique companies for filter
  const companies = Array.from(new Set(vehicles.map((vehicle) => vehicle.companyId))).map((companyId) => {
    const vehicle = vehicles.find((v) => v.companyId === companyId)
    return {
      id: companyId,
      name: vehicle?.companyName || "",
    }
  })

  // Filter vehicles
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.assignedDriverName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.companyName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || vehicle.status === statusFilter
    const matchesCompany = !companyFilter || vehicle.companyId === companyFilter

    return matchesSearch && matchesStatus && matchesCompany
  })

  // Helper to get badge variant based on vehicle status
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

  // Flag vehicles with upcoming maintenance (within next 7 days)
  const isMaintenanceSoon = (dateStr?: string) => {
    if (!dateStr) return false
    const maintenanceDate = new Date(dateStr)
    const today = new Date()
    const diffTime = maintenanceDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7
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
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Vehicle Management</h1>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Vehicles</CardTitle>
            <CardDescription>Manage and monitor all company service vehicles</CardDescription>
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
              <div className="flex gap-2">
                <Select onValueChange={handleStatusFilterChange} defaultValue="ALL">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="IN_USE">In Use</SelectItem>
                    <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={handleCompanyFilterChange} defaultValue="ALL">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Companies</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Make</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Location</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Last Maintenance</TableHead>
                    <TableHead>Next Maintenance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                        No vehicles found. Try adjusting your search criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <div className="font-medium">{vehicle.name}</div>
                        </TableCell>
                        <TableCell>{vehicle.companyName}</TableCell>
                        <TableCell>{vehicle.licensePlate}</TableCell>
                        <TableCell>{vehicle.model}</TableCell>
                        <TableCell>{vehicle.make}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(vehicle.status)}>
                            {vehicle.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            Lat: {vehicle.currentLatitude}<br />
                            Lon: {vehicle.currentLongitude}
                          </div>
                        </TableCell>
                        <TableCell>{vehicle.assignedDriverName}</TableCell>
                        <TableCell>{vehicle.lastMaintenanceDate}</TableCell>
                        <TableCell>{vehicle.nextMaintenanceDate}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Statistics</CardTitle>
            <CardDescription>Overview of vehicle fleet status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-4 text-center">
                <Truck className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <div className="text-2xl font-bold">{vehicles.length}</div>
                <div className="text-xs text-muted-foreground">Total Vehicles</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold">{vehicles.filter((v) => v.status === "AVAILABLE").length}</div>
                <div className="text-xs text-muted-foreground">Available</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold">{vehicles.filter((v) => v.status === "IN_USE").length}</div>
                <div className="text-xs text-muted-foreground">In Use</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                  <Wrench className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold">
                  {vehicles.filter((v) => ["MAINTENANCE", "OUT_OF_SERVICE"].includes(v.status)).length}
                </div>
                <div className="text-xs text-muted-foreground">In Maintenance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
