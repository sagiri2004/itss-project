import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Auth APIs
export const authApi = {
  login: (credentials: { username: string; password: string }) => axios.post(`${API_BASE_URL}/auth/login`, credentials),
  register: (userData: { username: string; password: string; email: string; name: string; roles: string[] }) =>
    axios.post(`${API_BASE_URL}/auth/register`, userData),
  logout: () => axios.post(`${API_BASE_URL}/auth/logout`),
  refreshToken: () => axios.post(`${API_BASE_URL}/auth/refresh-token`),
  changePassword: (passwordData: { currentPassword: string; newPassword: string }) =>
    axios.post(`${API_BASE_URL}/auth/change-password`, passwordData),
}

// User APIs
export const userApi = {
  getProfile: () => axios.get(`${API_BASE_URL}/users/profile`),
  updateProfile: (userData: any) => axios.put(`${API_BASE_URL}/users/profile`, userData),
  getUsers: (params?: any) => axios.get(`${API_BASE_URL}/users`, { params }),
  getUserById: (id: string) => axios.get(`${API_BASE_URL}/users/${id}`),
  updateUser: (id: string, userData: any) => axios.put(`${API_BASE_URL}/users/${id}`, userData),
  deleteUser: (id: string) => axios.delete(`${API_BASE_URL}/users/${id}`),
}

// Rescue Request APIs
export const rescueRequestApi = {
  createRequest: (requestData: any) => axios.post(`${API_BASE_URL}/rescue-requests`, requestData),
  getRequests: (params?: any) => axios.get(`${API_BASE_URL}/rescue-requests/user`, { params }),
  getRequestById: (id: string) => axios.get(`${API_BASE_URL}/rescue-requests/${id}`),
  updateRequest: (id: string, requestData: any) => axios.put(`${API_BASE_URL}/rescue-requests/${id}`, requestData),
  cancelRequest: (id: string) => axios.post(`${API_BASE_URL}/rescue-requests/${id}/cancel`),
  acceptRequest: (id: string) => axios.put(`${API_BASE_URL}/rescue-requests/${id}/accept`),
  rejectRequest: (id: string) => axios.put(`${API_BASE_URL}/rescue-requests/${id}/reject`),
  completeRequest: (id: string) => axios.put(`${API_BASE_URL}/rescue-requests/${id}/complete`),
  getCompanyRequests: (params?: any) => axios.get(`${API_BASE_URL}/rescue-requests/company`, { params }),
  dispatchVehicle: (id: string, vehicleId: string) => axios.put(`${API_BASE_URL}/rescue-requests/${id}/dispatch-vehicle`, null, { params: { vehicleId } }),
  markVehicleArrived: (id: string) => axios.put(`${API_BASE_URL}/rescue-requests/${id}/vehicle-arrived`),
  markInspectionDone: (id: string) => axios.put(`${API_BASE_URL}/rescue-requests/${id}/inspection-done`),
  updatePrice: (id: string, newPrice: number, notes?: string) => axios.put(`${API_BASE_URL}/rescue-requests/${id}/update-price`, null, { params: { newPrice, notes } }),
  confirmPrice: (id: string) => axios.put(`${API_BASE_URL}/rescue-requests/${id}/confirm-price`),
  cancelByCompany: (id: string) => axios.put(`${API_BASE_URL}/rescue-requests/${id}/cancel-by-company`),
  startRepair: (id: string) => axios.put(`${API_BASE_URL}/rescue-requests/${id}/start-repair`),
  completeRepair: (id: string) => axios.put(`${API_BASE_URL}/rescue-requests/${id}/complete-repair`),
}

// Rescue Company APIs
export const rescueCompanyApi = {
  getCompanies: (params?: any) => axios.get(`${API_BASE_URL}/rescue-companies`, { params }),
  getCompanyById: (id: string) => axios.get(`${API_BASE_URL}/rescue-companies/${id}`),
  getCompanyBasic: (id: string) => axios.get(`${API_BASE_URL}/rescue-companies/basic/${id}`),
  createCompany: (companyData: any) => axios.post(`${API_BASE_URL}/rescue-companies`, companyData),
  updateCompany: (id: string, companyData: any) => axios.put(`${API_BASE_URL}/rescue-companies/${id}`, companyData),
  deleteCompany: (id: string) => axios.delete(`${API_BASE_URL}/rescue-companies/${id}`),
  verifyCompany: (id: string) => axios.post(`${API_BASE_URL}/rescue-companies/${id}/verify`),
}

