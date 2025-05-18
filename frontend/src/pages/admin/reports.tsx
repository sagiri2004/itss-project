"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestChart } from "@/components/reports/request-chart";
import { ServiceUsageChart } from "@/components/reports/service-usage-chart";
import { SatisfactionChart } from "@/components/reports/satisfaction-chart";

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Statistics and Reports</h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="satisfaction">Ratings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>
                General statistics about system activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <RequestChart timeRange="month" />
                <ServiceUsageChart timeRange="month" />
              </div>
              <SatisfactionChart timeRange="month" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rescue Request Statistics</CardTitle>
              <CardDescription>
                Details about the number and status of rescue requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RequestChart
                title="Number of requests over time"
                timeRange="month"
              />
              <RequestChart
                title="Request status distribution"
                timeRange="month"
                showStatus={true}
              />
              <ServiceUsageChart
                title="Service usage frequency"
                timeRange="month"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="satisfaction" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Satisfaction</CardTitle>
              <CardDescription>
                Statistics on ratings and customer satisfaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SatisfactionChart title="Ratings over time" timeRange="month" />
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Rating Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center items-center h-64">
                      <p className="text-muted-foreground">
                        Rating distribution chart will be displayed here
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Top Rated Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center items-center h-64">
                      <p className="text-muted-foreground">
                        Top services chart will be displayed here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
