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
  acceptRequest: (id: string) => axios.post(`${API_BASE_URL}/rescue-requests/${id}/accept`),
  rejectRequest: (id: string) => axios.post(`${API_BASE_URL}/rescue-requests/${id}/reject`),
  completeRequest: (id: string) => axios.post(`${API_BASE_URL}/rescue-requests/${id}/complete`),
  getCompanyRequests: (params?: any) => axios.get(`${API_BASE_URL}/rescue-requests/company`, { params }),
  dispatchVehicle: (id: string, vehicleId: string) =>
    axios.put(`${API_BASE_URL}/rescue-requests/${id}/dispatch-vehicle`, null, { params: { vehicleId } }),
  startRepair: (id: string) => axios.put(`${API_BASE_URL}/rescue-requests/${id}/start-repair`),
  completeRepair: (id: string) => axios.put(`${API_BASE_URL}/rescue-requests/${id}/complete-repair`),
  cancelByCompany: (id: string) => axios.put(`${API_BASE_URL}/rescue-requests/${id}/cancel-by-company`),
}

// Rescue Company APIs
export const rescueCompanyApi = {
  getCompanies: (params?: any) => axios.get(`${API_BASE_URL}/rescue-companies`, { params }),
  getCompanyById: (id: string) => axios.get(`${API_BASE_URL}/rescue-companies/${id}`),
  createCompany: (companyData: any) => axios.post(`${API_BASE_URL}/rescue-companies`, companyData),
  updateCompany: (id: string, companyData: any) => axios.put(`${API_BASE_URL}/rescue-companies/${id}`, companyData),
  deleteCompany: (id: string) => axios.delete(`${API_BASE_URL}/rescue-companies/${id}`),
  verifyCompany: (id: string) => axios.post(`${API_BASE_URL}/rescue-companies/${id}/verify`),
}

// Rescue Vehicle APIs
export const rescueVehicleApi = {
  getVehicles: (params?: any) => axios.get(`${API_BASE_URL}/rescue-vehicles`, { params }),
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

// Reports APIs
export const reportApi = {
  getRequestStats: (params?: any) => axios.get(`${API_BASE_URL}/reports/requests`, { params }),
  getServiceUsageStats: (params?: any) => axios.get(`${API_BASE_URL}/reports/services/usage`, { params }),
  getSatisfactionStats: (params?: any) => axios.get(`${API_BASE_URL}/reports/satisfaction`, { params }),
  getOverallStats: () => axios.get(`${API_BASE_URL}/reports/overall`),
}

// Configure axios defaults
axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token")
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

// Add response interceptor for handling errors
axios.interceptors.response.use(
  (response: AxiosResponse) => response,
  () => {
    // if (error.response?.status === 401) {
    //   // Handle unauthorized access
    //   localStorage.removeItem('token');
    //   window.location.href = '/login';
    // }
    // return Promise.reject(error);
  },
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
  reports: reportApi,
}
