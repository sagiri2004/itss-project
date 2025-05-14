"use client"

import { useState, useEffect, useRef } from "react"
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { Loader2, LogOut, Bell } from "lucide-react"
import { useWebSocketContext } from "@/context/websocket-context"

// Import role-specific navigation items
import { userNavItems, companyNavItems, adminNavItems } from "@/config/navigation"

type DashboardLayoutProps = {
  role?: "user" | "company" | "admin"
  children?: React.ReactNode // Add this line
}

export default function DashboardLayout({ role = "user" }: DashboardLayoutProps) {
  const { user, logout, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMounted, setIsMounted] = useState(false)
  const { notifications, unreadCount, markAllAsRead } = useWebSocketContext()
  const [showDropdown, setShowDropdown] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  // Get navigation items based on role
  const navItems = role === "admin" ? adminNavItems : role === "company" ? companyNavItems : userNavItems

  useEffect(() => {
    setIsMounted(true)

    // Redirect if not authenticated or wrong role
    if (!loading && !isAuthenticated) {
      // console.log("Not authenticated or wrong role")
      // console.log("Loading:", loading)
      // console.log("Is authenticated:", isAuthenticated)
      // console.log("User:", user)
      // console.log("Role:", role)
      // navigate("/login")
    }
  }, [loading, isAuthenticated, user, role, navigate])

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showDropdown])

  if (loading || !isMounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full h-full bg-muted/30">
        <Sidebar className="border-none">
          <SidebarHeader className="flex items-center justify-between p-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <div className="rounded-md bg-primary p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary-foreground"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <span className="text-xl font-bold">Roadside</span>
            </motion.div>
          </SidebarHeader>

          <SidebarContent>
            {navItems.map((group, index) => (
              <SidebarGroup key={index}>
                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={location.pathname === item.href} tooltip={item.title}>
                          <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-2"
                          >
                            <Link to={item.href} className="flex items-center gap-2 w-full h-full">
                              <item.icon className="h-5 w-5" />
                              <span>{item.title}</span>
                            </Link>
                          </motion.div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={`https://avatar.vercel.sh/${user?.name}`} />
                  <AvatarFallback>{user?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">{user?.role}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ModeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    logout()
                    navigate("/login")
                  }}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col w-full h-full">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-4">
              <div ref={bellRef} className="relative ml-4">
                <button
                  className="relative focus:outline-none"
                  onClick={() => {
                    setShowDropdown((v) => !v)
                    markAllAsRead()
                  }}
                  aria-label="Notifications"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-2 font-semibold border-b border-gray-200 dark:border-gray-700">Notifications</div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">No notifications</div>
                    ) : (
                      notifications.slice(0, 10).map((noti, idx) => (
                        <div key={idx} className="p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-muted/50">
                          <div className="font-medium">{noti.title}</div>
                          <div className="text-xs text-muted-foreground">{noti.content}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(noti.sentAt).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium">
                {user?.name} ({user?.role})
              </span>
            </div>
          </header>

          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className={cn("flex-1 w-full h-full p-0 px-10 mt-6")}
          >
            <Outlet />
          </motion.main>
        </div>
      </div>
    </SidebarProvider>
  )
}
