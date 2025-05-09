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
import { formatDate } from "@/lib/utils"
import { Search, Filter, FileText, Clock, CalendarDays, CreditCard, Download } from "lucide-react"
import { mockUserInvoices } from "@/data/mock-data"

export default function UserInvoices() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredInvoices, setFilteredInvoices] = useState(mockUserInvoices)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)

    if (!term.trim()) {
      setFilteredInvoices(mockUserInvoices)
      return
    }

    const filtered = mockUserInvoices.filter(
      (invoice) =>
        invoice.service.toLowerCase().includes(term) ||
        invoice.company.toLowerCase().includes(term) ||
        invoice.status.toLowerCase().includes(term) ||
        invoice.id.toLowerCase().includes(term),
    )

    setFilteredInvoices(filtered)
  }

  // Helper to get badge variant based on invoice status
  const getInvoiceStatusVariant = (status: string) => {
    switch (status) {
      case "PAID":
        return "success"
      case "PENDING":
        return "default"
      case "OVERDUE":
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
        <h1 className="text-3xl font-bold tracking-tight">My Invoices</h1>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Invoices</CardTitle>
            <CardDescription>View and manage all your service invoices</CardDescription>
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
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No invoices found. Try adjusting your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div className="font-medium">{invoice.id}</div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <FileText className="mr-1 h-3 w-3" />
                            {invoice.requestId}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{invoice.service}</div>
                          <div className="text-xs text-muted-foreground mt-1">{invoice.company}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                            <span>{formatDate(invoice.date)}</span>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <CalendarDays className="mr-1 h-3 w-3" />
                            Due: {formatDate(invoice.dueDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">${invoice.amount.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground mt-1">{invoice.paymentMethod || "-"}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getInvoiceStatusVariant(invoice.status)}>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {invoice.status === "PENDING" && (
                              <Button size="sm">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Pay
                              </Button>
                            )}
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
