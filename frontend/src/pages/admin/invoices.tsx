"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Search, Filter, FileText, Clock, User, Download, Building2, DollarSign, CalendarDays } from "lucide-react"
import api from "@/services/api"
import { useNavigate } from "react-router-dom"

// Interfaces
interface Invoice {
  id: string
  invoiceNumber: string
  requestId: string
  user: {
    id: string
    name: string
    email: string
  }
  company: {
    id: string
    name: string
  }
  service: string
  amount: number
  status: string
  date: string
  dueDate: string
  paymentMethod?: string
}

export default function AdminInvoices() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>("ALL")
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Kiểm tra quyền admin
    if (user?.role !== 'admin') {
      navigate('/login')
      return
    }

    const fetchInvoices = async () => {
      setIsLoading(true)
      try {
        // Gọi API với token admin
        const response = await api.admin.getInvoices()
        
        // Map dữ liệu về đúng interface
        const mappedInvoices: Invoice[] = response.data.map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber || inv.id,
          requestId: inv.rescueRequestId || inv.requestId || "",
          user: {
            id: inv.user?.id || inv.userId || "",
            name: inv.user?.name || inv.userName || "",
            email: inv.user?.email || inv.userEmail || ""
          },
          company: {
            id: inv.company?.id || inv.companyId || "",
            name: inv.company?.name || inv.companyName || ""
          },
          service: inv.service || inv.serviceName || "",
          amount: inv.amount || 0,
          status: inv.status || "",
          date: inv.date || inv.createdAt || "",
          dueDate: inv.dueDate || "",
          paymentMethod: inv.paymentMethod || ""
        }))

        setInvoices(mappedInvoices)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.response?.data?.message || "Could not load invoices"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvoices()
  }, [toast, user, navigate])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      (invoice.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.company.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.service || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.status || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || statusFilter === "ALL" || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Helper to get badge variant based on invoice status
  const getInvoiceStatusVariant = (status: string) => {
    switch (status) {
      case "PAID":
        return "success"
      case "SENT":
        return "default"
      case "DRAFT":
        return "outline"
      case "OVERDUE":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Calculate total revenue
  const totalRevenue = invoices
    .filter((invoice) => invoice.status === "PAID")
    .reduce((sum, invoice) => sum + invoice.amount, 0)

  // Calculate pending revenue
  const pendingRevenue = invoices
    .filter((invoice) => ["SENT", "OVERDUE"].includes(invoice.status))
    .reduce((sum, invoice) => sum + invoice.amount, 0)

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
          <p className="mt-2">Loading invoices...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground">From paid invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">${pendingRevenue.toFixed(2)}</div>
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-xs text-muted-foreground">From sent and overdue invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{invoices.length}</div>
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground">
                {invoices.filter((i) => i.status === "PAID").length} paid,
                {invoices.filter((i) => i.status === "OVERDUE").length} overdue
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>Monitor and manage all invoices across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search invoices..."
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
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No invoices found. Try adjusting your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div className="font-medium">{invoice.invoiceNumber}</div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <FileText className="mr-1 h-3 w-3" />
                            {invoice.requestId}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                            <span>{invoice.user.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{invoice.user.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Building2 className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                            <span>{invoice.company.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{invoice.service}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">${invoice.amount.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {invoice.paymentMethod || "Not paid"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getInvoiceStatusVariant(invoice.status)}>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                            <span>{formatDate(invoice.date)}</span>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <CalendarDays className="mr-1 h-3 w-3" />
                            <span>Due: {formatDate(invoice.dueDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <FileText className="mr-2 h-4 w-4" />
                              View
                            </Button>
                            <Button variant="outline" size="icon">
                              <Download className="h-4 w-4" />
                              <span className="sr-only">Download Invoice</span>
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
    </motion.div>
  )
}
