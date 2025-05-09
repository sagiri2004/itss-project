"use client"

import type React from "react"

import { useState } from "react"
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

import { mockRequests, vehicleOptions, statusOptions } from "@/data/mock-data"

export default function CompanyRequests() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [requests, setRequests] = useState(mockRequests)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "ALL" ? null : value)
  }

  const assignVehicle = (requestId: string, vehicleId: string) => {
    const vehicle = vehicleOptions.find((v) => v.id === vehicleId)

    setRequests(
      requests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              assignedVehicle: vehicle?.name || null,
              status: "RESCUE_VEHICLE_DISPATCHED",
            }
          : request,
      ),
    )

    toast({
      title: "Vehicle assigned",
      description: `${vehicle?.name} has been dispatched for this request.`,
    })
  }

  const updateRequestStatus = (requestId: string, newStatus: string) => {
    setRequests(
      requests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: newStatus,
              hasChat: newStatus !== "CREATED" && newStatus !== "CANCELLED_BY_COMPANY",
            }
          : request,
      ),
    )

    toast({
      title: "Status updated",
      description: `Request status has been updated to ${newStatus.replace(/_/g, " ")}.`,
    })
  }

  // Filter requests based on search term and status filter
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.assignedVehicle && request.assignedVehicle.toLowerCase().includes(searchTerm.toLowerCase()))

    // If no status filter is set, or it matches the current request status
    const matchesStatus = !statusFilter || request.status === statusFilter

    return matchesSearch && matchesStatus
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
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace(/_/g, " ")}
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
                    <TableHead>Customer & Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date & Location</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Price</TableHead>
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
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="font-medium">{request.service}</div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <User className="mr-1 h-3 w-3" />
                            <span>
                              {request.user.name} • {request.user.phone}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(request.status) || "outline"}>
                            {request.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                            <span>{formatDate(request.date)}</span>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <MapPin className="mr-1 h-3 w-3" />
                            <span>{request.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.assignedVehicle ? (
                            <div className="flex items-center">
                              <Truck className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                              <span>{request.assignedVehicle}</span>
                            </div>
                          ) : (
                            <Select
                              onValueChange={(value) => assignVehicle(request.id, value)}
                              disabled={!["CREATED", "ACCEPTED_BY_COMPANY"].includes(request.status)}
                            >
                              <SelectTrigger className="h-8 w-[140px]">
                                <SelectValue placeholder="Assign..." />
                              </SelectTrigger>
                              <SelectContent>
                                {vehicleOptions.map((vehicle) => (
                                  <SelectItem key={vehicle.id} value={vehicle.id}>
                                    {vehicle.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell>{request.price ? `$${request.price.toFixed(2)}` : "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {request.hasChat && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/company/requests/${request.id}/chat`)}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Chat
                              </Button>
                            )}

                            {request.status === "CREATED" && (
                              <Button size="sm" onClick={() => updateRequestStatus(request.id, "ACCEPTED_BY_COMPANY")}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Accept
                              </Button>
                            )}
                            {["ACCEPTED_BY_COMPANY", "RESCUE_VEHICLE_DISPATCHED"].includes(request.status) && (
                              <Button size="sm" onClick={() => updateRequestStatus(request.id, "IN_PROGRESS")}>
                                Start
                              </Button>
                            )}
                            {request.status === "IN_PROGRESS" && (
                              <Button size="sm" onClick={() => updateRequestStatus(request.id, "COMPLETED")}>
                                Complete
                              </Button>
                            )}
                            {["CREATED", "ACCEPTED_BY_COMPANY"].includes(request.status) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateRequestStatus(request.id, "CANCELLED_BY_COMPANY")}
                              >
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Cancel
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
    </motion.div>
  )
}
