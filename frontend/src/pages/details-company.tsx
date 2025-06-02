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
  Mail,
  Globe,
  Clock,
  Star,
  Calendar,
  Users,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Building2,
} from "lucide-react"
import api from "@/services/api"

// --- START MOCK DATA ---
const mockCompanyDetails: { [key: string]: CompanyDetail } = {
  "1": {
    id: "1",
    name: "Alpha Towing & Recovery",
    logo: "https://avatar.vercel.sh/alpha",
    email: "contact@alphatowing.com",
    phone: "555-0101",
    address: "123 Main St, Anytown, USA",
    website: "https://alphatowing.com",
    description: "Your #1 source for reliable towing and roadside assistance. Serving Anytown with pride.",
    foundedYear: "2010",
    employees: 15,
    operatingHours: "24/7",
    serviceArea: "Anytown and surrounding 50-mile radius",
    isVerified: true,
    status: "ACTIVE",
    joinDate: "2023-01-15",
    stats: {
      totalRequests: 1800,
      completedRequests: 1500,
      averageRating: 4.7,
      totalRatings: 120,
      vehicleCount: 12,
    },
  },
  "2": {
    id: "2",
    name: "Beta Roadside Assistance",
    logo: "https://avatar.vercel.sh/beta",
    email: "support@betaroadside.com",
    phone: "555-0202",
    address: "456 Oak Ave, Otherville, USA",
    website: "https://betaroadside.com",
    description: "Fast and friendly roadside help when you need it most. We cover Otherville and beyond.",
    foundedYear: "2018",
    employees: 10,
    operatingHours: "Mon-Fri 8am-10pm, Sat-Sun 9am-9pm",
    serviceArea: "Otherville, Anycity",
    isVerified: false,
    status: "PENDING_VERIFICATION",
    joinDate: "2024-02-20",
    stats: {
      totalRequests: 700,
      completedRequests: 650,
      averageRating: 4.5,
      totalRatings: 80,
      vehicleCount: 8,
    },
  },
  "3": {
    id: "3",
    name: "Gamma Transport Solutions",
    logo: "https://avatar.vercel.sh/gamma",
    email: "info@gammatransport.co",
    phone: "555-0303",
    address: "789 Pine Ln, Sometown, USA",
    website: "https://gammatransport.co",
    description: "Heavy-duty towing and transport solutions. No job too big or too small for Gamma.",
    foundedYear: "2015",
    employees: 30,
    operatingHours: "24/7",
    serviceArea: "Sometown, Anytown, Otherville",
    isVerified: true,
    status: "SUSPENDED",
    joinDate: "2022-11-01",
    stats: {
      totalRequests: 2500,
      completedRequests: 2200,
      averageRating: 4.2,
      totalRatings: 200,
      vehicleCount: 25,
    },
  },
  "4": {
    id: "4",
    name: "Delta Quick Rescue",
    logo: "https://avatar.vercel.sh/delta",
    email: "help@deltarescue.net",
    phone: "555-0404",
    address: "101 Maple Dr, Anycity, USA",
    website: "https://deltarescue.net",
    description: "Lightning-fast rescue services. Delta gets you back on the road quickly and safely.",
    foundedYear: "2020",
    employees: 8,
    operatingHours: "24/7 Emergency, Mon-Fri 9am-5pm for appointments",
    serviceArea: "Anycity",
    isVerified: true,
    status: "ACTIVE",
    joinDate: "2023-08-10",
    stats: {
      totalRequests: 400,
      completedRequests: 300,
      averageRating: 4.9,
      totalRatings: 50,
      vehicleCount: 5,
    },
  },
};

