"use client"

import type React from "react"

import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getStatusVariant, formatDate } from "@/lib/utils"
import { PlusCircle, Search, Filter, Car, Clock, MapPin } from "lucide-react"

// Mock data
const mockRequests = [
  {
    id: "req-001",
    service: "Flat Tire Replacement",
    status: "COMPLETED",
    date: "2023-05-01T10:30:00",
    company: "FastFix Roadside",
    location: "123 Main St, Anytown",
    price: 85.0,
  },
  {
    id: "req-002",
    service: "Battery Jump Start",
    status: "IN_PROGRESS",
    date: "2023-05-05T14:15:00",
    company: "QuickHelp Auto",
    location: "456 Oak Ave, Somewhere",
    price: 65.0,
  },
  {
    id: "req-003",
    service: "Vehicle Towing",
    status: "CREATED",
    date: "2023-05-07T09:00:00",
    company: null,
    location: "789 Pine Rd, Nowhere",
    price: null,
  },
  {
    id: "req-004",
    service: "Fuel Delivery",
    status: "CANCELLED_BY_USER",
    date: "2023-04-29T11:30:00",
    company: null,
    location: "321 Cedar St, Anytown",
    price: null,
  },
  {
    id: "req-005",
    service: "Lockout Service",
    status: "ACCEPTED_BY_COMPANY",
    date: "2023-05-06T16:45:00",
    company: "FastFix Roadside",
    location: "555 Maple Ave, Somewhere",
    price: 70.0,
  },
]

export default function UserRequests() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredRequests, setFilteredRequests] = useState(mockRequests)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)

    if (!term.trim()) {
      setFilteredRequests(mockRequests)
      return
    }

    const filtered = mockRequests.filter(
      (request) =>
        request.service.toLowerCase().includes(term) ||
        request.location.toLowerCase().includes(term) ||
        request.status.toLowerCase().includes(term) ||
        (request.company && request.company.toLowerCase().includes(term)),
    )

    setFilteredRequests(filtered)
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
        <h1 className="text-3xl font-bold tracking-tight">My Requests</h1>
        <Button asChild>
          <Link to="/user/requests/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Request
          </Link>
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Requests</CardTitle>
            <CardDescription>View and manage all your roadside assistance requests</CardDescription>
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
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No requests found. Try adjusting your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="font-medium">{request.service}</div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <MapPin className="mr-1 h-3 w-3" />
                            {request.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                            <span>{formatDate(request.date)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(request.status) || "outline"}>
                            {request.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.company ? (
                            <div className="flex items-center">
                              <Car className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                              <span>{request.company}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>{request.price ? `$${request.price.toFixed(2)}` : "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/user/requests/${request.id}`}>View</Link>
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
