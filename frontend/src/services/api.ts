import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false // Disable credentials mode
})

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error
      localStorage.removeItem('token')
      localStorage.removeItem('roadside-user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authApi = {
  login: (credentials: { username: string; password: string }) => 
    axiosInstance.post(`/auth/login`, credentials),
  register: (userData: { username: string; password: string; email: string; name: string; roles: string[] }) =>
    axiosInstance.post(`/auth/register`, userData),
  logout: () => axiosInstance.post(`/auth/logout`),
  refreshToken: () => axiosInstance.post(`/auth/refresh-token`),
  changePassword: (passwordData: { currentPassword: string; newPassword: string }) =>
    axiosInstance.post(`/auth/change-password`, passwordData),
}

// User APIs
export const userApi = {
  getProfile: () => axiosInstance.get(`/users/profile`),
  updateProfile: (userData: any) => axiosInstance.put(`/users/profile`, userData),
  getUsers: (params?: any) => axiosInstance.get(`/users`, { params }),
  getUserById: (id: string) => axiosInstance.get(`/users/${id}`),
  updateUser: (id: string, userData: any) => axiosInstance.put(`/users/${id}`, userData),
  deleteUser: (id: string) => axiosInstance.delete(`/users/${id}`),
}

// Rescue Request APIs
export const rescueRequestApi = {
  createRequest: (requestData: any) => axiosInstance.post(`/rescue-requests`, requestData),
  getRequests: (params?: any) => axiosInstance.get(`/rescue-requests/user`, { params }),
  getRequestById: (id: string) => axiosInstance.get(`/rescue-requests/${id}`),
  updateRequest: (id: string, requestData: any) => axiosInstance.put(`/rescue-requests/${id}`, requestData),
  cancelRequest: (id: string) => axiosInstance.post(`/rescue-requests/${id}/cancel`),
  acceptRequest: (id: string) => axiosInstance.put(`/rescue-requests/${id}/accept`),
  rejectRequest: (id: string) => axiosInstance.put(`/rescue-requests/${id}/reject`),
  completeRequest: (id: string) => axiosInstance.put(`/rescue-requests/${id}/complete`),
  getCompanyRequests: (params?: any) => axiosInstance.get(`/rescue-requests/company`, { params }),
  dispatchVehicle: (id: string, vehicleId: string) => axiosInstance.put(`/rescue-requests/${id}/dispatch-vehicle`, null, { params: { vehicleId } }),
  markVehicleArrived: (id: string) => axiosInstance.put(`/rescue-requests/${id}/vehicle-arrived`),
  markInspectionDone: (id: string) => axiosInstance.put(`/rescue-requests/${id}/inspection-done`),
  updatePrice: (id: string, newPrice: number, notes?: string) => axiosInstance.put(`/rescue-requests/${id}/update-price`, null, { params: { newPrice, notes } }),
  confirmPrice: (id: string) => axiosInstance.put(`/rescue-requests/${id}/confirm-price`),
  cancelByCompany: (id: string) => axiosInstance.put(`/rescue-requests/${id}/cancel-by-company`),
  startRepair: (id: string) => axiosInstance.put(`/rescue-requests/${id}/start-repair`),
  completeRepair: (id: string) => axiosInstance.put(`/rescue-requests/${id}/complete-repair`),
}

// Rescue Company APIs
export const rescueCompanyApi = {
  getCompanies: (params?: any) => axiosInstance.get(`/rescue-companies`, { params }),
  getCompanyById: (id: string) => axiosInstance.get(`/company/${id}`),
  getCompanyBasic: (id: string) => axiosInstance.get(`/rescue-companies/basic/${id}`),
  createCompany: (companyData: any) => axiosInstance.post(`/rescue-companies`, companyData),
  updateCompany: (id: string, companyData: any) => axiosInstance.put(`/rescue-companies/${id}`, companyData),
  deleteCompany: (id: string) => axiosInstance.delete(`/rescue-companies/${id}`),
  verifyCompany: (id: string) => axiosInstance.post(`/rescue-companies/${id}/verify`),
}

