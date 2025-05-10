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
import { useToast } from "@/components/ui/use-toast"
import { Search, Filter, FileText, Clock, User, Download, Send, DollarSign } from "lucide-react"
import { mockInvoices } from "@/data/mock-data"

export default function CompanyInvoices() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [invoices, setInvoices] = useState(mockInvoices)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle sending an invoice
  const handleSendInvoice = (id: string) => {
    setInvoices(
      invoices.map((invoice) =>
        invoice.id === id
          ? {
              ...invoice,
              status: "SENT",
              sentDate: new Date().toISOString(),
            }
          : invoice,
      ),
    )

    toast({
      title: "Invoice sent",
      description: `Invoice #${id} has been sent to the customer.`,
    })
  }

  // Handle marking an invoice as paid
  const handleMarkAsPaid = (id: string) => {
    setInvoices(
      invoices.map((invoice) =>
        invoice.id === id
          ? {
              ...invoice,
              status: "PAID",
              paidDate: new Date().toISOString(),
              paymentMethod: "Manual Entry",
            }
          : invoice,
      ),
    )

    toast({
      title: "Invoice marked as paid",
      description: `Invoice #${id} has been marked as paid.`,
    })
  }

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
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Manage Invoices</CardTitle>
            <CardDescription>Create, send and track payment for your services</CardDescription>
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
                    <TableHead>Service</TableHead>
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
                          <div className="font-medium">{invoice.id}</div>
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
                        <TableCell>{invoice.service}</TableCell>
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
                            <span>Created: {formatDate(invoice.date)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Due: {formatDate(invoice.dueDate)}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {invoice.status === "DRAFT" && (
                              <Button size="sm" onClick={() => handleSendInvoice(invoice.id)}>
                                <Send className="mr-2 h-4 w-4" />
                                Send
                              </Button>
                            )}
                            {["SENT", "OVERDUE"].includes(invoice.status) && (
                              <Button size="sm" onClick={() => handleMarkAsPaid(invoice.id)}>
                                <DollarSign className="mr-2 h-4 w-4" />
                                Mark Paid
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
