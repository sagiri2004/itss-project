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
import { Search, Eye, Clock, MapPin, User, Building2, AlertTriangle, CheckCircle } from "lucide-react"
import api from "@/services/api"

// Interfaces đồng bộ với user và company request
interface Request {
  id: string
  userId: string
  serviceId: string
  serviceName: string
  companyId?: string
  companyName?: string
  customerName: string
  customerPhone: string
  latitude: number
  longitude: number
  location: string
  description: string
  estimatedPrice: number
  finalPrice: number | null
  status: string
  createdAt: string
  notes: string | null
  hasIssue?: boolean
  rescueServiceDetails?: {
    id: string
    name: string
    description: string
    price: number
    type: string
    companyId: string
    companyName: string
  }
  vehicleLicensePlate?: string
  vehicleModel?: string
  vehicleStatus?: string
  vehicleEquipmentDetails?: string[]
}

export default function AdminRequests() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [issueFilter, setIssueFilter] = useState<string | null>(null)
  const [requests, setRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check admin role
    if (user?.role !== 'admin') {
      navigate('/login')
      return
    }

    const fetchRequests = async () => {
      setIsLoading(true)
      try {
        // Admin API call to get all requests
        const response = await api.rescueRequests.getRequests()
        
        // Map response data to our interface
        const mappedRequests: Request[] = response.data.map((req: any) => ({
          id: req.id,
          userId: req.userId,
          serviceId: req.serviceId,
          serviceName: req.serviceName || req.rescueServiceDetails?.name || "",
          companyId: req.companyId,
          companyName: req.companyName,
          customerName: req.customerName || req.user?.name || "",
          customerPhone: req.customerPhone || req.user?.phone || "",
          latitude: req.latitude,
          longitude: req.longitude,
          location: req.location || req.address || "",
          description: req.description || "",
          estimatedPrice: req.estimatedPrice || 0,
          finalPrice: req.finalPrice,
          status: req.status,
          createdAt: req.createdAt,
          notes: req.notes,
          hasIssue: req.hasIssue || false,
          rescueServiceDetails: req.rescueServiceDetails,
          vehicleLicensePlate: req.vehicleLicensePlate,
          vehicleModel: req.vehicleModel,
          vehicleStatus: req.vehicleStatus,
          vehicleEquipmentDetails: req.vehicleEquipmentDetails
        }))

        setRequests(mappedRequests)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error loading requests",
          description: error.response?.data?.message || "Could not load requests"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [toast, user, navigate])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "ALL" ? null : value)
  }

  const handleIssueFilterChange = (value: string) => {
    setIssueFilter(value)
  }

  const resolveIssue = async (id: string) => {
    try {
      // Admin API call to resolve issue
      const response = await api.rescueRequests.resolveIssue(id)
      
      // Update local state
      setRequests(prevRequests => 
        prevRequests.map(request =>
          request.id === id ? { ...request, hasIssue: false } : request
        )
      )

      toast({
        title: "Issue resolved",
        description: `The issue with request #${id} has been marked as resolved.`
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Could not resolve issue"
      })
    }
  }

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.companyName && request.companyName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = !statusFilter || request.status === statusFilter
    const matchesIssue =
      issueFilter === "ALL" ||
      (issueFilter === "HAS_ISSUE" && request.hasIssue) ||
      (issueFilter === "NO_ISSUE" && !request.hasIssue)

    return matchesSearch && matchesStatus && matchesIssue
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading requests...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Rescue Requests</h1>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Requests</CardTitle>
            <CardDescription>Monitor and manage all rescue requests across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
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
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="CREATED">Created</SelectItem>
                    <SelectItem value="ACCEPTED_BY_COMPANY">Accepted</SelectItem>
                    <SelectItem value="RESCUE_VEHICLE_DISPATCHED">Vehicle Dispatched</SelectItem>
                    <SelectItem value="RESCUE_VEHICLE_ARRIVED">Vehicle Arrived</SelectItem>
                    <SelectItem value="INSPECTION_DONE">Inspection Done</SelectItem>
                    <SelectItem value="PRICE_UPDATED">Price Updated</SelectItem>
                    <SelectItem value="PRICE_CONFIRMED">Price Confirmed</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED_BY_USER">Cancelled by User</SelectItem>
                    <SelectItem value="CANCELLED_BY_COMPANY">Cancelled by Company</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={handleIssueFilterChange} defaultValue="ALL">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by issues" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Requests</SelectItem>
                    <SelectItem value="HAS_ISSUE">Has Issues</SelectItem>
                    <SelectItem value="NO_ISSUE">No Issues</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date & Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No requests found. Try adjusting your search criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id} className={request.hasIssue ? "bg-red-50/50 dark:bg-red-900/10" : ""}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-medium">{request.serviceName}</div>
                              <div className="text-xs text-muted-foreground mt-1">{request.id}</div>
                            </div>
                            {request.hasIssue && (
                              <div className="rounded-full bg-red-100 p-1 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                <AlertTriangle className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                            <span>{request.customerName}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{request.customerPhone}</div>
                        </TableCell>
                        <TableCell>
                          {request.companyName ? (
                            <div className="flex items-center">
                              <Building2 className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                              <span>{request.companyName}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(request.status)}>
                            {request.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                            <span>{formatDate(request.createdAt)}</span>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <MapPin className="mr-1 h-3 w-3" />
                            <span>{request.location}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/admin/requests/${request.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Details
                            </Button>
                            {request.hasIssue && (
                              <Button size="sm" onClick={() => resolveIssue(request.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Resolve
                              </Button>
                            )}
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

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Request Statistics</CardTitle>
            <CardDescription>Overview of platform request status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold">{requests.length}</div>
                <div className="text-xs text-muted-foreground">Total Requests</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold">
                  {requests.filter((r) =>
                    ["CREATED", "ACCEPTED_BY_COMPANY", "RESCUE_VEHICLE_DISPATCHED", "IN_PROGRESS"].includes(r.status)
                  ).length}
                </div>
                <div className="text-xs text-muted-foreground">Active Requests</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold">
                  {requests.filter((r) => r.status === "COMPLETED").length}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-red-500">
                  {requests.filter((r) => r.hasIssue).length}
                </div>
                <div className="text-xs text-muted-foreground">Issues</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
