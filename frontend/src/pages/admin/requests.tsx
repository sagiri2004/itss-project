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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getStatusVariant, formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Search, Eye, Clock, MapPin, User, Building2, AlertTriangle, CheckCircle } from "lucide-react"

// Mock data
const mockRequests = [
  {
    id: "req-001",
    service: "Flat Tire Replacement",
    status: "COMPLETED",
    date: "2023-05-01T10:30:00",
    user: {
      id: "user-001",
      name: "John Doe",
      phone: "+1 (555) 123-4567",
    },
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
    },
    location: "123 Main St, Anytown",
    assignedVehicle: "Tow Truck #1",
    price: 85.0,
    hasIssue: false,
  },
  {
    id: "req-002",
    service: "Battery Jump Start",
    status: "IN_PROGRESS",
    date: "2023-05-05T14:15:00",
    user: {
      id: "user-002",
      name: "Jane Smith",
      phone: "+1 (555) 987-6543",
    },
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
    },
    location: "456 Oak Ave, Somewhere",
    assignedVehicle: "Service Van #1",
    price: 65.0,
    hasIssue: false,
  },
  {
    id: "req-003",
    service: "Vehicle Towing",
    status: "CREATED",
    date: "2023-05-07T09:00:00",
    user: {
      id: "user-003",
      name: "Bob Johnson",
      phone: "+1 (555) 456-7890",
    },
    company: null,
    location: "789 Pine Rd, Nowhere",
    assignedVehicle: null,
    price: null,
    hasIssue: true,
  },
  {
    id: "req-004",
    service: "Fuel Delivery",
    status: "ACCEPTED_BY_COMPANY",
    date: "2023-05-06T11:20:00",
    user: {
      id: "user-004",
      name: "Alice Brown",
      phone: "+1 (555) 234-5678",
    },
    company: {
      id: "comp-002",
      name: "QuickHelp Auto",
    },
    location: "321 Elm St, Anytown",
    assignedVehicle: null,
    price: 75.0,
    hasIssue: false,
  },
  {
    id: "req-005",
    service: "Lockout Service",
    status: "RESCUE_VEHICLE_DISPATCHED",
    date: "2023-05-06T16:45:00",
    user: {
      id: "user-005",
      name: "Charlie Wilson",
      phone: "+1 (555) 345-6789",
    },
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
    },
    location: "555 Maple Ave, Somewhere",
    assignedVehicle: "Service Van #1",
    price: 70.0,
    hasIssue: false,
  },
  {
    id: "req-006",
    service: "Flat Tire Replacement",
    status: "CANCELLED_BY_USER",
    date: "2023-05-04T13:20:00",
    user: {
      id: "user-006",
      name: "David Miller",
      phone: "+1 (555) 567-8901",
    },
    company: {
      id: "comp-003",
      name: "RoadHeroes Assistance",
    },
    location: "777 Cedar St, Somewhere",
    assignedVehicle: null,
    price: null,
    hasIssue: true,
  },
]

export default function AdminRequests() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [issueFilter, setIssueFilter] = useState<string | null>(null)
  const [requests, setRequests] = useState(mockRequests)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "ALL" ? null : value)
  }

  const handleIssueFilterChange = (value: string) => {
    setIssueFilter(value)
  }

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.company && request.company.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = !statusFilter || request.status === statusFilter
    const matchesIssue =
      issueFilter === "ALL" ||
      (issueFilter === "HAS_ISSUE" && request.hasIssue) ||
      (issueFilter === "NO_ISSUE" && !request.hasIssue)

    return matchesSearch && matchesStatus && matchesIssue
  })

  const resolveIssue = (id: string) => {
    setRequests(
      requests.map((request) =>
        request.id === id
          ? {
              ...request,
              hasIssue: false,
            }
          : request,
      ),
    )

    toast({
      title: "Issue resolved",
      description: `The issue with request #${id} has been marked as resolved.`,
    })
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
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED_BY_USER">Cancelled</SelectItem>
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
                              <div className="font-medium">{request.service}</div>
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
                            <span>{request.user.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{request.user.phone}</div>
                        </TableCell>
                        <TableCell>
                          {request.company ? (
                            <div className="flex items-center">
                              <Building2 className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                              <span>{request.company.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
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
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" title="View Details">
                              <Eye className="mr-2 h-4 w-4" />
                              Details
                            </Button>
                            {request.hasIssue && (
                              <Button size="sm" onClick={() => resolveIssue(request.id)} title="Resolve Issue">
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
                  {
                    requests.filter((r) =>
                      ["CREATED", "ACCEPTED_BY_COMPANY", "RESCUE_VEHICLE_DISPATCHED", "IN_PROGRESS"].includes(r.status),
                    ).length
                  }
                </div>
                <div className="text-xs text-muted-foreground">Active Requests</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold">{requests.filter((r) => r.status === "COMPLETED").length}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-red-500">{requests.filter((r) => r.hasIssue).length}</div>
                <div className="text-xs text-muted-foreground">Issues</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
