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

export default function AdminCompanies() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    action: "verify" | "suspend" | "activate";
  } | null>(null);

  // Fetch companies from API
  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await api.rescueCompanies.getCompanies();
      setCompanies(res.data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to load companies",
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

  const openDetailDialog = (company: Company) => {
    setCurrentCompany(company);
    setIsDetailDialogOpen(true);
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
                              onClick={() => openDetailDialog(company)}
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

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        {currentCompany && (
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Company Details</DialogTitle>
              <DialogDescription>
                Detailed information about {currentCompany.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={
                      currentCompany.logo ||
                      `https://avatar.vercel.sh/${currentCompany.name}`
                    }
                  />
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
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Contact Information
                  </h4>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Email:</span>{" "}
                      {currentCompany.email}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Phone:</span>{" "}
                      {currentCompany.phone}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Company Information
                  </h4>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Founded:</span>{" "}
                      {currentCompany.foundedYear}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Joined Platform:</span>{" "}
                      {currentCompany.joinDate}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Location
                </h4>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{currentCompany.address}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold">
                    {currentCompany.vehicles}
                  </div>
                  <div className="text-xs text-muted-foreground">Vehicles</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold">
                    {currentCompany.completedRequests}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Completed Requests
                  </div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold">
                    {currentCompany.rating}{" "}
                    <span className="text-lg text-yellow-500">★</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Customer Rating
                  </div>
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
              <Button
                variant="default"
                onClick={() => setIsDetailDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

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
