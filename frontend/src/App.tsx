"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { AnimatePresence } from "framer-motion"

// Layouts
import DashboardLayout from "@/layouts/dashboard-layout"

// Auth Pages
import Login from "@/pages/auth/login"
import Register from "@/pages/auth/register"

// User Pages
import UserDashboard from "@/pages/user/dashboard"
import UserRequests from "@/pages/user/requests"
import UserInvoices from "@/pages/user/invoices"
import CreateRequest from "@/pages/user/create-request"
import RequestDetails from "@/pages/user/request-details"
import RequestMap from "@/pages/user/request-map"

// Company Pages
import CompanyDashboard from "@/pages/company/dashboard"
import CompanyServices from "@/pages/company/services"
import CompanyVehicles from "@/pages/company/vehicles"
import CompanyRequests from "@/pages/company/requests"
import CompanyInvoices from "@/pages/company/invoices"
import CompanyProfile from "@/pages/company/profile"
import VehicleTracking from "@/pages/company/vehicle-tracking"

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard"
import AdminServices from "@/pages/admin/services"
import AdminCompanies from "@/pages/admin/companies"
import AdminVehicles from "@/pages/admin/vehicles"
import AdminRequests from "@/pages/admin/requests"
import AdminInvoices from "@/pages/admin/invoices"
import AdminUsers from "@/pages/admin/users"
import AdminChats from "@/pages/admin/chats"
import MapOverview from "@/pages/admin/map-overview"

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="roadside-theme">
      <AuthProvider>
        <Router>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* User Routes */}
              <Route path="/user" element={<DashboardLayout role="user" />}>
                <Route index element={<UserDashboard />} />
                <Route path="requests" element={<UserRequests />} />
                <Route path="requests/new" element={<CreateRequest />} />
                <Route path="requests/:id" element={<RequestDetails />} />
                <Route path="requests/:id/map" element={<RequestMap />} />
                <Route path="invoices" element={<UserInvoices />} />
              </Route>

              {/* Company Routes */}
              <Route path="/company" element={<DashboardLayout role="company" />}>
                <Route index element={<CompanyDashboard />} />
                <Route path="services" element={<CompanyServices />} />
                <Route path="vehicles" element={<CompanyVehicles />} />
                <Route path="vehicle-tracking" element={<VehicleTracking />} />
                <Route path="requests" element={<CompanyRequests />} />
                <Route path="invoices" element={<CompanyInvoices />} />
                <Route path="profile" element={<CompanyProfile />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<DashboardLayout role="admin" />}>
                <Route index element={<AdminDashboard />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="companies" element={<AdminCompanies />} />
                <Route path="vehicles" element={<AdminVehicles />} />
                <Route path="requests" element={<AdminRequests />} />
                <Route path="invoices" element={<AdminInvoices />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="chats" element={<AdminChats />} />
                <Route path="map" element={<MapOverview />} />
              </Route>

              {/* Redirect to login if no route matches */}
              <Route path="*" element={<Login />} />
            </Routes>
          </AnimatePresence>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