// Rescue Vehicle APIs
export const rescueVehicleApi = {
  getCompanyVehicles: (companyId: string) => axios.get(`${API_BASE_URL}/rescue-vehicles/company/${companyId}`),
  getVehicleById: (id: string) => axios.get(`${API_BASE_URL}/rescue-vehicles/${id}`),
  createVehicle: (vehicleData: any) => axios.post(`${API_BASE_URL}/rescue-vehicles`, vehicleData),
  updateVehicle: (id: string, vehicleData: any) => axios.put(`${API_BASE_URL}/rescue-vehicles/${id}`, vehicleData),
  deleteVehicle: (id: string) => axios.delete(`${API_BASE_URL}/rescue-vehicles/${id}`),
  updateVehicleStatus: (id: string, status: string) =>
    axios.put(`${API_BASE_URL}/rescue-vehicles/${id}/status`, { status }),
}

// Rescue Service APIs
export const rescueServiceApi = {
  getServices: (params?: any) => axios.get(`${API_BASE_URL}/rescue-services`, { params }),
  getCompanyServices: (companyId: string) => axios.get(`${API_BASE_URL}/rescue-services/company/${companyId}`),
  getServiceById: (id: string) => axios.get(`${API_BASE_URL}/rescue-services/${id}`),
  createService: (serviceData: any) => axios.post(`${API_BASE_URL}/rescue-services`, serviceData),
  updateService: (id: string, serviceData: any) => axios.put(`${API_BASE_URL}/rescue-services/${id}`, serviceData),
  deleteService: (id: string) => axios.delete(`${API_BASE_URL}/rescue-services/${id}`),
}

// Invoice APIs
export const invoiceApi = {
  getUserInvoices: (params?: any) => axios.get(`${API_BASE_URL}/invoices/my-invoices`, { params }),
  getInvoiceById: (id: string) => axios.get(`${API_BASE_URL}/invoices/${id}`),
  createInvoice: (invoiceData: any) => axios.post(`${API_BASE_URL}/invoices`, invoiceData),
  updateInvoice: (id: string, invoiceData: any) => axios.put(`${API_BASE_URL}/invoices/${id}`, invoiceData),
  deleteInvoice: (id: string) => axios.put(`${API_BASE_URL}/invoices/${id}`),
  payInvoice: (id: string, paymentData: any) => axios.post(`${API_BASE_URL}/invoices/${id}/pay`, paymentData),
  sendInvoice: (id: string) => axios.post(`${API_BASE_URL}/invoices/${id}/send`),
  getCompanyInvoices: (params?: any) => axios.get(`${API_BASE_URL}/invoices/my-company-invoices`, { params }),
}

// Chat APIs
export const chatApi = {
  getConversations: () => axios.get(`${API_BASE_URL}/chat/conversations`),
  getConversationById: (conversationId: string) => axios.get(`${API_BASE_URL}/chat/conversations/${conversationId}`),
  getMessages: (conversationId: string, params?: any) =>
    axios.get(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, { params }),
  markAsRead: (conversationId: string) => axios.put(`${API_BASE_URL}/chat/conversations/${conversationId}/read`),
  getMessagesByAdmin: (conversationId: string, params?: any) => axios.get(`${API_BASE_URL}/admin/chats/${conversationId}/messages`, { params }),
}

// Keyword Filtering APIs
export const keywordApi = {
  getKeywords: (params?: any) => axios.get(`${API_BASE_URL}/keywords`, { params }),
  addKeyword: (keywordData: { word: string; severity: string }) => axios.post(`${API_BASE_URL}/keywords`, keywordData),
  deleteKeyword: (id: string) => axios.delete(`${API_BASE_URL}/keywords/${id}`),
  checkContent: (content: string) => axios.post(`${API_BASE_URL}/keywords/check`, { content }),
}

