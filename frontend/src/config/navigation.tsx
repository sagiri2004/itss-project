import { Home, FileText, Car, Settings, Users, Building, MessageSquare, Map, Wrench, Bell, CreditCard, User } from 'lucide-react'

// User navigation
export const userNavItems = [
  {
    title: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/user",
        icon: Home,
      },
      {
        label: "My Requests",
        href: "/user/requests",
        icon: Bell,
      },
      {
        label: "Invoices",
        href: "/user/invoices",
        icon: FileText,
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
        label: "Dashboard",
        href: "/company",
        icon: Home,
      },
      {
        label: "Services",
        href: "/company/services",
        icon: Wrench,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Vehicles",
        href: "/company/vehicles",
        icon: Car,
      },
      {
        label: "Vehicle Tracking",
        href: "/company/vehicle-tracking",
        icon: Map,
      },
      {
        label: "Requests",
        href: "/company/requests",
        icon: Bell,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        label: "Invoices",
        href: "/company/invoices",
        icon: CreditCard,
      },
      {
        label: "Profile",
        href: "/company/profile",
        icon: User,
      },
    ],
  },
]

// Admin navigation items
export const adminNavItems = [
  {
    title: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: Home,
      },
      {
        label: "Services",
        href: "/admin/services",
        icon: Wrench,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Companies",
        href: "/admin/companies",
        icon: Building,
      },
      {
        label: "Vehicles",
        href: "/admin/vehicles",
        icon: Car,
      },
      {
        label: "Map Overview",
        href: "/admin/map",
        icon: Map,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Requests",
        href: "/admin/requests",
        icon: Bell,
      },
      {
        label: "Invoices",
        href: "/admin/invoices",
        icon: FileText,
      },
      {
        label: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        label: "Chats",
        href: "/admin/chats",
        icon: MessageSquare,
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
]