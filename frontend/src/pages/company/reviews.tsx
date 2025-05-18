"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { ReviewList } from "@/components/reviews/review-list";
import { ReviewChart } from "@/components/reviews/review-chart";
import api from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function CompanyReviewsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [ratingSummary, setRatingSummary] = useState<any>(null);
  const [reviewedServices, setReviewedServices] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("all");

  useEffect(() => {
    if (user) {
      setCompanyId(user.companyId || "");
      setCurrentUserId(user.id || "");
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!companyId) return;

      setLoadingSummary(true);
      setLoadingServices(true);

      try {
        const [summaryRes, servicesRes] = await Promise.all([
          api.ratings.getCompanyRatingSummary(companyId),
          api.ratings.getReviewedServicesByCompany(companyId),
        ]);
        setRatingSummary(summaryRes.data);
        setReviewedServices(servicesRes.data);
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            err.response?.data?.message || "Unable to load review data",
        });
        setRatingSummary(null);
        setReviewedServices([]);
      } finally {
        setLoadingSummary(false);
        setLoadingServices(false);
      }
    };
    fetchData();
  }, [companyId, toast]);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Service Reviews</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSummary ? (
                <Skeleton className="h-60 w-full rounded-lg" />
              ) : ratingSummary ? (
                <ReviewChart data={ratingSummary} />
              ) : (
                <div className="text-muted-foreground">
                  No statistics data available
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Reviewed Services</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingServices ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : reviewedServices.length === 0 ? (
                <div className="text-muted-foreground">
                  No services have been reviewed yet
                </div>
              ) : (
                <div className="space-y-4">
                  <Select
                    value={selectedServiceId}
                    onValueChange={setSelectedServiceId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn dịch vụ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All services</SelectItem>
                      {reviewedServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} (Average:{" "}
                          {service.averageRating.toFixed(1)} stars,{" "}
                          {service.totalRatings} reviews)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="space-y-4">
                    {reviewedServices.map((service) => (
                      <div
                        key={service.id}
                        className="border-b py-3 last:border-b-0"
                      >
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.description}
                        </div>
                        <div className="text-sm">
                          Average: {service.averageRating.toFixed(1)} stars (
                          {service.totalRatings} reviews)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Tabs defaultValue="all-reviews" className="space-y-4">
            <TabsList className="grid grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="all-reviews">All</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="highest">Highest</TabsTrigger>
              <TabsTrigger value="lowest">Lowest</TabsTrigger>
            </TabsList>
            <TabsContent value="all-reviews">
              <Card>
                <CardHeader>
                  <CardTitle>All Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReviewList
                    companyId={companyId}
                    currentUserId={currentUserId}
                    filter="all"
                    serviceId={
                      selectedServiceId === "all"
                        ? undefined
                        : selectedServiceId
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="recent">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReviewList
                    companyId={companyId}
                    currentUserId={currentUserId}
                    filter="recent"
                    serviceId={
                      selectedServiceId === "all"
                        ? undefined
                        : selectedServiceId
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="highest">
              <Card>
                <CardHeader>
                  <CardTitle>Highest Ratings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReviewList
                    companyId={companyId}
                    currentUserId={currentUserId}
                    filter="highest"
                    serviceId={
                      selectedServiceId === "all"
                        ? undefined
                        : selectedServiceId
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="lowest">
              <Card>
                <CardHeader>
                  <CardTitle>Lowest Ratings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReviewList
                    companyId={companyId}
                    currentUserId={currentUserId}
                    filter="lowest"
                    serviceId={
                      selectedServiceId === "all"
                        ? undefined
                        : selectedServiceId
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
