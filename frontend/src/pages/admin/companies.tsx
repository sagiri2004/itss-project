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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  Truck,
} from "lucide-react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom"; // Added import

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  joinDate: string;
  foundedYear?: string;
  vehicles: number;
  completedRequests: number;
  rating: number;
  status: "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED" | string;
  isVerified: boolean;
}

// Mock Data
const mockCompanies: Company[] = [
  {
    id: "1",
    name: "Alpha Towing & Recovery",
    email: "contact@alphatowing.com",
    phone: "555-0101",
    address: "123 Main St, Anytown, USA",
    logo: "https://avatar.vercel.sh/alpha",
    joinDate: "2023-01-15",
    foundedYear: "2010",
    vehicles: 12,
    completedRequests: 1500,
    rating: 4.7,
    status: "ACTIVE",
    isVerified: true,
  },
  {
    id: "2",
    name: "Beta Roadside Assistance",
    email: "support@betaroadside.com",
    phone: "555-0202",
    address: "456 Oak Ave, Otherville, USA",
    logo: "https://avatar.vercel.sh/beta",
    joinDate: "2024-02-20",
    foundedYear: "2018",
    vehicles: 8,
    completedRequests: 650,
    rating: 4.5,
    status: "PENDING_VERIFICATION",
    isVerified: false,
  },
  {
    id: "3",
    name: "Gamma Transport Solutions",
    email: "info@gammatransport.co",
    phone: "555-0303",
    address: "789 Pine Ln, Sometown, USA",
    logo: "https://avatar.vercel.sh/gamma",
    joinDate: "2022-11-01",
    foundedYear: "2015",
    vehicles: 25,
    completedRequests: 2200,
    rating: 4.2,
    status: "SUSPENDED",
    isVerified: true,
  },
  {
    id: "4",
    name: "Delta Quick Rescue",
    email: "help@deltarescue.net",
    phone: "555-0404",
    address: "101 Maple Dr, Anycity, USA",
    logo: "https://avatar.vercel.sh/delta",
    joinDate: "2023-08-10",
    foundedYear: "2020",
    vehicles: 5,
    completedRequests: 300,
    rating: 4.9,
    status: "ACTIVE",
    isVerified: true,
  },
];

export default function AdminCompanies() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    action: "verify" | "suspend" | "activate";
  } | null>(null);
  const navigate = useNavigate();

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      // Use mock data instead of API call
      setCompanies(mockCompanies);
      // const res = await api.rescueCompanies.getCompanies();
      // setCompanies(res.data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          // error.response?.data?.message || "Failed to load companies", 
          "Failed to load companies (mock data error simulation)", // Using mock data error message
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (companyId: string) => {
    navigate(`/company/${companyId}`);
  };

  const verifyCompany = async (id: string) => {
    try {
      await api.rescueCompanies.verifyCompany(id);
      toast({
        title: "Company verified",
        description: "The company has been verified successfully.",
      });
      fetchCompanies();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to verify company",
      });
    }
  };

  const suspendCompany = async (id: string) => {
    try {
      await api.rescueCompanies.updateCompany(id, { status: "SUSPENDED" });
      toast({
        title: "Company suspended",
        description: "The company has been suspended from the platform.",
      });
      fetchCompanies();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to suspend company",
      });
    }
  };

  const activateCompany = async (id: string) => {
    try {
      await api.rescueCompanies.updateCompany(id, { status: "ACTIVE" });
      toast({
        title: "Company activated",
        description: "The company has been activated on the platform.",
      });
      fetchCompanies();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to activate company",
      });
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      switch (confirmAction.action) {
        case "verify":
          await verifyCompany(confirmAction.id);
          break;
        case "suspend":
          await suspendCompany(confirmAction.id);
          break;
        case "activate":
          await activateCompany(confirmAction.id);
          break;
      }
    } finally {
      setIsConfirmDialogOpen(false);
      setConfirmAction(null);
    }
  };

  // Helper to get badge variant based on company status
  const getCompanyStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">ACTIVE</Badge>;
      case "PENDING_VERIFICATION":
        return <Badge variant="outline">PENDING VERIFICATION</Badge>;
      case "SUSPENDED":
        return <Badge variant="destructive">SUSPENDED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Company Management</CardTitle>
            <CardDescription>
              Manage service provider companies on the platform
            </CardDescription>
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
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-6 text-muted-foreground"
                      >
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No companies found. Try adjusting your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={
                                  company.logo ||
                                  `https://avatar.vercel.sh/${company.name}`
                                }
                              />
                              <AvatarFallback>
                                {company.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
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
                          <div className="text-xs text-muted-foreground">
                            {company.phone}
                          </div>
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(company.id)} // Changed onClick handler
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Details
                            </Button>
                            {company.status === "PENDING_VERIFICATION" && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setConfirmAction({
                                    id: company.id,
                                    action: "verify",
                                  });
                                  setIsConfirmDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Verify
                              </Button>
                            )}
                            {company.status === "ACTIVE" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setConfirmAction({
                                    id: company.id,
                                    action: "suspend",
                                  });
                                  setIsConfirmDialogOpen(true);
                                }}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Suspend
                              </Button>
                            )}
                            {company.status === "SUSPENDED" && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setConfirmAction({
                                    id: company.id,
                                    action: "activate",
                                  });
                                  setIsConfirmDialogOpen(true);
                                }}
                              >
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

      {/* Removed Company Detail Dialog */}

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận thao tác</DialogTitle>
            <DialogDescription>
              {confirmAction?.action === "verify" &&
                "Bạn có chắc chắn muốn xác minh công ty này?"}
              {confirmAction?.action === "suspend" &&
                "Bạn có chắc chắn muốn tạm ngưng hoạt động của công ty này?"}
              {confirmAction?.action === "activate" &&
                "Bạn có chắc chắn muốn kích hoạt lại công ty này?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleConfirmAction}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
