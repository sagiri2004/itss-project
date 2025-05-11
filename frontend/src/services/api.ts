import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Auth APIs
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    axios.post(`${API_BASE_URL}/auth/login`, credentials),
  register: (userData: { username: string; password: string; email: string; name: string; roles: string[] }) => 
    axios.post(`${API_BASE_URL}/auth/register`, userData),
  logout: () => 
    axios.post(`${API_BASE_URL}/auth/logout`),
  refreshToken: () => 
    axios.post(`${API_BASE_URL}/auth/refresh-token`),
  changePassword: (passwordData: { currentPassword: string; newPassword: string }) =>
    axios.post(`${API_BASE_URL}/auth/change-password`, passwordData),
};

// User APIs
export const userApi = {
  getProfile: () => 
    axios.get(`${API_BASE_URL}/users/profile`),
  updateProfile: (userData: any) => 
    axios.put(`${API_BASE_URL}/users/profile`, userData),
  getUsers: (params?: any) => 
    axios.get(`${API_BASE_URL}/users`, { params }),
  getUserById: (id: string) => 
    axios.get(`${API_BASE_URL}/users/${id}`),
  updateUser: (id: string, userData: any) => 
    axios.put(`${API_BASE_URL}/users/${id}`, userData),
  deleteUser: (id: string) => 
    axios.delete(`${API_BASE_URL}/users/${id}`),
};

// Rescue Request APIs
export const rescueRequestApi = {
  createRequest: (requestData: any) => 
    axios.post(`${API_BASE_URL}/rescue-requests`, requestData),
  getRequests: (params?: any) => 
    axios.get(`${API_BASE_URL}/rescue-requests/user`, { params }),
  getRequestById: (id: string) => 
    axios.get(`${API_BASE_URL}/rescue-requests/${id}`),
  updateRequest: (id: string, requestData: any) => 
    axios.put(`${API_BASE_URL}/rescue-requests/${id}`, requestData),
  cancelRequest: (id: string) => 
    axios.post(`${API_BASE_URL}/rescue-requests/${id}/cancel`),
  acceptRequest: (id: string) => 
    axios.post(`${API_BASE_URL}/rescue-requests/${id}/accept`),
  rejectRequest: (id: string) => 
    axios.post(`${API_BASE_URL}/rescue-requests/${id}/reject`),
  completeRequest: (id: string) => 
    axios.post(`${API_BASE_URL}/rescue-requests/${id}/complete`),
};

// Rescue Company APIs
export const rescueCompanyApi = {
  getCompanies: (params?: any) => 
    axios.get(`${API_BASE_URL}/rescue-companies`, { params }),
  getCompanyById: (id: string) => 
    axios.get(`${API_BASE_URL}/rescue-companies/${id}`),
  createCompany: (companyData: any) => 
    axios.post(`${API_BASE_URL}/rescue-companies`, companyData),
  updateCompany: (id: string, companyData: any) => 
    axios.put(`${API_BASE_URL}/rescue-companies/${id}`, companyData),
  deleteCompany: (id: string) => 
    axios.delete(`${API_BASE_URL}/rescue-companies/${id}`),
  verifyCompany: (id: string) => 
    axios.post(`${API_BASE_URL}/rescue-companies/${id}/verify`),
};

// Rescue Vehicle APIs
export const rescueVehicleApi = {
  getVehicles: (params?: any) => 
    axios.get(`${API_BASE_URL}/rescue-vehicles`, { params }),
  getVehicleById: (id: string) => 
    axios.get(`${API_BASE_URL}/rescue-vehicles/${id}`),
  createVehicle: (vehicleData: any) => 
    axios.post(`${API_BASE_URL}/rescue-vehicles`, vehicleData),
  updateVehicle: (id: string, vehicleData: any) => 
    axios.put(`${API_BASE_URL}/rescue-vehicles/${id}`, vehicleData),
  deleteVehicle: (id: string) => 
    axios.delete(`${API_BASE_URL}/rescue-vehicles/${id}`),
  updateVehicleStatus: (id: string, status: string) => 
    axios.put(`${API_BASE_URL}/rescue-vehicles/${id}/status`, { status }),
};

// Rescue Service APIs
export const rescueServiceApi = {
  getServices: (params?: any) => 
    axios.get(`${API_BASE_URL}/rescue-services`, { params }),
  getServiceById: (id: string) => 
    axios.get(`${API_BASE_URL}/rescue-services/${id}`),
  createService: (serviceData: any) => 
    axios.post(`${API_BASE_URL}/rescue-services`, serviceData),
  updateService: (id: string, serviceData: any) => 
    axios.put(`${API_BASE_URL}/rescue-services/${id}`, serviceData),
  deleteService: (id: string) => 
    axios.delete(`${API_BASE_URL}/rescue-services/${id}`),
};

// Invoice APIs
export const invoiceApi = {
  getUserInvoices: (params?: any) => 
    axios.get(`${API_BASE_URL}/invoices/my-invoices`, { params }),
  getInvoiceById: (id: string) => 
    axios.get(`${API_BASE_URL}/invoices/${id}`),
  createInvoice: (invoiceData: any) => 
    axios.post(`${API_BASE_URL}/invoices`, invoiceData),
  updateInvoice: (id: string, invoiceData: any) => 
    axios.put(`${API_BASE_URL}/invoices/${id}`, invoiceData),
  deleteInvoice: (id: string) => 
    axios.put(`${API_BASE_URL}/invoices/${id}`),
  payInvoice: (id: string, paymentData: any) => 
    axios.post(`${API_BASE_URL}/invoices/${id}/pay`, paymentData),
  sendInvoice: (id: string) => 
    axios.post(`${API_BASE_URL}/invoices/${id}/send`),
};

// Chat APIs
export const chatApi = {
  getConversations: () =>
    axios.get(`${API_BASE_URL}/chat/conversations`),
  getConversationById: (conversationId: string) =>
    axios.get(`${API_BASE_URL}/chat/conversations/${conversationId}`),
  getMessages: (conversationId: string, params?: any) =>
    axios.get(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`, { params }),
  markAsRead: (conversationId: string) =>
    axios.put(`${API_BASE_URL}/chat/conversations/${conversationId}/read`),
};

// Configure axios defaults
axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling errors
axios.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // if (error.response?.status === 401) {
    //   // Handle unauthorized access
    //   localStorage.removeItem('token');
    //   window.location.href = '/login';
    // }
    // return Promise.reject(error);
  }
);

export default {
  auth: authApi,
  users: userApi,
  rescueRequests: rescueRequestApi,
  rescueCompanies: rescueCompanyApi,
  rescueVehicles: rescueVehicleApi,
  rescueServices: rescueServiceApi,
  invoices: invoiceApi,
  chats: chatApi,
}; 