// Rescue Vehicle APIs
export const rescueVehicleApi = {
  getCompanyVehicles: (companyId: string) => axiosInstance.get(`/rescue-vehicles/company/${companyId}`),
  getVehicleById: (id: string) => axiosInstance.get(`/rescue-vehicles/${id}`),
  createVehicle: (vehicleData: any) => axiosInstance.post(`/rescue-vehicles`, vehicleData),
  updateVehicle: (id: string, vehicleData: any) => axiosInstance.put(`/rescue-vehicles/${id}`, vehicleData),
  deleteVehicle: (id: string) => axiosInstance.delete(`/rescue-vehicles/${id}`),
  updateVehicleStatus: (id: string, status: string) =>
    axiosInstance.put(`/rescue-vehicles/${id}/status`, { status }),
}

// Rescue Service APIs
export const rescueServiceApi = {
  getServices: (params?: any) => axiosInstance.get(`/rescue-services`, { params }),
  getCompanyServices: (companyId: string) => axiosInstance.get(`/rescue-services/company/${companyId}`),
  getServiceById: (id: string) => axiosInstance.get(`/rescue-services/${id}`),
  createService: (serviceData: any) => axiosInstance.post(`/rescue-services`, serviceData),
  updateService: (id: string, serviceData: any) => axiosInstance.put(`/rescue-services/${id}`, serviceData),
  deleteService: (id: string) => axiosInstance.delete(`/rescue-services/${id}`),
}

// Invoice APIs
export const invoiceApi = {
  getUserInvoices: (params?: any) => axiosInstance.get(`/invoices/my-invoices`, { params }),
  getInvoiceById: (id: string) => axiosInstance.get(`/invoices/${id}`),
  createInvoice: (invoiceData: any) => axiosInstance.post(`/invoices`, invoiceData),
  updateInvoice: (id: string, invoiceData: any) => axiosInstance.put(`/invoices/${id}`, invoiceData),
  deleteInvoice: (id: string) => axiosInstance.put(`/invoices/${id}`),
  payInvoice: (id: string, paymentData: any) => axiosInstance.post(`/invoices/${id}/pay`, paymentData),
  sendInvoice: (id: string) => axiosInstance.post(`/invoices/${id}/send`),
  getCompanyInvoices: (params?: any) => axiosInstance.get(`/invoices/my-company-invoices`, { params }),
}

// Chat APIs
export const chatApi = {
  getConversations: () => axiosInstance.get(`/chat/conversations`),
  getConversationById: (conversationId: string) => axiosInstance.get(`/chat/conversations/${conversationId}`),
  getMessages: (conversationId: string, params?: any) =>
    axiosInstance.get(`/chat/conversations/${conversationId}/messages`, { params }),
  markAsRead: (conversationId: string) => axiosInstance.put(`/chat/conversations/${conversationId}/read`),
  getMessagesByAdmin: (conversationId: string, params?: any) => axiosInstance.get(`/admin/chats/${conversationId}/messages`, { params }),
}

// Keyword Filtering APIs
export const keywordApi = {
  getKeywords: (params?: any) => axiosInstance.get(`/keywords`, { params }),
  addKeyword: (keywordData: { word: string; severity: string }) => axiosInstance.post(`/keywords`, keywordData),
  deleteKeyword: (id: string) => axiosInstance.delete(`/keywords/${id}`),
  checkContent: (content: string) => axiosInstance.post(`/keywords/check`, { content }),
}