const mockReviewsData: { [key: string]: Review[] } = {
  "1": [
    { id: "r1a", stars: 5, comment: "Alpha Towing was incredibly fast and professional. Highly recommend!", createdAt: "2024-05-20T10:00:00Z", user: { name: "Alice Wonderland" }, service: { name: "Towing" } },
    { id: "r2a", stars: 4, comment: "Good service, fair price. Took a little while but got the job done.", createdAt: "2024-05-18T14:30:00Z", user: { name: "Bob The Builder" } },
  ],
  "2": [
    { id: "r1b", stars: 5, comment: "Beta Roadside helped me with a flat tire, very courteous.", createdAt: "2024-04-10T09:00:00Z", user: { name: "Carol Danvers" } },
  ],
  "4": [
    { id: "r1d", stars: 5, comment: "Delta is the BEST! Super quick response for a jump start.", createdAt: "2024-03-15T11:00:00Z", user: { name: "David Copperfield" }, service: { name: "Jump Start" } },
    { id: "r2d", stars: 5, comment: "Fantastic service from Delta Quick Rescue. Saved my day!", createdAt: "2024-02-22T16:45:00Z", user: { name: "Eve Moneypenny" } },
  ],
};

const mockRatingStatsData: { [key: string]: RatingStats } = {
  "1": {
    averageRating: 4.7,
    totalRatings: 120,
    ratingDistribution: { "1": 2, "2": 5, "3": 13, "4": 40, "5": 60 },
  },
  "2": {
    averageRating: 4.5,
    totalRatings: 80,
    ratingDistribution: { "1": 1, "2": 3, "3": 10, "4": 30, "5": 36 },
  },
  "3": { // Suspended company, might have old ratings
    averageRating: 4.2,
    totalRatings: 200,
    ratingDistribution: { "1": 10, "2": 20, "3": 50, "4": 70, "5": 50 },
  },
  "4": {
    averageRating: 4.9,
    totalRatings: 50,
    ratingDistribution: { "1": 0, "2": 1, "3": 2, "4": 10, "5": 37 },
  },
};
// --- END MOCK DATA ---

interface CompanyDetail {
  id: string
  name: string
  logo?: string
  email: string
  phone: string
  address: string
  website?: string
  description: string
  foundedYear?: string
  employees?: number
  operatingHours?: string
  serviceArea: string
  isVerified: boolean
  status: string // Added status to CompanyDetail
  joinDate: string // Added joinDate
  stats: { // Added stats object
    totalRequests: number
    completedRequests: number
    averageRating: number
    totalRatings: number
    vehicleCount: number
  }
}

interface Review { // This interface might need adjustment based on what api.ratings.getCompanyRatings returns
  id: string
  stars: number
  comment: string
  createdAt: string // Or Date
  user: {
    name: string
    // Consider adding avatar if available
  }
  service?: {
    name: string
  }
  // Add other fields returned by your API for reviews/ratings
}

