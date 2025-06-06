import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import api from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Textarea,
  TextareaProps,
} from "@/components/ui/textarea";
import {
  Label,
} from "@/components/ui/label";

const REPORT_TYPES = [
  { value: "ALL", label: "All" },
  { value: "TOPIC", label: "Topic" },
  { value: "COMMENT", label: "Comment" },
  { value: "RESCUE_REQUEST", label: "Rescue Request" },
  { value: "INVOICE", label: "Invoice" },
  { value: "COMPANY", label: "Company" },
  { value: "SERVICE_DELETION", label: "Service Deletion" },
  // Add other types if needed
];
const REPORT_STATUS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const AdminReportManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [topReported, setTopReported] = useState<any[]>([]);
  const [topType, setTopType] = useState("TOPIC");
  const [topLoading, setTopLoading] = useState(false);
  const [serviceDeletionRequests, setServiceDeletionRequests] = useState<any[]>([]);
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (type && type !== "ALL") params.type = type;
      if (status && status !== "ALL") params.status = status;
      const res = await api.admin.getReports(params);
      setReports(res.data || []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopReported = async () => {
    setTopLoading(true);
    try {
      const res = await api.admin.getTopReported(topType, 5);
      setTopReported(res.data || []);
    } catch {
      setTopReported([]);
    } finally {
      setTopLoading(false);
    }
  };

  const fetchServiceDeletionRequests = async () => {
    setDeletionLoading(true);
    try {
      const res = await api.admin.getServiceDeletionRequests();
      setServiceDeletionRequests(res.data || []);
    } catch {
      setServiceDeletionRequests([]);
    } finally {
      setDeletionLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchServiceDeletionRequests();
  }, [type, status]);
  useEffect(() => {
    fetchTopReported();
  }, [topType]);

  const handleResolve = async (
    reportId: string,
    action: "APPROVED" | "REJECTED"
  ) => {
    try {
      await api.admin.resolveReport({ reportId, status: action });
      toast({
        title: action === "APPROVED" ? "Report resolved" : "Report rejected",
      });
      fetchReports();
    } catch {
      toast({ title: "Error processing report", variant: "destructive" });
    }
  };

  const handleDelete = async (reportId: string) => {
    try {
      await api.admin.deleteReport(reportId);
      toast({ title: "Report deleted" });
      fetchReports();
    } catch {
      toast({ title: "Error deleting report", variant: "destructive" });
    }
  };

  const handleApproveDeletion = async (requestId: string) => {
    try {
      await api.admin.approveServiceDeletion(requestId);
      toast({ title: "Service deletion approved" });
      fetchServiceDeletionRequests();
    } catch {
      toast({ title: "Error approving deletion", variant: "destructive" });
    }
  };

  const handleRejectDeletion = async () => {
    if (!selectedRequestId || !rejectReason) {
      toast({ 
        title: "Error", 
        description: "Please provide a reason for rejection",
        variant: "destructive" 
      });
      return;
    }

    try {
      await api.admin.rejectServiceDeletion(selectedRequestId, rejectReason);
      toast({ title: "Service deletion rejected" });
      setShowRejectDialog(false);
      setRejectReason("");
      setSelectedRequestId(null);
      fetchServiceDeletionRequests();
    } catch {
      toast({ title: "Error rejecting deletion", variant: "destructive" });
    }
  };

  // Badge color for each report type
  const typeBadgeVariant = (type: string) => {
    switch (type) {
      case "TOPIC":
        return "success";
      case "COMMENT":
        return "secondary";
      case "RESCUE_REQUEST":
        return "destructive";
      case "INVOICE":
        return "default";
      case "COMPANY":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">System Report Management</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Reports</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_STATUS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={fetchReports} disabled={loading}>
            Refresh
          </Button>
        </CardContent>
      </Card>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Report List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : reports.length === 0 ? (
            <p>No reports found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-700 rounded-lg">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Target</th>
                    <th className="p-2 text-left">Reporter</th>
                    <th className="p-2 text-left">Reason</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Time</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                    >
                      <td className="p-2">
                        <Badge variant={typeBadgeVariant(r.type)}>
                          {r.type}
                        </Badge>
                      </td>
                      <td className="p-2 font-mono text-xs">
                        {r.targetName || r.targetTitle || r.targetId}
                      </td>
                      <td className="p-2">{r.reporterName || r.userId}</td>
                      <td className="p-2">{r.reason}</td>
                      <td className="p-2">
                        <Badge
                          variant={
                            r.status === "PENDING"
                              ? "secondary"
                              : r.status === "APPROVED"
                              ? "success"
                              : "destructive"
                          }
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td className="p-2 text-center space-x-2">
                        {r.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleResolve(r.id, "APPROVED")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleResolve(r.id, "REJECTED")}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(r.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Most Reported Items</CardTitle>
          <div className="flex gap-2 mt-2">
            <Select value={topType} onValueChange={setTopType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Target Type" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.filter((t) => t.value).map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchTopReported} disabled={topLoading}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {topLoading ? (
            <p>Loading...</p>
          ) : topReported.length === 0 ? (
            <p>No data available.</p>
          ) : (
            <ul className="list-decimal ml-6">
              {topReported.map((item, idx) => (
                <li key={idx} className="mb-1 flex items-center gap-2">
                  <span className="font-semibold mr-2">{idx + 1}.</span>
                  <span>{item[1] || item.targetName || item.targetId}</span>
                  <Badge className="ml-2" variant="secondary">
                    {item[2] || item.count} reports
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Service Deletion Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {deletionLoading ? (
            <p>Loading...</p>
          ) : serviceDeletionRequests.length === 0 ? (
            <p>No service deletion requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-700 rounded-lg">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="p-2 text-left">Service</th>
                    <th className="p-2 text-left">Company</th>
                    <th className="p-2 text-left">Reason</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Requested At</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceDeletionRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                    >
                      <td className="p-2">{request.serviceName}</td>
                      <td className="p-2">{request.companyName}</td>
                      <td className="p-2">{request.reason}</td>
                      <td className="p-2">
                        <Badge
                          variant={
                            request.status === "PENDING"
                              ? "secondary"
                              : request.status === "APPROVED"
                              ? "success"
                              : "destructive"
                          }
                        >
                          {request.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {new Date(request.createdAt).toLocaleString()}
                      </td>
                      <td className="p-2 text-center space-x-2">
                        {request.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApproveDeletion(request.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedRequestId(request.id);
                                setShowRejectDialog(true);
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Service Deletion Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this deletion request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
                setSelectedRequestId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectDeletion}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReportManagementPage;
