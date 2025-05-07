"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getStatusVariant, formatDate, formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import {
  Search,
  Eye,
  Clock,
  MapPin,
  User,
  Building2,
  AlertTriangle,
  CheckCircle,
  Filter,
  Download,
  RefreshCw,
  Car,
  DollarSign,
  MessageSquare,
  FileText,
  ChevronDown,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock data - expanded with more diverse examples
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
      email: "john.doe@example.com",
      address: "123 Main St, Anytown, CA 94123",
      joinDate: "2022-01-15",
    },
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
      phone: "+1 (555) 987-6543",
      email: "support@fastfix.com",
      address: "456 Service Rd, Anytown, CA 94123",
      rating: 4.8,
    },
    location: "123 Main St, Anytown",
    coordinates: { lat: 37.7749, lng: -122.4194 },
    assignedVehicle: "Tow Truck #1",
    vehicleDetails: {
      licensePlate: "ABC123",
      make: "Toyota",
      model: "Camry",
      year: 2018,
      color: "Silver",
    },
    price: 85.0,
    hasIssue: false,
    paymentStatus: "PAID",
    paymentMethod: "Credit Card",
    notes: "Customer was very satisfied with the service.",
    timeline: [
      { status: "CREATED", timestamp: "2023-05-01T10:00:00", actor: "John Doe" },
      { status: "ACCEPTED_BY_COMPANY", timestamp: "2023-05-01T10:05:00", actor: "FastFix Roadside" },
      { status: "RESCUE_VEHICLE_DISPATCHED", timestamp: "2023-05-01T10:10:00", actor: "FastFix Roadside" },
      { status: "RESCUE_VEHICLE_ARRIVED", timestamp: "2023-05-01T10:20:00", actor: "FastFix Roadside" },
      { status: "COMPLETED", timestamp: "2023-05-01T10:30:00", actor: "FastFix Roadside" },
      { status: "PAID", timestamp: "2023-05-01T10:35:00", actor: "John Doe" },
    ],
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
      email: "jane.smith@example.com",
      address: "456 Oak Ave, Somewhere, NY 10001",
      joinDate: "2022-03-22",
    },
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
      phone: "+1 (555) 987-6543",
      email: "support@fastfix.com",
      address: "456 Service Rd, Anytown, CA 94123",
      rating: 4.8,
    },
    location: "456 Oak Ave, Somewhere",
    coordinates: { lat: 40.7128, lng: -74.006 },
    assignedVehicle: "Service Van #1",
    vehicleDetails: {
      licensePlate: "XYZ789",
      make: "Honda",
      model: "Civic",
      year: 2020,
      color: "Blue",
    },
    price: 65.0,
    hasIssue: false,
    paymentStatus: null,
    paymentMethod: null,
    notes: "Customer reported battery issues for the second time this month.",
    timeline: [
      { status: "CREATED", timestamp: "2023-05-05T14:00:00", actor: "Jane Smith" },
      { status: "ACCEPTED_BY_COMPANY", timestamp: "2023-05-05T14:05:00", actor: "FastFix Roadside" },
      { status: "RESCUE_VEHICLE_DISPATCHED", timestamp: "2023-05-05T14:10:00", actor: "FastFix Roadside" },
      { status: "IN_PROGRESS", timestamp: "2023-05-05T14:15:00", actor: "FastFix Roadside" },
    ],
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
      email: "bob.johnson@example.com",
      address: "789 Pine Rd, Nowhere, TX 75001",
      joinDate: "2022-05-10",
    },
    company: null,
    location: "789 Pine Rd, Nowhere",
    coordinates: { lat: 32.7767, lng: -96.797 },
    assignedVehicle: null,
    vehicleDetails: {
      licensePlate: "DEF456",
      make: "Ford",
      model: "F-150",
      year: 2015,
      color: "Red",
    },
    price: null,
    hasIssue: true,
    paymentStatus: null,
    paymentMethod: null,
    notes: "Vehicle won't start and needs to be towed to the nearest service center.",
    timeline: [{ status: "CREATED", timestamp: "2023-05-07T09:00:00", actor: "Bob Johnson" }],
  },
  {
    id: "req-004",
    service: "Fuel Delivery",
    status: "PRICE_UPDATED",
    date: "2023-05-06T11:20:00",
    user: {
      id: "user-004",
      name: "Alice Brown",
      phone: "+1 (555) 234-5678",
      email: "alice.brown@example.com",
      address: "321 Elm St, Anytown, CA 94123",
      joinDate: "2022-02-18",
    },
    company: {
      id: "comp-002",
      name: "QuickHelp Auto",
      phone: "+1 (555) 876-5432",
      email: "support@quickhelp.com",
      address: "789 Helper Ave, Anytown, CA 94123",
      rating: 4.5,
    },
    location: "321 Elm St, Anytown",
    coordinates: { lat: 37.7749, lng: -122.4194 },
    assignedVehicle: "Service Van #2",
    vehicleDetails: {
      licensePlate: "GHI789",
      make: "Chevrolet",
      model: "Malibu",
      year: 2019,
      color: "Black",
    },
    price: 75.0,
    hasIssue: false,
    paymentStatus: null,
    paymentMethod: null,
    notes: "Customer ran out of fuel on the highway.",
    timeline: [
      { status: "CREATED", timestamp: "2023-05-06T11:00:00", actor: "Alice Brown" },
      { status: "ACCEPTED_BY_COMPANY", timestamp: "2023-05-06T11:05:00", actor: "QuickHelp Auto" },
      { status: "RESCUE_VEHICLE_DISPATCHED", timestamp: "2023-05-06T11:10:00", actor: "QuickHelp Auto" },
      { status: "RESCUE_VEHICLE_ARRIVED", timestamp: "2023-05-06T11:15:00", actor: "QuickHelp Auto" },
      { status: "INSPECTION_DONE", timestamp: "2023-05-06T11:18:00", actor: "QuickHelp Auto" },
      { status: "PRICE_UPDATED", timestamp: "2023-05-06T11:20:00", actor: "QuickHelp Auto" },
    ],
  },
]