// Topic APIs
export const topicApi = {
  getTopics: (params?: any) => axios.get(`${API_BASE_URL}/topics`, { params }),
  getTopicById: (id: string) => axios.get(`${API_BASE_URL}/topics/${id}`),
  createTopic: (topicData: FormData) =>
    axios.post(`${API_BASE_URL}/topics`, topicData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  updateTopic: (id: string, topicData: FormData) =>
    axios.put(`${API_BASE_URL}/topics/${id}`, topicData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  deleteTopic: (id: string) => axios.delete(`${API_BASE_URL}/topics/${id}`),
  getComments: (topicId: string, params?: any) => axios.get(`${API_BASE_URL}/topics/${topicId}/comments`, { params }),
  addComment: (topicId: string, commentData: { content: string }) =>
    axios.post(`${API_BASE_URL}/topics/${topicId}/comments`, commentData),
  deleteComment: (topicId: string, commentId: string) =>
    axios.delete(`${API_BASE_URL}/topics/${topicId}/comments/${commentId}`),
  reportTopic: (topicId: string, reason: string) => axios.post(`${API_BASE_URL}/topics/${topicId}/report`, { reason }),
  reportComment: (topicId: string, commentId: string, reason: string) =>
    axios.post(`${API_BASE_URL}/topics/${topicId}/comments/${commentId}/report`, { reason }),
  getTopicReports: (params?: any) => axios.get(`${API_BASE_URL}/admin/topic-reports`, { params }),
  getCommentReports: (params?: any) => axios.get(`${API_BASE_URL}/admin/comment-reports`, { params }),
  deleteTopicReport: (reportId: string) => axios.delete(`${API_BASE_URL}/admin/topic-reports/${reportId}`),
  deleteCommentReport: (reportId: string) => axios.delete(`${API_BASE_URL}/admin/comment-reports/${reportId}`),
}

// Review APIs
export const reviewApi = {
  getReviews: (params?: any) => axios.get(`${API_BASE_URL}/reviews`, { params }),
  getReviewById: (id: string) => axios.get(`${API_BASE_URL}/reviews/${id}`),
  createReview: (reviewData: any) => axios.post(`${API_BASE_URL}/reviews`, reviewData),
  updateReview: (id: string, reviewData: any) => axios.put(`${API_BASE_URL}/reviews/${id}`, reviewData),
  deleteReview: (id: string) => axios.delete(`${API_BASE_URL}/reviews/${id}`),
  getUserReviews: () => axios.get(`${API_BASE_URL}/reviews/user`),
  getCompanyReviews: (companyId: string) => axios.get(`${API_BASE_URL}/reviews/company/${companyId}`),
  getCompanyStats: (companyId: string) => axios.get(`${API_BASE_URL}/reviews/stats/company/${companyId}`),
}

// Report APIs (generic)
export const reportApi = {
  createReport: (data: { type: string; targetId: string; reason: string }) =>
    axios.post(`${API_BASE_URL}/reports`, data),
  getReports: (params?: { type?: string; status?: string }) =>
    axios.get(`${API_BASE_URL}/reports`, { params }),
  resolveReport: (data: { reportId: string; status: string; resolutionNote?: string }) =>
    axios.post(`${API_BASE_URL}/reports/resolve`, data),
  getTopReported: (type: string, limit = 5) =>
    axios.get(`${API_BASE_URL}/reports/top`, { params: { type, limit } }),
}

// Ratings APIs
export const ratingsApi = {
  createRating: (data: {
    companyId: string;
    serviceId?: string;
    stars: number;
    comment: string;
  }) => axios.post(`${API_BASE_URL}/ratings`, data),
  getCompanyRatings: (companyId: string) =>
    axios.get(`${API_BASE_URL}/ratings/company/${companyId}`),
  getCompanyRatingSummary: (companyId: string) =>
    axios.get(`${API_BASE_URL}/ratings/summary/company/${companyId}`),
  deleteRating: (ratingId: string) => axios.delete(`${API_BASE_URL}/ratings/${ratingId}`),
  getUserRatings: (userId: string) => axios.get(`${API_BASE_URL}/ratings/user/${userId}`),
  getServiceRatings: (serviceId: string) => axios.get(`${API_BASE_URL}/ratings/service/${serviceId}`),
  searchRatings: (params: { userId?: string; companyId?: string; serviceId?: string }) =>
    axios.get(`${API_BASE_URL}/ratings/search`, { params }),
  getReviewedServices: () => axios.get(`${API_BASE_URL}/ratings/reviewed-services`),
  getUnreviewedServices: () => axios.get(`${API_BASE_URL}/ratings/unreviewed-services`),
  getReviewedServicesByCompany: (companyId: string) =>
    axios.get(`${API_BASE_URL}/ratings/reviewed-services/company/${companyId}`),
  getUnreviewedServicesByCompany: (companyId: string) =>
    axios.get(`${API_BASE_URL}/ratings/unreviewed-services/company/${companyId}`),
}

// Admin APIs
export const adminApi = {
  // Topic management
  getTopics: (params?: any) => axios.get(`${API_BASE_URL}/admin/topics`, { params }),
  getComments: (topicId: string) => axios.get(`${API_BASE_URL}/admin/topics/${topicId}/comments`),
  deleteTopic: (id: string) => axios.delete(`${API_BASE_URL}/admin/topics/${id}`),
  // Topic reports
  getTopicReports: (params?: any) => axios.get(`${API_BASE_URL}/admin/topic-reports`, { params }),
  deleteTopicReport: (reportId: string) => axios.delete(`${API_BASE_URL}/admin/topic-reports/${reportId}`),
  // Comment reports
  getCommentReports: (params?: any) => axios.get(`${API_BASE_URL}/admin/comment-reports`, { params }),
  deleteCommentReport: (reportId: string) => axios.delete(`${API_BASE_URL}/admin/comment-reports/${reportId}`),
  // User management
  getUsers: (params?: any) => axios.get(`${API_BASE_URL}/admin/users`, { params }),
  getUserById: (id: string) => axios.get(`${API_BASE_URL}/admin/users/${id}`),
  updateUser: (id: string, data: any) => axios.put(`${API_BASE_URL}/admin/users/${id}`, data),
  deleteUser: (id: string) => axios.delete(`${API_BASE_URL}/admin/users/${id}`),
  // Company management
  getCompanies: (params?: any) => axios.get(`${API_BASE_URL}/admin/companies`, { params }),
  getCompanyById: (id: string) => axios.get(`${API_BASE_URL}/admin/companies/${id}`),
  updateCompany: (id: string, data: any) => axios.put(`${API_BASE_URL}/admin/companies/${id}`, data),
  deleteCompany: (id: string) => axios.delete(`${API_BASE_URL}/admin/companies/${id}`),
  // Vehicle management
  getVehicles: (params?: any) => axios.get(`${API_BASE_URL}/admin/vehicles`, { params }),
  getVehicleById: (id: string) => axios.get(`${API_BASE_URL}/admin/vehicles/${id}`),
  updateVehicle: (id: string, data: any) => axios.put(`${API_BASE_URL}/admin/vehicles/${id}`, data),
  deleteVehicle: (id: string) => axios.delete(`${API_BASE_URL}/admin/vehicles/${id}`),
  // Invoice management
  getInvoices: (params?: any) => axios.get(`${API_BASE_URL}/admin/invoices`, { params }),
  getInvoiceById: (id: string) => axios.get(`${API_BASE_URL}/admin/invoices/${id}`),
  updateInvoice: (id: string, data: any) => axios.put(`${API_BASE_URL}/admin/invoices/${id}`, data),
  deleteInvoice: (id: string) => axios.delete(`${API_BASE_URL}/admin/invoices/${id}`),
  // Request management
  getRequests: (params?: any) => axios.get(`${API_BASE_URL}/admin/requests`, { params }),
  getRequestById: (id: string) => axios.get(`${API_BASE_URL}/admin/requests/${id}`),
  updateRequest: (id: string, data: any) => axios.put(`${API_BASE_URL}/admin/requests/${id}`, data),
  deleteRequest: (id: string) => axios.delete(`${API_BASE_URL}/admin/requests/${id}`),
  // Rating management (thay cho review)
  getRatings: (params?: any) => axios.get(`${API_BASE_URL}/admin/ratings`, { params }),
  deleteRating: (id: string) => axios.delete(`${API_BASE_URL}/admin/ratings/${id}`),
  // Keyword management
  getKeywords: (params?: any) => axios.get(`${API_BASE_URL}/admin/keywords`, { params }),
  addKeyword: (data: { word: string; severity: string }) => axios.post(`${API_BASE_URL}/admin/keywords`, data),
  deleteKeyword: (id: string) => axios.delete(`${API_BASE_URL}/admin/keywords/${id}`),
  // Dashboard stats
  getDashboardStats: () => axios.get(`${API_BASE_URL}/admin/dashboard-stats`),
  // Generic admin reports (for new generic report system)
  getReports: (params?: any) => axios.get(`${API_BASE_URL}/admin/reports`, { params }),
  resolveReport: (data: { reportId: string; status: string; resolutionNote?: string }) => axios.post(`${API_BASE_URL}/admin/reports/resolve`, data),
  getTopReported: (type: string, limit = 5) => axios.get(`${API_BASE_URL}/admin/reports/top`, { params: { type, limit } }),
  deleteReport: (id: string) => axios.delete(`${API_BASE_URL}/admin/reports/${id}`),
  // Filter by keyword
  filterTopicsByKeyword: (keyword: string) => axios.get(`${API_BASE_URL}/admin/filter/topics`, { params: { keyword } }),
  filterCommentsByKeyword: (keyword: string) => axios.get(`${API_BASE_URL}/admin/filter/comments`, { params: { keyword } }),
  filterRatingsByKeyword: (keyword: string) => axios.get(`${API_BASE_URL}/admin/filter/ratings`, { params: { keyword } }),
  resetPassword: (id: string) => axios.post(`${API_BASE_URL}/admin/users/${id}/reset-password`),
  // Reports/statistics
  getRequestStats: (params?: any) => axios.get(`${API_BASE_URL}/admin/report/request-stats`, { params }),
  getServiceUsageStats: (params?: any) => axios.get(`${API_BASE_URL}/admin/report/service-usage-stats`, { params }),
  getTopRatedServices: (params?: any) => axios.get(`${API_BASE_URL}/admin/report/top-rated-services`, { params }),
}

// Configure axios defaults
axios.interceptors.request.use(
  (config) => {
    const url = config.url || "";
    if (url.includes('api.cloudinary.com')) {
      if (config.headers && config.headers.Authorization) {
        delete config.headers.Authorization;
      }
    } else {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for handling errors
axios.interceptors.response.use(
  (response: AxiosResponse) => response,
  () => {
    // Handle errors as needed
  }
)

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