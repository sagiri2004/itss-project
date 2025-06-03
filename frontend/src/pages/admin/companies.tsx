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
  phone: string;
  description: string;
  address: {
    street: string;
    ward: string;
    district: string | null;
    city: string;
    country: string;
    fullAddress: string;
    latitude: number;
    longitude: number;
  };
  latitude: number;
  longitude: number;
  userId: string;
  rating?: number; // Optional since we'll calculate it
}

interface Rating {
  id: string;
  companyId: string;
  companyName: string;
  serviceId: string;
  serviceName: string;
  userId: string;
  userName: string;
  stars: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

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
      const res = await api.rescueCompanies.getCompanies();
      const companiesData = res.data;

      // Fetch ratings for each company
      const companiesWithRatings = await Promise.all(
        companiesData.map(async (company: Company) => {
          try {
            const ratingsRes = await api.ratings.getCompanyRatings(company.id);
            const ratings: Rating[] = ratingsRes.data;
            
            // Calculate average rating
            const averageRating = ratings.length > 0
              ? ratings.reduce((acc, curr) => acc + curr.stars, 0) / ratings.length
              : 0;

            return {
              ...company,
              rating: Number(averageRating.toFixed(1))
            };
          } catch (error) {
            console.error(`Error fetching ratings for company ${company.id}:`, error);
            return {
              ...company,
              rating: 0
            };
          }
        })
      );

      setCompanies(companiesWithRatings);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to load companies",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.address.fullAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (companyId: string) => {
    navigate(`/company/details/${companyId}`);
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
                    <TableHead>Address</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-6 text-muted-foreground"
                      >
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
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
                                src={`https://avatar.vercel.sh/${company.name}`}
                              />
                              <AvatarFallback>
                                {company.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{company.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {company.description.substring(0, 50)}...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{company.phone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{company.address.fullAddress}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="font-medium">{company.rating}</div>
                            <div className="ml-1 text-yellow-500">★</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(company.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Details
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