interface RatingStats {
  averageRating: number
  totalRatings: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [company, setCompany] = useState<CompanyDetail | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!id) {
        console.error("Company ID is missing from params")
        setIsLoading(false)
        setCompany(null);
        return
      }

      setIsLoading(true)
      try {
        console.log(`Fetching all data for company ID: ${id} (USING MOCK DATA)`)

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const companyData = mockCompanyDetails[id];
        const reviewsData = mockReviewsData[id] || [];
        const ratingStatsData = mockRatingStatsData[id] || null;

        if (companyData) {
          setCompany(companyData);
          setReviews(reviewsData);
          setRatingStats(ratingStatsData);
          console.log("Using MOCK Company Data:", companyData);
        } else {
          console.warn(`No MOCK data for company ID: ${id}.`);
          setCompany(null);
          setReviews([]);
          setRatingStats(null);
        }

        /*
        // Original API Calls - Commented out for mock data usage
        const [companyRes, reviewsRes, ratingStatsRes] = await Promise.all([
          api.rescueCompanies.getCompanyById(id),
          api.ratings.getCompanyRatings(id), 
          api.ratings.getCompanyRatingSummary(id) 
        ]);

        console.log("Company API Response:", companyRes);
        if (companyRes.data) {
          setCompany(companyRes.data);
        } else {
          console.warn("No data received from API for company details:", id);
          setCompany(null); 
        }

        console.log("Reviews API Response:", reviewsRes);
        if (reviewsRes.data) {
          setReviews(reviewsRes.data);
        } else {
          console.warn("No data received from API for company reviews:", id);
          setReviews([]);
        }

        console.log("Rating Stats API Response:", ratingStatsRes);
        if (ratingStatsRes.data) {
          setRatingStats(ratingStatsRes.data);
        } else {
          console.warn("No data received from API for company rating stats:", id);
          setRatingStats(null);
        }

        if (!companyRes.data) {
            setCompany(null);
        }
        */

      } catch (error: any) {
        console.error("Failed to fetch company data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: error.response?.data?.message || "Failed to load company information.",
        })
        setCompany(null) // Set company to null on error to show "Company not found"
        setReviews([])
        setRatingStats(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanyData()
  }, [id, toast])

  const handleBack = () => {
    if (user?.role === "admin") {
      navigate("/admin/companies")
    } else {
      navigate(-1)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  const renderRatingDistribution = () => {
    if (!ratingStats) return null

    const maxCount = Math.max(...Object.values(ratingStats.ratingDistribution))

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = ratingStats.ratingDistribution[stars as keyof typeof ratingStats.ratingDistribution] || 0
          const percentage = ratingStats.totalRatings > 0 ? (count / ratingStats.totalRatings) * 100 : 0

          return (
            <div key={stars} className="flex items-center gap-2 text-sm">
              <span className="w-8">{stars}</span>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-right">{count}</span>
            </div>
          )
        })}
      </div>
    )
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading company details...</p>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Company not found</h2>
          <p className="text-muted-foreground mt-2">
            The company you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Company Details</h1>
      </motion.div>

      {/* Company Header */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={company.logo || `https://avatar.vercel.sh/${company.name}`} />
                <AvatarFallback className="text-2xl">{company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{company.name}</h2>
                  {company.isVerified ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Not Verified
                    </Badge>
                  )}
                  <Badge variant={company.status === "ACTIVE" ? "success" : "destructive"}>{company.status}</Badge>
                </div>
                <p className="text-muted-foreground mb-4">{company.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{(company.stats?.averageRating || ratingStats?.averageRating || 0).toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      Rating
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{company.stats?.completedRequests || 0}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{company.stats?.vehicleCount || 0}</div>
                    <div className="text-sm text-muted-foreground">Vehicles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{company.stats?.totalRatings || ratingStats?.totalRatings || 0}</div>
                    <div className="text-sm text-muted-foreground">Reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{company.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{company.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{company.email}</p>
                    </div>
                  </div>
                  {company.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Website</p>
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {company.website}
                        </a>
                      </div>
                    </div>
                  )}
                  {company.operatingHours && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Operating Hours</p>
                        <p className="text-sm text-muted-foreground">{company.operatingHours}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Founded</p>
                      <p className="text-sm text-muted-foreground">{company.foundedYear || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Employees</p>
                      <p className="text-sm text-muted-foreground">{company.employees || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Service Area</p>
                      <p className="text-sm text-muted-foreground">{company.serviceArea}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Joined Platform</p>
                      <p className="text-sm text-muted-foreground">{formatDate(company.joinDate)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Rating Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {ratingStats ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold">{(ratingStats?.averageRating || 0).toFixed(1)}</div>
                        <div className="flex justify-center gap-1 mt-1">
                          {renderStars(Math.round(ratingStats?.averageRating || 0))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Based on {ratingStats?.totalRatings || 0} reviews
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Rating Distribution</h4>
                        {renderRatingDistribution()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">No ratings yet</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                  <CardDescription>What customers are saying about {company.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {reviews.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{review.user.name}</span>
                                {review.service && (
                                  <Badge variant="outline" className="text-xs">
                                    {review.service.name}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1">{renderStars(review.stars)}</div>
                            </div>
                            <span className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
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
  )
}
