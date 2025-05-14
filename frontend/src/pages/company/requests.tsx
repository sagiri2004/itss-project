"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getStatusVariant, formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Search, Clock, MapPin, User, Truck, CheckCircle, AlertTriangle, MessageSquare } from "lucide-react"
import api from "@/services/api"

const statusOptions = [
  "CREATED",
  "ACCEPTED_BY_COMPANY",
  "RESCUE_VEHICLE_DISPATCHED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED_BY_COMPANY",
  "CANCELLED_BY_USER",
]

interface Request {
  id: string
  serviceName: string
  companyName: string
  estimatedPrice: number
  finalPrice: number | null
  status: string
  createdAt: string
  notes?: string | null
  vehicleLicensePlate?: string | null
  vehicleModel?: string | null
}

interface Vehicle {
  id: string
  licensePlate: string
  model: string
  status: string
}

export default function CompanyRequests() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [requests, setRequests] = useState<Request[]>([])
  const [vehicleOptions, setVehicleOptions] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true)
      try {
        const res = await api.rescueRequests.getCompanyRequests()
        setRequests(res.data)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.response?.data?.message || "Failed to load requests",
        })
      } finally {
        setIsLoading(false)
      }
    }

    const fetchVehicles = async () => {
      try {
        const res = await api.rescueVehicles.getVehicles()
        setVehicleOptions(res.data)
      } catch {
        setVehicleOptions([])
      }
    }

    fetchRequests()
    fetchVehicles()
  }, [toast])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "ALL" ? null : value)
  }

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value === 'ALL' ? null : value)
  }

  const handleSortOrderChange = (value: 'desc' | 'asc') => {
    setSortOrder(value)
  }

  // ĐÚNG API: Gán xe cho yêu cầu cứu hộ
  const assignVehicle = async (requestId: string, vehicleId: string) => {
    try {
      // Bạn cần thêm hàm dispatchVehicle vào api.rescueRequests
      await api.rescueRequests.dispatchVehicle(requestId, vehicleId)
      setRequests((prev) =>
        prev.map((request) =>
          request.id === requestId
            ? {
                ...request,
                vehicleLicensePlate: vehicleOptions.find((v) => v.id === vehicleId)?.licensePlate || null,
                vehicleModel: vehicleOptions.find((v) => v.id === vehicleId)?.model || "",
                status: "RESCUE_VEHICLE_DISPATCHED",
              }
            : request
        )
      )
      toast({
        title: "Vehicle assigned",
        description: `${vehicleOptions.find((v) => v.id === vehicleId)?.model} (${vehicleOptions.find((v) => v.id === vehicleId)?.licensePlate}) has been dispatched for this request.`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to assign vehicle",
      })
    }
  }

  // ĐÚNG API: Chuyển trạng thái yêu cầu cứu hộ
  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      if (newStatus === "ACCEPTED_BY_COMPANY") {
        await api.rescueRequests.acceptRequest(requestId)
      } else if (newStatus === "IN_PROGRESS") {
        await api.rescueRequests.startRepair(requestId)
      } else if (newStatus === "COMPLETED") {
        await api.rescueRequests.completeRepair(requestId)
      } else if (newStatus === "CANCELLED_BY_COMPANY") {
        await api.rescueRequests.cancelByCompany(requestId)
      }
      setRequests((prev) =>
        prev.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status: newStatus,
                vehicleLicensePlate: null,
                vehicleModel: null,
              }
            : request
        )
      )
      toast({
        title: "Status updated",
        description: `Request status has been updated to ${newStatus.replace(/_/g, " ")}.`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update request status",
      })
    }
  }

  // Extract unique service types from requests
  const serviceTypes = Array.from(new Set(requests.map(r => r.serviceName)))

  // Filter and sort requests
  const filteredRequests = requests
    .filter((request) => {
      const matchesSearch =
        request.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.vehicleLicensePlate && request.vehicleLicensePlate.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (request.vehicleModel && request.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = !statusFilter || request.status === statusFilter
      const matchesType = !typeFilter || request.serviceName === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
    .sort((a, b) => {
      if (sortOrder === 'desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
    })

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
        <h1 className="text-3xl font-bold tracking-tight">Rescue Requests</h1>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Manage Requests</CardTitle>
            <CardDescription>View and manage all customer rescue requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search requests..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <div className="flex gap-2">
                <Select onValueChange={handleStatusFilterChange} defaultValue="ALL">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={handleTypeFilterChange} defaultValue="ALL">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={handleSortOrderChange} defaultValue="desc">
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Estimated Price</TableHead>
                    <TableHead>Final Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                        No requests found. Try adjusting your search criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.serviceName}</TableCell>
                        <TableCell>{request.companyName}</TableCell>
                        <TableCell>{typeof request.estimatedPrice === "number" ? `$${request.estimatedPrice.toFixed(2)}` : "-"}</TableCell>
                        <TableCell>{typeof request.finalPrice === "number" ? `$${request.finalPrice.toFixed(2)}` : "-"}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(request.status) || "outline"}>
                            {request.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(request.createdAt)}</TableCell>
                        <TableCell>{request.notes || "-"}</TableCell>
                        <TableCell>
                          {request.vehicleModel && request.vehicleLicensePlate ? (
                            `${request.vehicleModel} (${request.vehicleLicensePlate})`
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/company/requests/${request.id}`)}>
                            View
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
    </motion.div>
  )
}
