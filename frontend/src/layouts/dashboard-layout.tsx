"use client"

import { useState, useEffect } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
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
import { Loader2, LogOut } from "lucide-react"

// Import role-specific navigation items
import { userNavItems, companyNavItems, adminNavItems } from "@/config/navigation"

type DashboardLayoutProps = {
  role: "user" | "company" | "admin"
}

export default function DashboardLayout({ role }: DashboardLayoutProps) {
  const { user, logout, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMounted, setIsMounted] = useState(false)

  // Get navigation items based on role
  const navItems = role === "admin" ? adminNavItems : role === "company" ? companyNavItems : userNavItems

  useEffect(() => {
    setIsMounted(true)

    // Redirect if not authenticated or wrong role
    if (!loading && (!isAuthenticated)) {
      // console.log("Not authenticated or wrong role")
      // console.log("Loading:", loading)
      // console.log("Is authenticated:", isAuthenticated)
      // console.log("User:", user)
      // console.log("Role:", role)
      // navigate("/login")
    }
  }, [loading, isAuthenticated, user, role, navigate])

  if (loading || !isMounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-muted/30">
        <Sidebar variant="floating" className="border-none">
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
                          <motion.a
                            href={item.href}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-2"
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </motion.a>
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

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-4">
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
            className={cn("flex-1 p-6")}
          >
            <Outlet />
          </motion.main>
        </div>
      </div>
    </SidebarProvider>
  )
}
