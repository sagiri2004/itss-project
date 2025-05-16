export interface Topic {
  id: string
  title: string
  content: string
  imageUrl: string | null
  userId: string
  userName: string
  userAvatar: string | null
  createdAt: string
  updatedAt: string
  commentCount: number
  viewCount: number
}

export interface TopicComment {
  id: string
  content: string
  userId: string
  userName: string
  userAvatar: string | null
  topicId: string
  createdAt: string
  updatedAt: string
}

export interface TopicSearchParams {
  search?: string
  page?: number
  limit?: number
  sortBy?: "newest" | "oldest" | "mostCommented" | "mostViewed"
}

export interface TopicReport {
  id: string;
  topicId: string;
  topicTitle: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  createdAt: string;
}

export interface CommentReport {
  id: string;
  topicId: string;
  commentId: string;
  commentContent: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  createdAt: string;
}
