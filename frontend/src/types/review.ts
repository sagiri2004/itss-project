export interface Review {
  id: string
  userId: string
  userName: string
  userAvatar: string | null
  rating: number
  comment: string
  createdAt: string
  requestId: string
  companyId: string
  content?: string 
  serviceName?: string
  companyName : string;
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingCounts: number[]
}

export interface ReviewSearchParams {
  companyId?: string
  userId?: string
  rating?: number
  page?: number
  limit?: number
  sortBy?: "newest" | "oldest" | "highestRating" | "lowestRating"
}