// Topic APIs
export const topicApi = {
  getTopics: (params?: any) => axiosInstance.get(`/topics`, { params }),
  getTopicById: (id: string) => axiosInstance.get(`/topics/${id}`),
  createTopic: (topicData: FormData) =>
    axiosInstance.post(`/topics`, topicData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  updateTopic: (id: string, topicData: FormData) =>
    axiosInstance.put(`/topics/${id}`, topicData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  deleteTopic: (id: string) => axiosInstance.delete(`/topics/${id}`),
  getComments: (topicId: string, params?: any) => axiosInstance.get(`/topics/${topicId}/comments`, { params }),
  addComment: (topicId: string, commentData: { content: string }) =>
    axiosInstance.post(`/topics/${topicId}/comments`, commentData),
  deleteComment: (topicId: string, commentId: string) =>
    axiosInstance.delete(`/topics/${topicId}/comments/${commentId}`),
  reportTopic: (topicId: string, reason: string) => axiosInstance.post(`/topics/${topicId}/report`, { reason }),
  reportComment: (topicId: string, commentId: string, reason: string) =>
    axiosInstance.post(`/topics/${topicId}/comments/${commentId}/report`, { reason }),
  getTopicReports: (params?: any) => axiosInstance.get(`/admin/topic-reports`, { params }),
  getCommentReports: (params?: any) => axiosInstance.get(`/admin/comment-reports`, { params }),
  deleteTopicReport: (reportId: string) => axiosInstance.delete(`/admin/topic-reports/${reportId}`),
  deleteCommentReport: (reportId: string) => axiosInstance.delete(`/admin/comment-reports/${reportId}`),
}

// Review APIs
export const reviewApi = {
  getReviews: (params?: any) => axiosInstance.get(`/reviews`, { params }),
  getReviewById: (id: string) => axiosInstance.get(`/reviews/${id}`),
  createReview: (reviewData: any) => axiosInstance.post(`/reviews`, reviewData),
  updateReview: (id: string, reviewData: any) => axiosInstance.put(`/reviews/${id}`, reviewData),
  deleteReview: (id: string) => axiosInstance.delete(`/reviews/${id}`),
  getUserReviews: () => axiosInstance.get(`/reviews/user`),
  getCompanyReviews: (companyId: string) => axiosInstance.get(`/reviews/company/${companyId}`),
  getCompanyStats: (companyId: string) => axiosInstance.get(`/reviews/stats/company/${companyId}`),
}

// Report APIs (generic)
export const reportApi = {
  createReport: (data: { type: string; targetId: string; reason: string }) =>
    axiosInstance.post(`/reports`, data),
  getReports: (params?: { type?: string; status?: string }) =>
    axiosInstance.get(`/reports`, { params }),
  resolveReport: (data: { reportId: string; status: string; resolutionNote?: string }) =>
    axiosInstance.post(`/reports/resolve`, data),
  getTopReported: (type: string, limit = 5) =>
    axiosInstance.get(`/reports/top`, { params: { type, limit } }),
}

// Ratings APIs
export const ratingsApi = {
  createRating: (data: {
    companyId: string;
    serviceId?: string;
    stars: number;
    comment: string;
  }) => axiosInstance.post(`/ratings`, data),
  getCompanyRatings: (companyId: string) =>
    axiosInstance.get(`/ratings/company/${companyId}`),
  getCompanyRatingSummary: (companyId: string) =>
    axiosInstance.get(`/ratings/summary/company/${companyId}`),
  deleteRating: (ratingId: string) => axiosInstance.delete(`/ratings/${ratingId}`),
  getUserRatings: (userId: string) => axiosInstance.get(`/ratings/user/${userId}`),
  getServiceRatings: (serviceId: string) => axiosInstance.get(`/ratings/service/${serviceId}`),
  searchRatings: (params: { userId?: string; companyId?: string; serviceId?: string }) =>
    axiosInstance.get(`/ratings/search`, { params }),
  getReviewedServices: () => axiosInstance.get(`/ratings/reviewed-services`),
  getUnreviewedServices: () => axiosInstance.get(`/ratings/unreviewed-services`),
  getReviewedServicesByCompany: (companyId: string) =>
    axiosInstance.get(`/ratings/reviewed-services/company/${companyId}`),
  getUnreviewedServicesByCompany: (companyId: string) =>
    axiosInstance.get(`/ratings/unreviewed-services/company/${companyId}`),
}

// Admin APIs
export const adminApi = {
  // Topic management
  getTopics: (params?: any) => axiosInstance.get(`/admin/topics`, { params }),
  getComments: (topicId: string) => axiosInstance.get(`/admin/topics/${topicId}/comments`),
  deleteTopic: (id: string) => axiosInstance.delete(`/admin/topics/${id}`),
  // Topic reports
  getTopicReports: (params?: any) => axiosInstance.get(`/admin/topic-reports`, { params }),
  deleteTopicReport: (reportId: string) => axiosInstance.delete(`/admin/topic-reports/${reportId}`),
  // Comment reports
  getCommentReports: (params?: any) => axiosInstance.get(`/admin/comment-reports`, { params }),
  deleteCommentReport: (reportId: string) => axiosInstance.delete(`/admin/comment-reports/${reportId}`),
  // User management
  getUsers: (params?: any) => axiosInstance.get(`/admin/users`, { params }),
  getUserById: (id: string) => axiosInstance.get(`/admin/users/${id}`),
  updateUser: (id: string, data: any) => axiosInstance.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => axiosInstance.delete(`/admin/users/${id}`),
  // Company management
  getCompanies: (params?: any) => axiosInstance.get(`/admin/companies`, { params }),
  getCompanyById: (id: string) => axiosInstance.get(`/admin/companies/${id}`),
  updateCompany: (id: string, data: any) => axiosInstance.put(`/admin/companies/${id}`, data),
  deleteCompany: (id: string) => axiosInstance.delete(`/admin/companies/${id}`),
  // Vehicle management
  getVehicles: (params?: any) => axiosInstance.get(`/admin/vehicles`, { params }),
  getVehicleById: (id: string) => axiosInstance.get(`/admin/vehicles/${id}`),
  updateVehicle: (id: string, data: any) => axiosInstance.put(`/admin/vehicles/${id}`, data),
  deleteVehicle: (id: string) => axiosInstance.delete(`/admin/vehicles/${id}`),
  // Invoice management
  getInvoices: (params?: any) => axiosInstance.get(`/admin/invoices`, { params }),
  getInvoiceById: (id: string) => axiosInstance.get(`/admin/invoices/${id}`),
  updateInvoice: (id: string, data: any) => axiosInstance.put(`/admin/invoices/${id}`, data),
  deleteInvoice: (id: string) => axiosInstance.delete(`/admin/invoices/${id}`),
  // Request management
  getRequests: (params?: any) => axiosInstance.get(`/admin/requests`, { params }),
  getRequestById: (id: string) => axiosInstance.get(`/admin/requests/${id}`),
  updateRequest: (id: string, data: any) => axiosInstance.put(`/admin/requests/${id}`, data),
  deleteRequest: (id: string) => axiosInstance.delete(`/admin/requests/${id}`),
  // Rating management (thay cho review)
  getRatings: (params?: any) => axiosInstance.get(`/admin/ratings`, { params }),
  deleteRating: (id: string) => axiosInstance.delete(`/admin/ratings/${id}`),
  // Keyword management
  getKeywords: (params?: any) => axiosInstance.get(`/admin/keywords`, { params }),
  addKeyword: (data: { word: string; severity: string }) => axiosInstance.post(`/admin/keywords`, data),
  deleteKeyword: (id: string) => axiosInstance.delete(`/admin/keywords/${id}`),
  // Dashboard stats
  getDashboardStats: () => axiosInstance.get(`/admin/dashboard-stats`),
  // Generic admin reports (for new generic report system)
  getReports: (params?: any) => axiosInstance.get(`/admin/reports`, { params }),
  resolveReport: (data: { reportId: string; status: string; resolutionNote?: string }) => axiosInstance.post(`/admin/reports/resolve`, data),
  getTopReported: (type: string, limit = 5) => axiosInstance.get(`/admin/reports/top`, { params: { type, limit } }),
  deleteReport: (id: string) => axiosInstance.delete(`/admin/reports/${id}`),
  // Filter by keyword
  filterTopicsByKeyword: (keyword: string) => axiosInstance.get(`/admin/filter/topics`, { params: { keyword } }),
  filterCommentsByKeyword: (keyword: string) => axiosInstance.get(`/admin/filter/comments`, { params: { keyword } }),
  filterRatingsByKeyword: (keyword: string) => axiosInstance.get(`/admin/filter/ratings`, { params: { keyword } }),
  resetPassword: (id: string) => axiosInstance.post(`/admin/users/${id}/reset-password`),
  // Reports/statistics
  getRequestStats: (params?: any) => axiosInstance.get(`/admin/report/request-stats`, { params }),
  getServiceUsageStats: (params?: any) => axiosInstance.get(`/admin/report/service-usage-stats`, { params }),
  getTopRatedServices: (params?: any) => axiosInstance.get(`/admin/report/top-rated-services`, { params }),
}

export default {
  auth: authApi,
  users: userApi,
  rescueRequests: rescueRequestApi,
  rescueCompanies: rescueCompanyApi,
  rescueVehicles: rescueVehicleApi,
  rescueServices: rescueServiceApi,
  invoices: invoiceApi,
  chats: chatApi,
  keywords: keywordApi,
  topics: topicApi,
  reviews: reviewApi,
  report: reportApi,
  ratings: ratingsApi,
  admin: adminApi,
}