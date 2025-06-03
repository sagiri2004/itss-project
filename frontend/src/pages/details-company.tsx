"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  MapPin,
  Phone,
  Star,
  ArrowLeft,
  Building2,
  DollarSign,
} from "lucide-react"
import { MapView } from "@/components/map/map-view"
import api from "@/services/api"

interface CompanyDetail {
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
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  companyId: string;
  companyName: string;
  averageRating?: number;
  totalRatings?: number;
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

interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!id) {
        console.error("Company ID is missing from params");
        setIsLoading(false);
        setCompany(null);
        return;
      }

      setIsLoading(true);
      try {
        const companyRes = await api.rescueCompanies.getCompanyById(id);
        if (companyRes.data) {
          setCompany(companyRes.data);
        }

        const servicesRes = await api.rescueServices.getCompanyServices(id);
        if (servicesRes.data) {
          const servicesWithRatings = await Promise.all(
            servicesRes.data.map(async (service: Service) => {
              try {
                const ratingsRes = await api.ratings.getServiceRatings(service.id);
                const serviceRatings = ratingsRes.data;
                const averageRating = serviceRatings.length > 0
                  ? serviceRatings.reduce((acc: number, curr: Rating) => acc + curr.stars, 0) / serviceRatings.length
                  : 0;
                
                return {
                  ...service,
                  averageRating: Number(averageRating.toFixed(1)),
                  totalRatings: serviceRatings.length
                };
              } catch (error) {
                console.error(`Error fetching ratings for service ${service.id}:`, error);
                return {
                  ...service,
                  averageRating: 0,
                  totalRatings: 0
                };
              }
            })
          );
          setServices(servicesWithRatings);
        }

        const ratingsRes = await api.ratings.getCompanyRatings(id);
        if (ratingsRes.data) {
          setRatings(ratingsRes.data);
          
          const totalRatings = ratingsRes.data.length;
          const averageRating = totalRatings > 0
            ? ratingsRes.data.reduce((acc: number, curr: Rating) => acc + curr.stars, 0) / totalRatings
            : 0;

          const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          ratingsRes.data.forEach((rating: Rating) => {
            distribution[rating.stars as keyof typeof distribution]++;
          });

          setRatingStats({
            averageRating,
            totalRatings,
            ratingDistribution: distribution
          });
        }
      } catch (error: any) {
        console.error("Failed to fetch company data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.response?.data?.message || "Failed to load company information.",
        });
        setCompany(null);
        setServices([]);
        setRatings([]);
        setRatingStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [id, toast]);

  const handleBack = () => {
    if (user?.role === "admin") {
      navigate("/admin/companies");
    } else {
      navigate(-1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
    ));
  };

  const renderRatingDistribution = () => {
    if (!ratingStats) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = ratingStats.ratingDistribution[stars as keyof typeof ratingStats.ratingDistribution] || 0;
          const percentage = ratingStats.totalRatings > 0 ? (count / ratingStats.totalRatings) * 100 : 0;

          return (
            <div key={stars} className="flex items-center gap-2 text-sm">
              <span className="w-8 text-foreground">{stars}</span>
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right text-foreground">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 260, damping: 20 },
    },
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-foreground">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Company not found</h2>
          <p className="text-muted-foreground mt-2">
            The company you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-6 sm:py-8 space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-4 mb-4 sm:mb-6">
        <Button variant="outline" onClick={handleBack} className="hover:bg-muted">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Company Details</h1>
      </motion.div>

      {/* Company Header */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border border-border">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 sm:p-8 text-primary-foreground">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-background">
                  <AvatarImage src={`https://avatar.vercel.sh/${company.name}`} />
                  <AvatarFallback className="text-lg sm:text-xl">{company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl sm:text-2xl font-bold">{company.name}</h2>
                  </div>
                  <p className="text-sm sm:text-base text-primary-foreground/90 mb-4">{company.description}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-background/20 rounded-lg p-3 text-center">
                      <div className="text-lg sm:text-xl font-bold">{(ratingStats?.averageRating || 0).toFixed(1)}</div>
                      <div className="text-xs sm:text-sm flex items-center justify-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        Rating
                      </div>
                    </div>
                    <div className="bg-background/20 rounded-lg p-3 text-center">
                      <div className="text-lg sm:text-xl font-bold">{ratingStats?.totalRatings || 0}</div>
                      <div className="text-xs sm:text-sm">Reviews</div>
                    </div>
                    <div className="bg-background/20 rounded-lg p-3 text-center">
                      <div className="text-lg sm:text-xl font-bold">{services.length}</div>
                      <div className="text-xs sm:text-sm">Services</div>
                    </div>
                    <div className="bg-background/20 rounded-lg p-3 text-center">
                      <div className="text-lg sm:text-xl font-bold">{company.address.city}</div>
                      <div className="text-xs sm:text-sm">Location</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
        <TabsList className="w-full justify-start p-1 bg-muted rounded-lg">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Services ({services.length})
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Reviews ({ratings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <motion.div variants={itemVariants}>
              <Card className="bg-card border border-border">
                <CardHeader className="border-b border-border">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Phone className="h-5 w-5 text-indigo-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1 text-foreground">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {[
                          company.address.street,
                          company.address.ward,
                          company.address.district,
                          company.address.city,
                          company.address.country
                        ].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1 text-foreground">Phone</p>
                      <p className="text-sm text-muted-foreground">{company.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-card border border-border">
                <CardHeader className="border-b border-border">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1 text-foreground">Company ID</p>
                      <p className="text-sm text-muted-foreground">{company.id}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1 text-foreground">Coordinates</p>
                      <p className="text-sm text-muted-foreground">
                        Lat: {company.latitude}, Long: {company.longitude}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <Card className="bg-card border border-border">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <MapView
                  markers={[
                    {
                      id: company.id,
                      position: [company.latitude, company.longitude],
                      type: "user",
                      label: company.name,
                    },
                  ]}
                  center={[company.latitude, company.longitude]}
                  zoom={15}
                  height="400px"
                />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <motion.div key={service.id} variants={itemVariants}>
                <Card className="h-full hover:shadow-md transition-shadow bg-card border border-border">
                  <CardHeader className="border-b border-border">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base sm:text-lg text-foreground">{service.name}</CardTitle>
                      <Badge variant="outline" className="bg-muted text-indigo-600">{service.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 sm:pt-6 space-y-3">
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-foreground">${service.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-foreground">
                          {service.averageRating?.toFixed(1) || "0.0"} ({service.totalRatings || 0})
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            <motion.div variants={itemVariants}>
              <Card className="bg-card border border-border">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-foreground">Rating Overview</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6">
                  {ratingStats ? (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl font-bold text-indigo-600">{(ratingStats?.averageRating || 0).toFixed(1)}</div>
                        <div className="flex justify-center gap-1 mt-2">
                          {renderStars(Math.round(ratingStats?.averageRating || 0))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Based on {ratingStats?.totalRatings || 0} reviews
                        </p>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium text-center text-foreground">Rating Distribution</h4>
                        {renderRatingDistribution()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-6 sm:py-8">
                      <Star className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                      <p>No ratings yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="md:col-span-2">
              <Card className="bg-card border border-border">
                <CardHeader className="border-b border-border">
                  <CardTitle className="text-foreground">Customer Reviews</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    What customers are saying about {company.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {ratings.length > 0 ? (
                    <div className="divide-y divide-border">
                      {ratings.map((rating) => (
                        <div key={rating.id} className="p-4 sm:p-6 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between mb-2 sm:mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-foreground">{rating.userName}</span>
                                {rating.serviceName && (
                                  <Badge variant="outline" className="text-xs bg-muted text-indigo-600">
                                    {rating.serviceName}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1">{renderStars(rating.stars)}</div>
                            </div>
                            <span className="text-sm text-muted-foreground">{formatDate(rating.createdAt)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{rating.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8 sm:py-12">
                      <Star className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                      <h3 className="text-base sm:text-lg font-medium mb-2 text-foreground">No reviews yet</h3>
                      <p>This company hasn't received any reviews yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}