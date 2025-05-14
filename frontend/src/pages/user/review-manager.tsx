import { useEffect, useState } from "react";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/reviews/star-rating";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserReviewManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const [userRatings, setUserRatings] = useState<any[]>([]);
  const [unreviewedRequests, setUnreviewedRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRequest, setModalRequest] = useState<any>(null);
  const [modalRating, setModalRating] = useState<any>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoadingRequests(true);
        setLoadingRatings(true);

        const [reqRes, ratingRes] = await Promise.all([
          api.rescueRequests.getRequests(),
          api.ratings.getUserRatings(user.id),
        ]);

        setUserRequests(reqRes.data);
        setUserRatings(ratingRes.data);

        // Filter paid requests and exclude those already reviewed
        const paidRequests = reqRes.data.filter((req: any) => req.status === "PAID");
        const reviewedServiceIds = new Set(userRatings.map((rating: any) => rating.serviceId));
        const unreviewed = paidRequests.filter((req: any) => !reviewedServiceIds.has(req.serviceId));
        setUnreviewedRequests(unreviewed);
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: err.response?.data?.message || "Không thể tải dữ liệu",
        });
      } finally {
        setLoadingRequests(false);
        setLoadingRatings(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const handleDelete = async (ratingId: string) => {
    try {
      await api.ratings.deleteRating(ratingId);
      setUserRatings(userRatings.filter(r => r.id !== ratingId));
      toast({ title: "Đã xóa đánh giá!" });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err.response?.data?.message || "Không thể xóa đánh giá",
      });
    }
  };

  const openReviewModal = (request: any, rating?: any) => {
    setModalRequest(request);
    setModalRating(rating || null);
    setStars(rating?.stars || 5);
    setComment(rating?.comment || "");
    setModalOpen(true);
  };

  const closeReviewModal = () => {
    setModalOpen(false);
    setModalRequest(null);
    setModalRating(null);
    setStars(5);
    setComment("");
  };

  const handleSubmitReview = async () => {
    if (!modalRequest) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tạo đánh giá. Vui lòng chọn một yêu cầu.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.ratings.createRating({
        companyId: modalRequest.companyId,
        serviceId: modalRequest.serviceId,
        stars,
        comment,
      });
      toast({ title: modalRating ? "Đã cập nhật đánh giá!" : "Đã gửi đánh giá!" });
      const [ratingRes] = await Promise.all([
        api.ratings.getUserRatings(user!.id),
      ]);
      setUserRatings(ratingRes.data);
      // Re-filter unreviewed requests
      const paidRequests = userRequests.filter((req: any) => req.status === "PAID");
      const reviewedServiceIds = new Set(ratingRes.data.map((rating: any) => rating.serviceId));
      const unreviewed = paidRequests.filter((req: any) => !reviewedServiceIds.has(req.serviceId));
      setUnreviewedRequests(unreviewed);
      closeReviewModal();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err.response?.data?.message || "Không thể gửi đánh giá",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Ngày không hợp lệ" : date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Quản lý đánh giá dịch vụ</h1>
      <Tabs defaultValue="unreviewed-services" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="unreviewed-services">Dịch vụ chưa được đánh giá</TabsTrigger>
          <TabsTrigger value="reviewed">Đã đánh giá</TabsTrigger>
        </TabsList>

        <TabsContent value="unreviewed-services">
          <Card>
            <CardHeader>
              <CardTitle>Dịch vụ chưa được đánh giá</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Đây là danh sách các yêu cầu đã thanh toán chưa được đánh giá.
              </p>
              {loadingRequests ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : unreviewedRequests.length === 0 ? (
                <div className="text-muted-foreground">Tất cả dịch vụ đã được đánh giá!</div>
              ) : (
                unreviewedRequests.map(request => (
                  <div key={request.id} className="flex justify-between items-center border-b py-3 last:border-b-0">
                    <div className="space-y-1">
                      <div><span className="font-medium">Dịch vụ:</span> {request.serviceName}</div>
                      <div><span className="font-medium">Công ty:</span> {request.companyName}</div>
                      <div><span className="font-medium">Ngày yêu cầu:</span> {formatDate(request.createdAt)}</div>
                      <div><span className="font-medium">Ghi chú:</span> {request.notes || "Không có"}</div>
                    </div>
                    <Button onClick={() => openReviewModal(request)}>Đánh giá</Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviewed">
          <Card>
            <CardHeader>
              <CardTitle>Đánh giá của bạn</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRatings ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : userRatings.length === 0 ? (
                <div className="text-muted-foreground">Chưa có đánh giá nào.</div>
              ) : (
                userRatings.map(rating => (
                  <div key={rating.id} className="flex justify-between items-center border-b py-3 last:border-b-0">
                    <div className="space-y-1">
                      <div><span className="font-medium">Dịch vụ:</span> {rating.serviceName}</div>
                      <div><span className="font-medium">Công ty:</span> {rating.companyName}</div>
                      <div><span className="font-medium">Ngày đánh giá:</span> {formatDate(rating.createdAt)}</div>
                      <div><span className="font-medium">Đánh giá:</span> {rating.stars} sao - {rating.comment}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => openReviewModal(null, rating)}>Sửa</Button>
                      <Button variant="destructive" onClick={() => handleDelete(rating.id)}>Xóa</Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalRating ? "Sửa đánh giá" : "Đánh giá dịch vụ"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <span className="font-medium">Dịch vụ:</span> {modalRequest?.serviceName || modalRating?.serviceName}
            </div>
            <div>
              <span className="font-medium">Công ty:</span> {modalRequest?.companyName || modalRating?.companyName}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Số sao:</span>
              <StarRating rating={stars} onChange={setStars} size="lg" />
            </div>
            <div>
              <Textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Nhập nhận xét của bạn..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeReviewModal} disabled={submitting}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={submitting || !comment.trim() || (!modalRequest && !modalRating)}
            >
              {submitting ? "Đang gửi..." : modalRating ? "Cập nhật" : "Gửi đánh giá"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}