import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/auth-context"
import { WebSocketProvider } from "./context/websocket-context"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { useEffect } from "react"
import { useWebSocketContext } from "@/context/websocket-context"

// Layouts
import DashboardLayout from "./layouts/dashboard-layout"

// Auth Pages
import Login from "./pages/auth/login"
import Register from "./pages/auth/register"
import CreateCompany from "./pages/auth/create-company"

// User Pages
import UserDashboard from "./pages/user/dashboard"
import UserRequests from "./pages/user/requests"
import UserRequestDetails from "./pages/user/request-details"
import UserCreateRequest from "./pages/user/create-request"
import UserRequestMap from "./pages/user/request-map"
import UserInvoices from "./pages/user/invoices"
import UserPayment from "./pages/user/payment"
import UserProfile from "./pages/user/profile"
import UserChangePassword from "./pages/user/change-password"
import UserChat from "./pages/user/chat"
import UserChats from "./pages/user/chats"
import UserReviewManager from "./pages/user/review-manager"
import UserTopics from "./pages/user/topics"
// Company Pages
import CompanyDashboard from "./pages/company/dashboard"
import CompanyServices from "./pages/company/services"
import CompanyVehicles from "./pages/company/vehicles"
import CompanyVehicleTracking from "./pages/company/vehicle-tracking"
import CompanyRequests from "./pages/company/requests"
import CompanyInvoices from "./pages/company/invoices"
import CompanyProfile from "./pages/company/profile"
import CompanyChangePassword from "./pages/company/change-password"
import CompanyChat from "./pages/company/chat"
import CompanyChats from "./pages/company/chats"
import CompanyRequestDetail from "./pages/company/request-detail"
import CompanyReviews from "./pages/company/reviews"
import CompanyDetail from "./pages/details-company" // Ensure this import is correct

// Admin Pages
import AdminDashboard from "./pages/admin/dashboard"
import AdminServices from "./pages/admin/services"
import AdminCompanies from "./pages/admin/companies"
import AdminVehicles from "./pages/admin/vehicles"
import AdminMapOverview from "./pages/admin/map-overview"
import AdminRequests from "./pages/admin/requests"
import AdminInvoices from "./pages/admin/invoices"
import AdminUsers from "./pages/admin/users"
import AdminSettings from "./pages/admin/settings"
import AdminChangePassword from "./pages/admin/change-password"
import AdminReport from "./pages/admin/reports"
import AdminReportManagement from "./pages/admin/report-management"
import AdminTopics from "./pages/admin/topics"
import AdminReviews from "./pages/admin/reviews"

function WebSocketConsoleLogger() {
  const { messages } = useWebSocketContext()
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      // console.log("[WebSocket Notification]", lastMessage)
    }
  }, [messages])
  return null
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="roadside-theme">
      <AuthProvider>
        <Router>
          <WebSocketProvider>
            <WebSocketConsoleLogger />
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/create-company" element={<CreateCompany />} />

              {/* Standalone Company Detail Page */}
              <Route path="/company/:id" element={<CompanyDetail />} />

              {/* User Routes */}
              <Route path="/user" element={<DashboardLayout role="user" />}>
                <Route index element={<UserDashboard />} />
                <Route path="requests" element={<UserRequests />} />
                <Route path="requests/:id" element={<UserRequestDetails />} />
                <Route path="requests/new" element={<UserCreateRequest />} />
                <Route path="request-map/:id" element={<UserRequestMap />} />
                <Route path="invoices" element={<UserInvoices />} />
                <Route path="payment/:id" element={<UserPayment />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="change-password" element={<UserChangePassword />} />
                <Route path="chat/:id" element={<UserChat />} />
                <Route path="chats" element={<UserChats />} />
                <Route path="reviews" element={<UserReviewManager />} />
                <Route path="topics" element={<UserTopics />} />
              </Route>

              {/* Company Routes */}
              <Route path="/company" element={<DashboardLayout role="company" />}>
                <Route index element={<CompanyDashboard />} />
                <Route path="services" element={<CompanyServices />} />
                <Route path="vehicles" element={<CompanyVehicles />} />
                <Route path="vehicle-tracking" element={<CompanyVehicleTracking />} />
                <Route path="requests" element={<CompanyRequests />} />
                <Route path="requests/:id" element={<CompanyRequestDetail />} />
                <Route path="invoices" element={<CompanyInvoices />} />
                <Route path="profile" element={<CompanyProfile />} />
                <Route path="change-password" element={<CompanyChangePassword />} />
                <Route path="chat/:id" element={<CompanyChat />} />
                <Route path="chats" element={<CompanyChats />} />
                <Route path="reviews" element={<CompanyReviews />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<DashboardLayout role="admin" />}>
                <Route index element={<AdminDashboard />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="companies" element={<AdminCompanies />} />
                <Route path="vehicles" element={<AdminVehicles />} />
                <Route path="map" element={<AdminMapOverview />} />
                <Route path="requests" element={<AdminRequests />} />
                <Route path="invoices" element={<AdminInvoices />} />
                <Route path="users" element={<AdminUsers />} />
                {/* <Route path="chats" element={<AdminChats />} /> */}
                <Route path="settings" element={<AdminSettings />} />
                <Route path="change-password" element={<AdminChangePassword />} />
                <Route path="reports" element={<AdminReport />} />
                <Route path="report-management" element={<AdminReportManagement />} />
                <Route path="topics" element={<AdminTopics />} />
                <Route path="reviews" element={<AdminReviews />} />
              </Route>

              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </WebSocketProvider>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
