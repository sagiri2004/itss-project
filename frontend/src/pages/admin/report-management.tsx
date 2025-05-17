import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import api from "@/services/api";

const REPORT_TYPES = [
  { value: "ALL", label: "Tất cả" },
  { value: "TOPIC", label: "Chủ đề" },
  { value: "COMMENT", label: "Bình luận" },
  { value: "RESCUE_REQUEST", label: "Yêu cầu cứu hộ" },
  { value: "INVOICE", label: "Hóa đơn" },
  { value: "COMPANY", label: "Công ty" },
  // Thêm các loại khác nếu có
];
const REPORT_STATUS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "APPROVED", label: "Đã xử lý" },
  { value: "REJECTED", label: "Từ chối" },
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

  useEffect(() => { fetchReports(); }, [type, status]);
  useEffect(() => { fetchTopReported(); }, [topType]);

  const handleResolve = async (reportId: string, action: "APPROVED" | "REJECTED") => {
    try {
      await api.admin.resolveReport({ reportId, status: action });
      toast({ title: action === "APPROVED" ? "Đã xử lý báo cáo" : "Đã từ chối báo cáo" });
      fetchReports();
    } catch {
      toast({ title: "Lỗi xử lý báo cáo", variant: "destructive" });
    }
  };

  const handleDelete = async (reportId: string) => {
    try {
      await api.admin.deleteReport(reportId);
      toast({ title: "Đã xóa báo cáo" });
      fetchReports();
    } catch {
      toast({ title: "Lỗi xóa báo cáo", variant: "destructive" });
    }
  };

  // Badge màu cho từng loại report
  const typeBadgeVariant = (type: string) => {
    switch (type) {
      case "TOPIC": return "success";
      case "COMMENT": return "secondary";
      case "RESCUE_REQUEST": return "destructive";
      case "INVOICE": return "default";
      case "COMPANY": return "outline";
      default: return "outline";
    }
  };

  return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Quản lý báo cáo hệ thống</h1>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Lọc báo cáo</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Loại báo cáo" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_STATUS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchReports} disabled={loading}>Làm mới</Button>
          </CardContent>
        </Card>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Danh sách báo cáo</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <p>Đang tải...</p> : reports.length === 0 ? <p>Không có báo cáo nào.</p> : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-700 rounded-lg">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="p-2 text-left">Loại</th>
                      <th className="p-2 text-left">Đối tượng</th>
                      <th className="p-2 text-left">Người báo cáo</th>
                      <th className="p-2 text-left">Lý do</th>
                      <th className="p-2 text-left">Trạng thái</th>
                      <th className="p-2 text-left">Thời gian</th>
                      <th className="p-2 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id} className="border-b border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
                        <td className="p-2">
                          <Badge variant={typeBadgeVariant(r.type)}>{r.type}</Badge>
                        </td>
                        <td className="p-2 font-mono text-xs">
                          {r.targetName || r.targetTitle || r.targetId}
                        </td>
                        <td className="p-2">{r.reporterName || r.userId}</td>
                        <td className="p-2">{r.reason}</td>
                        <td className="p-2">
                          <Badge variant={r.status === "PENDING" ? "secondary" : r.status === "APPROVED" ? "success" : "destructive"}>{r.status}</Badge>
                        </td>
                        <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
                        <td className="p-2 text-center space-x-2">
                          {r.status === "PENDING" && (
                            <>
                              <Button size="sm" variant="default" onClick={() => handleResolve(r.id, "APPROVED")}>Xử lý</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleResolve(r.id, "REJECTED")}>Từ chối</Button>
                            </>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleDelete(r.id)}>Xóa</Button>
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
            <CardTitle>Top đối tượng bị báo cáo nhiều nhất</CardTitle>
            <div className="flex gap-2 mt-2">
              <Select value={topType} onValueChange={setTopType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Loại đối tượng" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.filter(t => t.value).map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={fetchTopReported} disabled={topLoading}>Làm mới</Button>
            </div>
          </CardHeader>
          <CardContent>
            {topLoading ? <p>Đang tải...</p> : topReported.length === 0 ? <p>Không có dữ liệu.</p> : (
              <ul className="list-decimal ml-6">
                {topReported.map((item, idx) => (
                  <li key={idx} className="mb-1 flex items-center gap-2">
                    <span className="font-semibold mr-2">{idx + 1}.</span>
                    <span>{item[1] || item.targetName || item.targetId}</span>
                    <Badge className="ml-2" variant="secondary">{item[2] || item.count} lượt báo cáo</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
  );
};

export default AdminReportManagementPage; 