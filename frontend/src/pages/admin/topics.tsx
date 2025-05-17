"use client";

import React, { useState, useEffect } from "react";
import {
  FiPlusCircle,
  FiSearch,
  FiTrash2,
  FiMessageCircle,
  FiX,
  FiFlag,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Topic, TopicComment } from "@/types/topic";
import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

const CATEGORIES = [
  { label: "Tất cả", value: "all" },
  { label: "Máy", value: "engine" },
  { label: "Điện", value: "electrical" },
  { label: "Lốp", value: "tire" },
  { label: "Khác", value: "other" },
];

type NewTopic = {
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const CommunityTopics: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<TopicComment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [newComment, setNewComment] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState<NewTopic>({
    title: "",
    content: "",
    category: "engine",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportModal, setReportModal] = useState<{
    open: boolean;
    type: 'topic' | 'comment' | null;
    topicId?: string;
    commentId?: string;
  }>({ open: false, type: null });
  const [reportReason, setReportReason] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch topics with loading state
  const fetchTopics = async () => {
    setLoading(true);
    try {
      const params: any = {
        search: debouncedSearch,
        category: category !== "all" ? category : undefined,
      };
      const res = await api.topics.getTopics(params);
      setTopics(res.data.items || res.data || []);
    } catch (e) {
      setTopics([]);
      toast({ title: "Không thể tải danh sách bài viết.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments with loading state
  const fetchComments = async (topicId: string) => {
    setCommentLoading(true);
    try {
      const res = await api.topics.getComments(topicId);
      setComments(res.data.items || res.data || []);
    } catch (e) {
      setComments([]);
      toast({ title: "Không thể tải bình luận.", variant: "destructive" });
    } finally {
      setCommentLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTopics();
  }, [debouncedSearch, category]);

  // Fetch comments when topic is selected
  useEffect(() => {
    if (selectedTopic) {
      fetchComments(selectedTopic.id);
    }
  }, [selectedTopic]);

  const handleAddComment = async (topicId: string) => {
    if (!user) {
      toast({ title: "Bạn cần đăng nhập để bình luận.", variant: "destructive" });
      return;
    }
    if (!newComment.trim()) {
      toast({ title: "Vui lòng nhập nội dung bình luận", variant: "destructive" });
      return;
    }
    setCommentLoading(true);
    let res;
    try {
      res = await api.topics.addComment(topicId, { content: newComment.trim() });
    } catch (e: any) {
      let msg = "Không thể gửi bình luận. Vui lòng thử lại.";
      if (e?.response?.data?.message) {
        msg = e.response.data.message;
      }
      toast({ title: msg, variant: "destructive" });
      setCommentLoading(false);
      return;
    }
    if (!res || !res.data) {
      toast({ title: "Không thể gửi bình luận. Vui lòng thử lại.", variant: "destructive" });
      setCommentLoading(false);
      return;
    }
    setNewComment("");
    setComments(prev => [...prev, res.data]);
    setTopics(prevTopics =>
      prevTopics.map(topic =>
        topic.id === topicId
          ? { ...topic, commentCount: topic.commentCount + 1 }
          : topic
      )
    );
    if (selectedTopic) {
      setSelectedTopic({ ...selectedTopic, commentCount: selectedTopic.commentCount + 1 });
    }
    setCommentLoading(false);
  };

  const handleDeleteComment = async (topicId: string, commentId: string) => {
    try {
      setCommentLoading(true);
      await api.topics.deleteComment(topicId, commentId);
      // Remove comment from state (avoid reload all)
      setComments(prev => prev.filter(c => c.id !== commentId));
      // Update topic comment count in the list and detail
      setTopics(prevTopics =>
        prevTopics.map(topic =>
          topic.id === topicId
            ? { ...topic, commentCount: Math.max(0, topic.commentCount - 1) }
            : topic
        )
      );
      if (selectedTopic) {
        setSelectedTopic({ ...selectedTopic, commentCount: Math.max(0, selectedTopic.commentCount - 1) });
      }
    } catch (e) {
      toast({ title: "Không thể xóa bình luận.", variant: "destructive" });
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    const topic = topics.find((t) => t.id === id);
    if (!topic) return;
    if (user?.role === "admin" || topic.userId === user?.id) {
      try {
        await api.topics.deleteTopic(id);
        setTopics(topics.filter((topic) => topic.id !== id));
        if (selectedTopic?.id === id) setSelectedTopic(null);
        toast({ title: "Đã xóa bài viết thành công." });
      } catch (e) {
        toast({ title: "Không thể xóa bài viết.", variant: "destructive" });
      }
    } else {
      toast({ title: "Bạn không có quyền xóa bài viết này", variant: "destructive" });
    }
  };

  const handleCreateTopic = async () => {
    if (!user) {
      toast({ title: "Bạn cần đăng nhập để tạo chủ đề.", variant: "destructive" });
      return;
    }
    if (!newTopic.title.trim() || !newTopic.content.trim()) {
      toast({ title: "Vui lòng điền đầy đủ thông tin.", variant: "destructive" });
      return;
    }
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("title", newTopic.title.trim());
      formData.append("content", newTopic.content.trim());
      formData.append("category", newTopic.category);
      if (newTopic.imageUrl) {
        formData.append("imageUrl", newTopic.imageUrl);
      }
      const response = await api.topics.createTopic(formData);
      setIsCreateModalOpen(false);
      setNewTopic({ title: "", content: "", category: "engine", imageUrl: "" });
      setTopics(prevTopics => [response.data, ...prevTopics]);
      toast({ title: "Đăng bài viết thành công!" });
    } catch (e: any) {
      let msg = "Không thể tạo bài viết mới.";
      if (e?.response?.data?.message) {
        msg = e.response.data.message;
      }
      toast({ title: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canDeleteTopic = (topic: Topic) => {
    return user?.role === "admin" || topic.userId === user?.id;
  };

  // Report topic (open modal)
  const handleReportTopic = (topicId: string) => {
    setReportModal({ open: true, type: 'topic', topicId });
    setReportReason("");
  };

  // Report comment (open modal)
  const handleReportComment = (topicId: string, commentId: string) => {
    setReportModal({ open: true, type: 'comment', topicId, commentId });
    setReportReason("");
  };

  // Submit report
  const handleSubmitReport = async () => {
    if (!reportReason.trim()) {
      toast({ title: "Vui lòng nhập lý do báo cáo", variant: "destructive" });
      return;
    }
    setReportLoading(true);
    try {
      if (reportModal.type === 'topic' && reportModal.topicId) {
        await api.report.createReport({ type: 'TOPIC', targetId: reportModal.topicId, reason: reportReason.trim() });
        toast({ title: "Đã gửi báo cáo chủ đề." });
      } else if (reportModal.type === 'comment' && reportModal.commentId) {
        await api.report.createReport({ type: 'COMMENT', targetId: reportModal.commentId, reason: reportReason.trim() });
        toast({ title: "Đã gửi báo cáo bình luận." });
      }
      setReportModal({ open: false, type: null });
      setReportReason("");
    } catch {
      toast({ title: "Không thể gửi báo cáo.", variant: "destructive" });
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="w-full h-full p-0 space-y-6">
      {/* Category filter with improved styling */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.value}
            variant={category === cat.value ? "default" : "outline"}
            className={`capitalize transition-all duration-200 ${
              category === cat.value ? "shadow-md" : "hover:shadow-sm"
            }`}
            onClick={() => setCategory(cat.value)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Search and Ask with improved styling */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
        <div className="relative flex-1 w-full">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            className="w-full bg-input text-foreground pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <FiPlusCircle className="text-xl" /> Đặt câu hỏi
        </Button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* List or Detail with improved styling */}
      <div className="grid gap-6">
        {selectedTopic ? (
          <Card className="bg-card rounded-lg p-6 space-y-6 shadow-lg">
            <Button
              variant="ghost"
              onClick={() => setSelectedTopic(null)}
              className="text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              ← Quay lại danh sách
            </Button>
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold">{selectedTopic.title}</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleReportTopic(selectedTopic.id)}
                  className="p-2 hover:bg-destructive/10 transition-colors"
                  title="Báo cáo bài viết"
                >
                  <FiFlag className="mr-1" /> Báo cáo
                </Button>
                {canDeleteTopic(selectedTopic) && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteTopic(selectedTopic.id)}
                    className="p-2 transition-colors"
                  >
                    <FiTrash2 />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex gap-2 items-center text-sm text-muted-foreground mb-2">
              <span className="capitalize px-2 py-1 rounded bg-muted">{selectedTopic.category || "Khác"}</span>
              <span>Đăng bởi {selectedTopic.userName}</span>
              <span>{new Date(selectedTopic.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-foreground whitespace-pre-line">{selectedTopic.content}</p>
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">
                Bình luận ({selectedTopic.commentCount})
              </h3>
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {commentLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : selectedTopic.commentCount === 0 ? (
                  <p className="text-muted-foreground italic">
                    Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-muted p-4 rounded-lg transition-all hover:bg-accent"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={
                                comment.userAvatar ||
                                `https://source.unsplash.com/random/40x40?sig=${comment.id}`
                              }
                              alt={comment.userName}
                            />
                            <AvatarFallback>
                              {getInitials(comment.userName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-2">
                            <span className="font-bold text-primary">
                              {comment.userName}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleReportComment(selectedTopic.id, comment.id)}
                            className="p-1 rounded-full hover:bg-destructive/10 transition-colors"
                            title="Báo cáo bình luận"
                          >
                            <FiFlag />
                          </Button>
                          {(user?.role === "admin" || comment.userId === user?.id) && (
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteComment(selectedTopic.id, comment.id)}
                              className="p-1 rounded-full hover:bg-destructive/10 transition-colors"
                            >
                              <FiTrash2 size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-foreground">{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Viết bình luận..."
                  className="flex-1 bg-input p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder-muted-foreground text-foreground transition-all duration-200 hover:bg-muted"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    newComment.trim() &&
                    handleAddComment(selectedTopic.id)
                  }
                />
                <Button
                  onClick={() => handleAddComment(selectedTopic.id)}
                  className="bg-primary hover:bg-primary/90 px-6 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newComment.trim() || commentLoading}
                >
                  {commentLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FiMessageCircle />
                  )}{" "}
                  Gửi
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {topics.length === 0 ? (
              <p className="text-muted-foreground italic col-span-2 text-center py-8">
                Không có bài viết nào.
              </p>
            ) : (
              topics.map((topic) => (
                <Card
                  key={topic.id}
                  className="bg-card rounded-lg p-6 hover:bg-muted transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg"
                  onClick={() => setSelectedTopic(topic)}
                >
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold truncate">{topic.title}</h2>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReportTopic(topic.id);
                        }}
                        className="p-2 hover:bg-destructive/10 transition-colors"
                        title="Báo cáo bài viết"
                      >
                        <FiFlag />
                      </Button>
                      {canDeleteTopic(topic) && (
                        <Button
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTopic(topic.id);
                          }}
                          className="text-destructive hover:text-destructive/80 p-2 transition-colors"
                        >
                          <FiTrash2 />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center text-sm text-muted-foreground mb-2 mt-2">
                    <span className="capitalize px-2 py-1 rounded bg-muted">{topic.category || "Khác"}</span>
                    <span>Đăng bởi {topic.userName}</span>
                    <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-muted-foreground mt-2 line-clamp-2">
                    {topic.content}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-4">
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
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <FiMessageCircle />
                        {topic.commentCount}
                      </span>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTopic(topic);
                      }}
                      className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors"
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create Topic Modal with improved styling */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-card rounded-lg p-6 w-full max-w-2xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Đặt câu hỏi mới</h2>
              <Button
                variant="ghost"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <FiX className="text-2xl" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Chủ đề
                </label>
                <select
                  value={newTopic.category}
                  onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
                  className="w-full bg-input p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all duration-200"
                >
                  {CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={newTopic.title}
                  onChange={(e) =>
                    setNewTopic({ ...newTopic, title: e.target.value })
                  }
                  className="w-full bg-input p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground transition-all duration-200"
                  placeholder="Nhập tiêu đề câu hỏi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nội dung
                </label>
                <textarea
                  value={newTopic.content}
                  onChange={(e) =>
                    setNewTopic({ ...newTopic, content: e.target.value })
                  }
                  className="w-full bg-input p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] text-foreground transition-all duration-200"
                  placeholder="Nhập nội dung câu hỏi"
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <Button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCreateTopic}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : null}
                  Đăng câu hỏi
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Report Modal */}
      {reportModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-card rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Báo cáo {reportModal.type === 'topic' ? 'bài viết' : 'bình luận'}</h2>
            <textarea
              className="w-full bg-input p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] text-foreground mb-4"
              placeholder="Nhập lý do báo cáo..."
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              disabled={reportLoading}
            />
            <div className="flex justify-end gap-4">
              <Button
                variant="ghost"
                onClick={() => setReportModal({ open: false, type: null })}
                className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                disabled={reportLoading}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmitReport}
                disabled={reportLoading || !reportReason.trim()}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                {reportLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : null}
                Gửi báo cáo
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CommunityTopics;

// Add custom scrollbar style directly using a React fragment
// Place this after the component export
export function TopicsCustomScrollbarStyle() {
  return (
    <style>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #444;
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #444 transparent;
      }
    `}</style>
  );
}
