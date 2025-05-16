"use client";

import React, { useState, useEffect } from "react";
import {
  FiPlusCircle,
  FiSearch,
  FiTrash2,
  FiMessageCircle,
  FiX,
} from "react-icons/fi";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Topic, TopicComment } from "@/types/topic";
import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

const SORT_OPTIONS = {
  NEWEST: "newest",
  OLDEST: "oldest",
  MOST_COMMENTS: "mostCommented",
};

type NewTopic = {
  title: string;
  content: string;
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
  const [newComment, setNewComment] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState<NewTopic>({
    title: "",
    content: "",
    imageUrl: "",
  });
  const [sortBy, setSortBy] = useState<string>(SORT_OPTIONS.NEWEST);
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  // Fetch topics
  useEffect(() => {
    const fetchTopics = async () => {
      setLoading(true);
      try {
        const params: any = {
          search: searchQuery,
          sortBy,
        };
        const res = await api.topics.getTopics(params);
        setTopics(res.data.items || res.data || []);
      } catch (e) {
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [searchQuery, sortBy]);

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

  const handleAddComment = async (topicId: string) => {
    if (!user) {
      alert("Bạn cần đăng nhập để bình luận.");
      return;
    }
    if (!newComment.trim()) {
      alert("Vui lòng nhập nội dung bình luận");
      return;
    }
    try {
      setCommentLoading(true);
      await api.topics.addComment(topicId, { content: newComment.trim() });
      setNewComment("");
      // Refresh comments
      const res = await api.topics.getComments(topicId);
      setComments(res.data.items || res.data || []);
    } catch (e) {
      alert("Không thể gửi bình luận. Vui lòng thử lại.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (topicId: string, commentId: string) => {
    try {
      setCommentLoading(true);
      await api.topics.deleteComment(topicId, commentId);
      // Refresh comments
      const res = await api.topics.getComments(topicId);
      setComments(res.data.items || res.data || []);
    } catch (e) {
      alert("Không thể xóa bình luận.");
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
      } catch (e) {
        alert("Không thể xóa chủ đề.");
      }
    } else {
      alert("Bạn không có quyền xóa chủ đề này");
    }
  };

  const handleCreateTopic = async () => {
    if (!user) {
      alert("Bạn cần đăng nhập để tạo chủ đề.");
      return;
    }
    if (!newTopic.title.trim() || !newTopic.content.trim()) return;
    try {
      const formData = new FormData();
      formData.append("title", newTopic.title);
      formData.append("content", newTopic.content);
      if (newTopic.imageUrl) formData.append("imageUrl", newTopic.imageUrl);
      await api.topics.createTopic(formData);
      setIsCreateModalOpen(false);
      setNewTopic({ title: "", content: "", imageUrl: "" });
      // Refresh topics
      const res = await api.topics.getTopics({ search: searchQuery, sortBy });
      setTopics(res.data.items || res.data || []);
    } catch (e) {
      alert("Không thể tạo chủ đề mới.");
    }
  };

  const canDeleteTopic = (topic: Topic) => {
    return user?.role === "admin" || topic.userId === user?.id;
  };

  // Sort topics client-side if needed (for demo, but should be sorted by API)
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

  // Report topic
  const handleReportTopic = async (topicId: string) => {
    const reason = window.prompt("Nhập lý do báo cáo chủ đề này:");
    if (!reason || !reason.trim()) return;
    try {
      await api.topics.reportTopic(topicId, reason.trim());
      toast({ title: "Đã gửi báo cáo chủ đề." });
    } catch {
      toast({ title: "Không thể gửi báo cáo.", variant: "destructive" });
    }
  };

  // Report comment
  const handleReportComment = async (topicId: string, commentId: string) => {
    const reason = window.prompt("Nhập lý do báo cáo bình luận này:");
    if (!reason || !reason.trim()) return;
    try {
      await api.topics.reportComment(topicId, commentId, reason.trim());
      toast({ title: "Đã gửi báo cáo bình luận." });
    } catch {
      toast({ title: "Không thể gửi báo cáo.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout role="user">
      <div className="container mx-auto p-4 min-h-screen bg-[#1e1e2f] text-white">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Community Topics</h1>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <FiPlusCircle className="text-xl" /> New Topic
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search topics by title..."
              className="w-full bg-[#252543] text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#252543] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value={SORT_OPTIONS.NEWEST}>Newest First</option>
            <option value={SORT_OPTIONS.OLDEST}>Oldest First</option>
            <option value={SORT_OPTIONS.MOST_COMMENTS}>Most Comments</option>
          </select>
        </div>
        <div className="grid gap-6">
          {selectedTopic ? (
            <Card className="bg-[#252543] rounded-lg p-6 space-y-6">
              <Button
                variant="ghost"
                onClick={() => setSelectedTopic(null)}
                className="text-gray-400 hover:text-white mb-4"
              >
                ← Back to Topics
              </Button>
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold">{selectedTopic.title}</h2>
                <div className="flex gap-2">
                  {canDeleteTopic(selectedTopic) && (
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteTopic(selectedTopic.id)}
                      className="p-2"
                    >
                      <FiTrash2 />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleReportTopic(selectedTopic.id)}
                    className="p-2"
                  >
                    Báo cáo
                  </Button>
                </div>
              </div>
              <p className="text-gray-300">{selectedTopic.content}</p>
              <div className="text-sm text-gray-400">
                Posted by {selectedTopic.userName} on{" "}
                {new Date(selectedTopic.createdAt).toLocaleDateString()}
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">
                  Comments ({selectedTopic.commentCount})
                </h3>
                <div className="space-y-4 mb-6">
                  {selectedTopic.commentCount === 0 ? (
                    <p className="text-gray-400 italic">
                      No comments yet. Be the first to comment!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-[#1e1e2f] p-4 rounded-lg transition-all hover:bg-[#2a2a4a]"
                      >
                        <div className="flex justify-between items-start">
                          <div>
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
                            <span className="font-bold text-indigo-400 ml-2">
                              {comment.userName}
                            </span>
                            <span className="text-sm text-gray-400 ml-2">
                              {new Date(comment.createdAt).toLocaleDateString()}{" "}
                              at{" "}
                              {new Date(comment.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {(user?.role === "admin" ||
                              comment.userId === user?.id) && (
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() =>
                                  handleDeleteComment(
                                    selectedTopic.id,
                                    comment.id
                                  )
                                }
                                className="p-1 rounded-full hover:bg-red-500/10 transition-colors"
                              >
                                <FiTrash2 size={16} />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                handleReportComment(
                                  selectedTopic.id,
                                  comment.id
                                )
                              }
                              className="p-1 rounded-full"
                            >
                              Báo cáo
                            </Button>
                          </div>
                        </div>
                        <p className="mt-2 text-gray-300">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write your thoughts..."
                    className="flex-1 bg-[#1e1e2f] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500 text-white transition-all duration-200 hover:bg-[#252543]"
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
                    className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newComment.trim()}
                  >
                    <FiMessageCircle /> Post
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            filteredAndSortedTopics.map((topic) => (
              <Card
                key={topic.id}
                className="bg-[#252543] rounded-lg p-6 hover:bg-[#2a2a4a] transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold truncate">{topic.title}</h2>
                  {canDeleteTopic(topic) && (
                    <Button
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTopic(topic.id);
                      }}
                      className="text-red-500 hover:text-red-600 p-2"
                    >
                      <FiTrash2 />
                    </Button>
                  )}
                </div>
                <p className="text-gray-300 mt-2 line-clamp-2">
                  {topic.content}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-400">
                    Posted by {topic.userName} on{" "}
                    {new Date(topic.createdAt).toLocaleDateString()}
                  </div>
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
                    <span className="flex items-center gap-1 text-gray-400">
                      <FiMessageCircle />
                      {topic.commentCount}
                    </span>
                    <Button
                      onClick={() => setSelectedTopic(topic)}
                      className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
        {/* Create Topic Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="bg-[#252543] rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create New Topic</h2>
                <Button
                  variant="ghost"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX className="text-2xl" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newTopic.title}
                    onChange={(e) =>
                      setNewTopic({ ...newTopic, title: e.target.value })
                    }
                    className="w-full bg-[#1e1e2f] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter topic title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Content
                  </label>
                  <textarea
                    value={newTopic.content}
                    onChange={(e) =>
                      setNewTopic({ ...newTopic, content: e.target.value })
                    }
                    className="w-full bg-[#1e1e2f] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[200px]"
                    placeholder="Enter topic content"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Image URL (optional)
                  </label>
                  <input
                    type="text"
                    value={newTopic.imageUrl}
                    onChange={(e) =>
                      setNewTopic({ ...newTopic, imageUrl: e.target.value })
                    }
                    className="w-full bg-[#1e1e2f] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter image URL"
                  />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateTopic}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    Create Topic
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CommunityTopics;