// Status groups for filtering
const statusGroups = {
  all: "All Requests",
  active: [
    "CREATED",
    "ACCEPTED_BY_COMPANY",
    "RESCUE_VEHICLE_DISPATCHED",
    "RESCUE_VEHICLE_ARRIVED",
    "INSPECTION_DONE",
    "PRICE_UPDATED",
    "WAITING",
    "PRICE_CONFIRMED",
    "IN_PROGRESS",
  ],
  completed: ["COMPLETED", "INVOICED", "PAID"],
  cancelled: ["REJECTED_BY_USER", "CANCELLED_BY_USER", "CANCELLED_BY_COMPANY"],
  issues: "Issues",
}

export default function AdminRequests() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [companyFilter, setCompanyFilter] = useState<string | null>(null)
  const [serviceFilter, setServiceFilter] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<string | null>(null)
  const [priceFilter, setPriceFilter] = useState<string | null>(null)
  const [statusGroupFilter, setStatusGroupFilter] = useState("all")
  const [requests, setRequests] = useState(mockRequests)
  const [isLoading, setIsLoading] = useState(false)
  const [companies, setCompanies] = useState<string[]>([])
  const [services, setServices] = useState<string[]>([])
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Extract unique companies and services for filters
  useEffect(() => {
    const uniqueCompanies = Array.from(
      new Set(
        requests
          .filter((r) => r.company)
          .map((r) => r.company?.name)
          .filter(Boolean) as string[],
      ),
    )

    const uniqueServices = Array.from(new Set(requests.map((r) => r.service)))

    setCompanies(uniqueCompanies)
    setServices(uniqueServices)
  }, [requests])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "ALL" ? null : value)
  }

  const handleCompanyFilterChange = (value: string) => {
    setCompanyFilter(value === "ALL" ? null : value)
  }

  const handleServiceFilterChange = (value: string) => {
    setServiceFilter(value === "ALL" ? null : value)
  }

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value === "ALL" ? null : value)
  }

  const handlePriceFilterChange = (value: string) => {
    setPriceFilter(value === "ALL" ? null : value)
  }

  const handleStatusGroupChange = (value: string) => {
    setStatusGroupFilter(value)
    // Clear individual status filter when changing groups
    setStatusFilter(null)
  }

  const refreshData = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      // Randomize some statuses to simulate real-time updates
      const updatedRequests = [...requests].map((req) => {
        if (Math.random() > 0.8) {
          const statuses = [
            "CREATED",
            "ACCEPTED_BY_COMPANY",
            "RESCUE_VEHICLE_DISPATCHED",
            "RESCUE_VEHICLE_ARRIVED",
            "INSPECTION_DONE",
            "PRICE_UPDATED",
            "WAITING",
            "PRICE_CONFIRMED",
            "IN_PROGRESS",
            "COMPLETED",
            "INVOICED",
            "PAID",
          ]
          return {
            ...req,
            status: statuses[Math.floor(Math.random() * statuses.length)],
          }
        }
        return req
      })
      setRequests(updatedRequests)
      setIsLoading(false)
      toast({
        title: "Data refreshed",
        description: "The request data has been updated.",
      })
    }, 1000)
  }

  const exportData = () => {
    toast({
      title: "Export started",
      description: "Exporting request data to CSV...",
    })

    // In a real app, this would generate and download a CSV file
    setTimeout(() => {
      toast({
        title: "Export complete",
        description: "Request data has been exported successfully.",
      })
    }, 1500)
  }

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

  const viewRequestDetails = (request: any) => {
    setSelectedRequest(request)
    setIsDetailsOpen(true)
  }

  const updateRequestStatus = (requestId: string, newStatus: string) => {
    setRequests(
      requests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: newStatus,
              timeline: [
                ...(request.timeline || []),
                {
                  status: newStatus,
                  timestamp: new Date().toISOString(),
                  actor: "Admin",
                },
              ],
            }
          : request,
      ),
    )

    toast({
      title: "Status updated",
      description: `Request #${requestId} status has been updated to ${newStatus.replace(/_/g, " ")}`,
    })
  }

  // Calculate request progress percentage based on status
  const getRequestProgress = (status: string): number => {
    const statusOrder = [
      "CREATED",
      "ACCEPTED_BY_COMPANY",
      "RESCUE_VEHICLE_DISPATCHED",
      "RESCUE_VEHICLE_ARRIVED",
      "INSPECTION_DONE",
      "PRICE_UPDATED",
      "WAITING",
      "PRICE_CONFIRMED",
      "IN_PROGRESS",
      "COMPLETED",
      "INVOICED",
      "PAID",
    ]

    if (["REJECTED_BY_USER", "CANCELLED_BY_USER", "CANCELLED_BY_COMPANY"].includes(status)) {
      return 100 // Cancelled requests are considered "complete" in terms of progress
    }

    const index = statusOrder.indexOf(status)
    if (index === -1) return 0

    return Math.round(((index + 1) / statusOrder.length) * 100)
  }

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    // Text search
    const matchesSearch =
      searchTerm === "" ||
      request.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.company && request.company.name.toLowerCase().includes(searchTerm.toLowerCase()))

    // Status group filter
    let matchesStatusGroup = true
    if (statusGroupFilter === "issues") {
      matchesStatusGroup = request.hasIssue
    } else if (statusGroupFilter !== "all") {
      matchesStatusGroup =
        statusGroups[statusGroupFilter as keyof typeof statusGroups] instanceof Array &&
        (statusGroups[statusGroupFilter as keyof typeof statusGroups] as string[]).includes(request.status)
    }

    // Individual filters
    const matchesStatus = !statusFilter || request.status === statusFilter
    const matchesCompany = !companyFilter || (request.company && request.company.name === companyFilter)
    const matchesService = !serviceFilter || request.service === serviceFilter

    // Date filter
    let matchesDate = true
    if (dateFilter) {
      const requestDate = new Date(request.date)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const lastWeek = new Date(today)
      lastWeek.setDate(lastWeek.getDate() - 7)
      const lastMonth = new Date(today)
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      if (dateFilter === "TODAY") {
        matchesDate = requestDate.toDateString() === today.toDateString()
      } else if (dateFilter === "YESTERDAY") {
        matchesDate = requestDate.toDateString() === yesterday.toDateString()
      } else if (dateFilter === "LAST_WEEK") {
        matchesDate = requestDate >= lastWeek && requestDate <= today
      } else if (dateFilter === "LAST_MONTH") {
        matchesDate = requestDate >= lastMonth && requestDate <= today
      }
    }

    // Price filter
    let matchesPrice = true
    if (priceFilter && request.price !== null) {
      if (priceFilter === "UNDER_50") {
        matchesPrice = request.price < 50
      } else if (priceFilter === "50_100") {
        matchesPrice = request.price >= 50 && request.price <= 100
      } else if (priceFilter === "100_200") {
        matchesPrice = request.price > 100 && request.price <= 200
      } else if (priceFilter === "OVER_200") {
        matchesPrice = request.price > 200
      }
    }

    return (
      matchesSearch &&
      matchesStatusGroup &&
      matchesStatus &&
      matchesCompany &&
      matchesService &&
      matchesDate &&
      matchesPrice
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Rescue Requests</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={isLoading} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={handleStatusGroupChange}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">All Requests</h2>
            <p className="text-muted-foreground mb-6">Monitor and manage all rescue requests across the platform</p>

            <div className="flex items-center justify-between mb-6">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by ID, customer, location..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6">
                <Select onValueChange={handleStatusFilterChange} value={statusFilter || "ALL"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="CREATED">Created</SelectItem>
                    <SelectItem value="ACCEPTED_BY_COMPANY">Accepted</SelectItem>
                    <SelectItem value="RESCUE_VEHICLE_DISPATCHED">Dispatched</SelectItem>
                    <SelectItem value="RESCUE_VEHICLE_ARRIVED">Arrived</SelectItem>
                    <SelectItem value="INSPECTION_DONE">Inspected</SelectItem>
                    <SelectItem value="PRICE_UPDATED">Price Updated</SelectItem>
                    <SelectItem value="WAITING">Waiting</SelectItem>
                    <SelectItem value="PRICE_CONFIRMED">Price Confirmed</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="INVOICED">Invoiced</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="REJECTED_BY_USER">Rejected</SelectItem>
                    <SelectItem value="CANCELLED_BY_USER">Cancelled by User</SelectItem>
                    <SelectItem value="CANCELLED_BY_COMPANY">Cancelled by Company</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={handleCompanyFilterChange} value={companyFilter || "ALL"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Companies</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={handleServiceFilterChange} value={serviceFilter || "ALL"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Services</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={handleDateFilterChange} value={dateFilter || "ALL"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Dates</SelectItem>
                    <SelectItem value="TODAY">Today</SelectItem>
                    <SelectItem value="YESTERDAY">Yesterday</SelectItem>
                    <SelectItem value="LAST_WEEK">Last 7 Days</SelectItem>
                    <SelectItem value="LAST_MONTH">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={handlePriceFilterChange} value={priceFilter || "ALL"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Prices</SelectItem>
                    <SelectItem value="UNDER_50">Under $50</SelectItem>
                    <SelectItem value="50_100">$50 - $100</SelectItem>
                    <SelectItem value="100_200">$100 - $200</SelectItem>
                    <SelectItem value="OVER_200">Over $200</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
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
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <Clock className="mr-1 h-3 w-3" />
                                <span>{formatDate(request.date)}</span>
                              </div>
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
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <MapPin className="mr-1 h-3 w-3" />
                            <span className="truncate max-w-[150px]">{request.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.company ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center">
                                <Building2 className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                <span>{request.company.name}</span>
                              </div>
                              {request.assignedVehicle && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Car className="mr-1 h-3 w-3" />
                                  <span>{request.assignedVehicle}</span>
                                </div>
                              )}
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
                          {request.price ? (
                            <div className="flex items-center">
                              <DollarSign className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                              <span>{formatCurrency(request.price)}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not set</span>
                          )}
                          {request.paymentStatus && (
                            <Badge
                              variant={request.paymentStatus === "PAID" ? "default" : "secondary"}
                              className="mt-1"
                            >
                              {request.paymentStatus}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="w-full">
                            <Progress value={getRequestProgress(request.status)} className="h-2" />
                            <div className="text-xs text-muted-foreground mt-1 text-right">
                              {getRequestProgress(request.status)}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              title="View Details"
                              onClick={() => viewRequestDetails(request)}
                            >
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
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Active Requests</h2>
            <p className="text-muted-foreground mb-6">Requests that are currently in progress</p>
            {/* Same table structure as above, but filtered for active requests */}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Completed Requests</h2>
            <p className="text-muted-foreground mb-6">Successfully completed and paid requests</p>
            {/* Same table structure as above, but filtered for completed requests */}
          </div>
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Cancelled Requests</h2>
            <p className="text-muted-foreground mb-6">Requests that were cancelled or rejected</p>
            {/* Same table structure as above, but filtered for cancelled requests */}
          </div>
        </TabsContent>

        <TabsContent value="issues" className="mt-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Requests with Issues</h2>
            <p className="text-muted-foreground mb-6">Requests that require admin attention</p>
            {/* Same table structure as above, but filtered for requests with issues */}
          </div>
        </TabsContent>
      </Tabs>

      {/* Request Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>Complete information about request {selectedRequest?.id}</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <ScrollArea className="flex-1 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Request Information</h3>
                    <Separator className="my-2" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">ID:</div>
                      <div className="text-sm">{selectedRequest.id}</div>

                      <div className="text-sm font-medium">Service:</div>
                      <div className="text-sm">{selectedRequest.service}</div>

                      <div className="text-sm font-medium">Status:</div>
                      <div className="text-sm">
                        <Badge variant={getStatusVariant(selectedRequest.status) || "outline"}>
                          {selectedRequest.status.replace(/_/g, " ")}
                        </Badge>
                      </div>

                      <div className="text-sm font-medium">Date:</div>
                      <div className="text-sm">{formatDate(selectedRequest.date)}</div>

                      <div className="text-sm font-medium">Location:</div>
                      <div className="text-sm">{selectedRequest.location}</div>

                      <div className="text-sm font-medium">Price:</div>
                      <div className="text-sm">
                        {selectedRequest.price ? formatCurrency(selectedRequest.price) : "Not set"}
                      </div>

                      <div className="text-sm font-medium">Payment Status:</div>
                      <div className="text-sm">
                        {selectedRequest.paymentStatus ? (
                          <Badge variant={selectedRequest.paymentStatus === "PAID" ? "default" : "secondary"}>
                            {selectedRequest.paymentStatus}
                          </Badge>
                        ) : (
                          "Not paid"
                        )}
                      </div>

                      {selectedRequest.paymentMethod && (
                        <>
                          <div className="text-sm font-medium">Payment Method:</div>
                          <div className="text-sm">{selectedRequest.paymentMethod}</div>
                        </>
                      )}

                      <div className="text-sm font-medium">Has Issue:</div>
                      <div className="text-sm">
                        {selectedRequest.hasIssue ? (
                          <Badge variant="destructive">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional sections omitted for brevity */}
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export PDF
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact User
                </a>
              </Button>
            </div>
            <DialogClose asChild>
              <Button variant="default">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
