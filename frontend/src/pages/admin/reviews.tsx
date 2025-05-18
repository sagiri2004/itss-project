"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/layouts/dashboard-layout";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { ReviewChart } from "@/components/reviews/review-chart";
import { SatisfactionChart } from "@/components/reports/satisfaction-chart";
import { Button } from "@/components/ui/button";

function AdminReviewList() {
  const { toast } = useToast();
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getRatings();
      setRatings(res.data);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Could not load reviews",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.admin.deleteRating(id);
      setRatings(ratings.filter((r) => r.id !== id));
      toast({ title: "Review deleted!" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message || "Could not delete review",
      });
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div>Loading...</div>
      ) : ratings.length === 0 ? (
        <div>No reviews yet.</div>
      ) : (
        ratings.map((rating) => (
          <Card key={rating.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{rating.userName}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </div>
                  <div className="mt-2">{rating.stars} stars</div>
                  <div className="mt-2">{rating.comment}</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Service: {rating.serviceName}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Company: {rating.companyName}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(rating.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function CompanyRatingStats() {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [companyStats, setCompanyStats] = useState<any>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const res = await api.admin.getCompanies();
        setCompanies(res.data);
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            err.response?.data?.message || "Could not load company list",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [toast]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedCompany) return;
      setLoading(true);
      try {
        const res = await api.ratings.getCompanyRatingSummary(selectedCompany);
        setCompanyStats(res.data);
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description:
            err.response?.data?.message || "Could not load rating statistics",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedCompany, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rating statistics by company</CardTitle>
        <select
          className="mt-2 border rounded px-3 py-2"
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
        >
          <option value="">Select company</option>
          {companies.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : companyStats ? (
          <ReviewChart data={companyStats} />
        ) : (
          <div>Select a company to view statistics</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminReviewsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Review Management</h1>
      <Tabs defaultValue="all-reviews" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-reviews">All Reviews</TabsTrigger>
          <TabsTrigger value="company-stats">Company Statistics</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction Chart</TabsTrigger>
        </TabsList>
        <TabsContent value="all-reviews">
          <Card>
            <CardHeader>
              <CardTitle>All Reviews</CardTitle>
              <CardDescription>
                Manage all reviews in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminReviewList />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="company-stats">
          <CompanyRatingStats />
        </TabsContent>
        <TabsContent value="satisfaction">
          <SatisfactionChart
            title="Customer Satisfaction Chart"
            timeRange="month"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
