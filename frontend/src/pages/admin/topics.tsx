"use client";

import React, { useState, useEffect } from "react";
import { FiSearch, FiTrash2 } from "react-icons/fi";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Topic, TopicComment } from "@/types/topic";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

const SORT_OPTIONS = {
  NEWEST: "newest",
  OLDEST: "oldest",
  MOST_COMMENTS: "mostCommented",
};

const AdminTopicsPage: React.FC = () => {
  const { toast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<TopicComment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>(SORT_OPTIONS.NEWEST);
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showReports, setShowReports] = useState(false);
  const [topicReports, setTopicReports] = useState<any[]>([]);
  const [commentReports, setCommentReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Fetch topics
  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      try {
        const params: any = {
          search: searchQuery,
          sortBy,
          page,
          limit,
        };
        const res = await api.topics.getTopics(params);
        setTopics(res.data.items || res.data || []);
        setTotalPages(Math.ceil((res.data.total || 0) / limit));
      } catch (e) {
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [searchQuery, sortBy, page]);

  // Fetch comments for selected topic
  useEffect(() => {
    if (!selectedTopic) return;
    const fetchComments = async () => {
      setCommentLoading(true);
      try {
        const res = await api.topics.getComments(selectedTopic.id);
        setComments(res.data.items || res.data || []);
      } catch (e) {
        setComments([]);
      } finally {
        setCommentLoading(false);
      }
    };
    fetchComments();
  }, [selectedTopic]);

  const handleDeleteTopic = async (id: string) => {
    try {
      setDeletingTopicId(id);
      await api.topics.deleteTopic(id);
      toast({
        title: "Thành công",
        description: "Chủ đề đã được xóa.",
      });
      setTopics(topics.filter((topic) => topic.id !== id));
      if (selectedTopic?.id === id) setSelectedTopic(null);
    } catch (e) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa chủ đề.",
        variant: "destructive",
      });
    } finally {
      setDeletingTopicId(null);
    }
  };

  // Sort topics client-side nếu cần (API đã sort)
  const getSortedTopics = (topicsToSort: Topic[]): Topic[] => {
    if (sortBy === SORT_OPTIONS.MOST_COMMENTS) {
      return [...topicsToSort].sort((a, b) => b.commentCount - a.commentCount);
    }
    return topicsToSort;
  };

  const filteredAndSortedTopics = getSortedTopics(
    topics.filter((topic) =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const [topicRes, commentRes] = await Promise.all([
        api.topics.getTopicReports(),
        api.topics.getCommentReports(),
      ]);
      setTopicReports(topicRes.data.items || topicRes.data || []);
      setCommentReports(commentRes.data.items || commentRes.data || []);
    } catch {
      setTopicReports([]);
      setCommentReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý chủ đề</h1>
          <Button
            variant="outline"
            onClick={() => {
              setShowReports(!showReports);
              if (!showReports) fetchReports();
            }}
          >
            {showReports ? "Ẩn báo cáo" : "Quản lý báo cáo"}
          </Button>
        </div>
        {showReports && (
          <div className="mb-8 p-4 border rounded bg-gray-50">
            <h2 className="text-xl font-bold mb-2">Báo cáo chủ đề</h2>
            {loadingReports ? (
              <p>Đang tải...</p>
            ) : topicReports.length === 0 ? (
              <p>Không có báo cáo chủ đề.</p>
            ) : (
              <div className="space-y-2">
                {topicReports.map((report: any) => (
                  <div
                    key={report.id}
                    className="border p-2 rounded flex justify-between items-center"
                  >
                    <div>
                      <div>
                        <b>Chủ đề:</b> {report.topicTitle || report.topicId}
                      </div>
                      <div>
                        <b>Người báo cáo:</b>{" "}
                        {report.reporterName || report.userId}
                      </div>
                      <div>
                        <b>Lý do:</b> {report.reason}
                      </div>
                      <div>
                        <b>Thời gian:</b> {report.createdAt}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        await api.topics.deleteTopicReport(report.id);
                        fetchReports();
                        toast({ title: "Đã xóa báo cáo" });
                      }}
                    >
                      Xóa báo cáo
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <h2 className="text-xl font-bold mt-6 mb-2">Báo cáo bình luận</h2>
            {loadingReports ? (
              <p>Đang tải...</p>
            ) : commentReports.length === 0 ? (
              <p>Không có báo cáo bình luận.</p>
            ) : (
              <div className="space-y-2">
                {commentReports.map((report: any) => (
                  <div
                    key={report.id}
                    className="border p-2 rounded flex justify-between items-center"
                  >
                    <div>
                      <div>
                        <b>Bình luận:</b>{" "}
                        {report.commentContent || report.commentId}
                      </div>
                      <div>
                        <b>Người báo cáo:</b>{" "}
                        {report.reporterName || report.userId}
                      </div>
                      <div>
                        <b>Lý do:</b> {report.reason}
                      </div>
                      <div>
                        <b>Thời gian:</b> {report.createdAt}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        await api.topics.deleteCommentReport(report.id);
                        fetchReports();
                        toast({ title: "Đã xóa báo cáo" });
                      }}
                    >
                      Xóa báo cáo
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm chủ đề..."
              className="w-full bg-white pl-10 pr-4 py-3 rounded-lg border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border rounded px-4 py-3"
          >
            <option value={SORT_OPTIONS.NEWEST}>Mới nhất</option>
            <option value={SORT_OPTIONS.OLDEST}>Cũ nhất</option>
            <option value={SORT_OPTIONS.MOST_COMMENTS}>
              Nhiều bình luận nhất
            </option>
          </select>
        </div>
        {selectedTopic ? (
          <Card className="bg-white rounded-lg p-6 space-y-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedTopic(null)}
              className="text-gray-400 hover:text-black mb-4"
            >
              ← Quay lại danh sách
            </Button>
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold">{selectedTopic.title}</h2>
              <Button
                variant="destructive"
                onClick={() => handleDeleteTopic(selectedTopic.id)}
                disabled={deletingTopicId === selectedTopic.id}
                className="p-2"
              >
                <FiTrash2 />
                {deletingTopicId === selectedTopic.id ? "Đang xóa..." : "Xóa"}
              </Button>
            </div>
            <p className="text-gray-700">{selectedTopic.content}</p>
            <div className="text-sm text-gray-500">
              Đăng bởi {selectedTopic.userName} lúc{" "}
              {formatDate(selectedTopic.createdAt)}
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">
                Bình luận ({selectedTopic.commentCount})
              </h3>
              <div className="space-y-4 mb-6">
                {commentLoading ? (
                  <p>Đang tải bình luận...</p>
                ) : comments.length === 0 ? (
                  <p className="text-gray-400 italic">Chưa có bình luận nào.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-indigo-600">
                            {comment.userName}
                          </span>
                          <span className="text-sm text-gray-400 ml-2">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            try {
                              await api.topics.deleteComment(
                                selectedTopic.id,
                                comment.id
                              );
                              const res = await api.topics.getComments(
                                selectedTopic.id
                              );
                              setComments(res.data.items || res.data || []);
                              toast({ title: "Đã xóa bình luận" });
                            } catch {
                              toast({
                                title: "Không thể xóa bình luận",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <FiTrash2 />
                        </Button>
                      </div>
                      <p className="mt-2 text-gray-700">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        ) : loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 w-full bg-gray-200 rounded animate-pulse" />
                </CardContent>
                <CardFooter>
                  <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Không tìm thấy chủ đề nào.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedTopics.map((topic) => (
              <Card
                key={topic.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedTopic(topic)}
              >
                <CardHeader className="flex flex-row items-start justify-between">
                  <CardTitle className="text-xl">{topic.title}</CardTitle>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTopic(topic.id);
                    }}
                    disabled={deletingTopicId === topic.id}
                  >
                    <FiTrash2 className="h-4 w-4" />
                    {deletingTopicId === topic.id ? "Đang xóa..." : "Xóa"}
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-gray-600">{topic.content}</p>
                  {topic.imageUrl && (
                    <div className="mt-2">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <span className="text-xs">Có hình ảnh đính kèm</span>
                      </Badge>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          topic.userAvatar ||
                          `https://source.unsplash.com/random/40x40?sig=${topic.id}`
                        }
                        alt={topic.userName}
                      />
                      <AvatarFallback>
                        {getInitials(topic.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{topic.userName}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(topic.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <span>{topic.commentCount}</span>
                      <span className="text-xs">bình luận</span>
                    </Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <span>{topic.viewCount}</span>
                      <span className="text-xs">lượt xem</span>
                    </Badge>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Trước
              </Button>
              {[...Array(totalPages)].map((_, index) => (
                <Button
                  key={index}
                  variant={page === index + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(index + 1)}
                >
                  {index + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminTopicsPage;
