import {
  Home,
  FileText,
  Car,
  Settings,
  Users,
  Building,
  MessageSquare,
  Map,
  Wrench,
  Bell,
  CreditCard,
  User,
  Lock,
  Star,
  MessageCircle,
  BarChart,
} from "lucide-react"

// User navigation
export const userNavItems = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        href: "/user",
        icon: Home,
      },
      {
        title: "My Requests",
        href: "/user/requests",
        icon: Bell,
      },
      {
        title: "Chats",
        href: "/user/chats",
        icon: MessageSquare,
      },
      {
        title: "Topics",
        href: "/user/topics",
        icon: MessageCircle,
      },
      {
        title: "Reviews",
        href: "/user/reviews",
        icon: Star,
      },
      {
        title: "Invoices",
        href: "/user/invoices",
        icon: FileText,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        href: "/user/profile",
        icon: User,
      },
      {
        title: "Change Password",
        href: "/user/change-password",
        icon: Lock,
      },
    ],
  },
]

// Company navigation
export const companyNavItems = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        href: "/company",
        icon: Home,
      },
      {
        title: "Services",
        href: "/company/services",
        icon: Wrench,
      },
      {
        title: "Vehicles",
        href: "/company/vehicles",
        icon: Car,
      },
      {
        title: "Vehicle Tracking",
        href: "/company/vehicle-tracking",
        icon: Map,
      },
      {
        title: "Requests",
        href: "/company/requests",
        icon: Bell,
      },
      {
        title: "Reviews",
        href: "/company/reviews",
        icon: Star,
      },
      {
        title: "Chats",
        href: "/company/chats",
        icon: MessageSquare,
      },
      {
        title: "Invoices",
        href: "/company/invoices",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        href: "/company/profile",
        icon: User,
      },
      {
        title: "Change Password",
        href: "/company/change-password",
        icon: Lock,
      },
    ],
  },
]

// Admin navigation
export const adminNavItems = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: Home,
      },
      {
        title: "Services",
        href: "/admin/services",
        icon: Wrench,
      },
      {
        title: "Companies",
        href: "/admin/companies",
        icon: Building,
      },
      {
        title: "Vehicles",
        href: "/admin/vehicles",
        icon: Car,
      },
      {
        title: "Map Overview",
        href: "/admin/map",
        icon: Map,
      },
      {
        title: "Requests",
        href: "/admin/requests",
        icon: Bell,
      },
      {
        title: "Topics",
        href: "/admin/topics",
        icon: MessageCircle,
      },
      {
        title: "Reviews",
        href: "/admin/reviews",
        icon: Star,
      },
      {
        title: "Reports",
        href: "/admin/reports",
        icon: BarChart,
      },
      {
        title: "Invoices",
        href: "/admin/invoices",
        icon: FileText,
      },
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "Chats",
        href: "/admin/chats",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
      {
        title: "Change Password",
        href: "/admin/change-password",
        icon: Lock,
      },
    ],
  },
]
