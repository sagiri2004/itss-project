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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Search, Eye, CheckCircle, XCircle, AlertTriangle, MapPin, Calendar, Truck } from "lucide-react"
import { mockCompanies } from "@/data/mock-data"

export default function AdminCompanies() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [companies, setCompanies] = useState(mockCompanies)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [currentCompany, setCurrentCompany] = useState<any>(null)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const openDetailDialog = (company: any) => {
    setCurrentCompany(company)
    setIsDetailDialogOpen(true)
  }

  const verifyCompany = (id: string) => {
    setCompanies(
      companies.map((company) =>
        company.id === id
          ? {
              ...company,
              isVerified: true,
              status: "ACTIVE",
            }
          : company,
      ),
    )

    const company = companies.find((c) => c.id === id)
    toast({
      title: "Company verified",
      description: `${company?.name} has been verified successfully.`,
    })
  }

  const suspendCompany = (id: string) => {
    setCompanies(
      companies.map((company) =>
        company.id === id
          ? {
              ...company,
              status: "SUSPENDED",
            }
          : company,
      ),
    )

    const company = companies.find((c) => c.id === id)
    toast({
      title: "Company suspended",
      description: `${company?.name} has been suspended from the platform.`,
    })
  }

  const activateCompany = (id: string) => {
    setCompanies(
      companies.map((company) =>
        company.id === id
          ? {
              ...company,
              status: "ACTIVE",
            }
          : company,
      ),
    )

    const company = companies.find((c) => c.id === id)
    toast({
      title: "Company activated",
      description: `${company?.name} has been activated on the platform.`,
    })
  }

  // Helper to get badge variant based on company status
  const getCompanyStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">ACTIVE</Badge>
      case "PENDING_VERIFICATION":
        return <Badge variant="outline">PENDING VERIFICATION</Badge>
      case "SUSPENDED":
        return <Badge variant="destructive">SUSPENDED</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
        <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Company Management</CardTitle>
            <CardDescription>Manage service provider companies on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search companies..."
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
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Vehicles</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No companies found. Try adjusting your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={company.logo || `https://avatar.vercel.sh/${company.name}`} />
                              <AvatarFallback>{company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{company.name}</div>
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <Calendar className="mr-1 h-3 w-3" />
                                <span>Joined: {company.joinDate}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{company.email}</div>
                          <div className="text-xs text-muted-foreground">{company.phone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Truck className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                            <span>{company.vehicles}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {company.completedRequests} requests completed
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="font-medium">{company.rating}</div>
                            <div className="ml-1 text-yellow-500">★</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            {getCompanyStatusBadge(company.status)}
                            {company.isVerified ? (
                              <div className="flex items-center text-xs text-green-500">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                <span>Verified</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                <span>Not Verified</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openDetailDialog(company)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Details
                            </Button>
                            {company.status === "PENDING_VERIFICATION" && (
                              <Button size="sm" onClick={() => verifyCompany(company.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Verify
                              </Button>
                            )}
                            {company.status === "ACTIVE" && (
                              <Button variant="outline" size="sm" onClick={() => suspendCompany(company.id)}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Suspend
                              </Button>
                            )}
                            {company.status === "SUSPENDED" && (
                              <Button size="sm" onClick={() => activateCompany(company.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate
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

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        {currentCompany && (
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Company Details</DialogTitle>
              <DialogDescription>Detailed information about {currentCompany.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={currentCompany.logo || `https://avatar.vercel.sh/${currentCompany.name}`} />
                  <AvatarFallback className="text-lg">
                    {currentCompany.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{currentCompany.name}</h3>
                  <div className="flex items-center mt-1">
                    {currentCompany.isVerified ? (
                      <Badge variant="success" className="mr-2">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="mr-2">
                        Not Verified
                      </Badge>
                    )}
                    {getCompanyStatusBadge(currentCompany.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Email:</span> {currentCompany.email}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Phone:</span> {currentCompany.phone}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Company Information</h4>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Founded:</span> {currentCompany.foundedYear}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Joined Platform:</span> {currentCompany.joinDate}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Location</h4>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{currentCompany.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold">{currentCompany.vehicles}</div>
                  <div className="text-xs text-muted-foreground">Vehicles</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold">{currentCompany.completedRequests}</div>
                  <div className="text-xs text-muted-foreground">Completed Requests</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold">
                    {currentCompany.rating} <span className="text-lg text-yellow-500">★</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Customer Rating</div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <div>
                <Button variant="outline" size="sm" className="mr-2">
                  <Eye className="mr-2 h-4 w-4" />
                  View Vehicles
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  View Requests
                </Button>
              </div>
              <Button variant="default" onClick={() => setIsDetailDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </motion.div>
  )
}
