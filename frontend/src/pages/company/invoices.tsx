"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  Filter,
  FileText,
  Clock,
  User,
  Download,
  Send,
  DollarSign,
  Loader2,
} from "lucide-react";
import api from "@/services/api";

interface Invoice {
  id: string;
  invoiceNumber: string;
  rescueRequestId: string;
  user: { id: string; name: string; email?: string };
  service: string;
  amount: number;
  invoiceDate: string;
  dueDate: string;
  paidDate: string | null;
  status: "PAID" | "PENDING" | "OVERDUE" | "SENT" | "DRAFT";
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
}

export default function CompanyInvoices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      try {
        const response = await api.invoices.getCompanyInvoices();
        // Map về interface chuẩn
        const mapped = response.data.map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber || inv.id,
          rescueRequestId: inv.rescueRequestId || inv.requestId,
          user: inv.user || {
            id: inv.userId,
            name: inv.userName,
            email: inv.userEmail,
          },
          service: inv.serviceName || inv.service || "",
          amount: inv.amount,
          invoiceDate: inv.invoiceDate || inv.date || inv.createdAt,
          dueDate: inv.dueDate,
          paidDate: inv.paidDate,
          status: inv.status,
          paymentMethod: inv.paymentMethod,
          notes: inv.notes,
          createdAt: inv.createdAt,
        }));
        setInvoices(mapped);
        setFilteredInvoices(mapped);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error.response?.data?.message || "Failed to load invoices",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, [toast]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredInvoices(invoices);
      return;
    }
    const filtered = invoices.filter(
      (invoice) =>
        (invoice.invoiceNumber?.toLowerCase() || "").includes(term) ||
        (invoice.user?.name?.toLowerCase() || "").includes(term) ||
        (invoice.service?.toLowerCase() || "").includes(term) ||
        (invoice.status?.toLowerCase() || "").includes(term)
    );
    setFilteredInvoices(filtered);
  };

  // Helper to get badge variant based on invoice status
  const getInvoiceStatusVariant = (status: string) => {
    switch (status) {
      case "PAID":
        return "success";
      case "SENT":
        return "default";
      case "DRAFT":
        return "outline";
      case "OVERDUE":
        return "destructive";
      case "PENDING":
        return "default";
      default:
        return "outline";
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

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
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div
        variants={itemVariants}
        className="flex items-center space-x-2"
      >
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Manage Invoices</CardTitle>
            <CardDescription>
              Create, send and track payment for your services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search invoices..."
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
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No invoices found. Try adjusting your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div className="font-medium">
                            {invoice.invoiceNumber}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <FileText className="mr-1 h-3 w-3" />
                            {invoice.rescueRequestId}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                            <span>{invoice.user?.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {invoice.user?.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            ${invoice.amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {invoice.paymentMethod || "Not paid"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getInvoiceStatusVariant(invoice.status)}
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                            <span>
                              Created: {formatDate(invoice.invoiceDate)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Due: {formatDate(invoice.dueDate)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
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
  );
}
