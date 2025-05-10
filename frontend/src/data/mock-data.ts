import type { Chat, Message, RequestDetails } from "@/types/chat"

// Users
export const mockUsers = [
  {
    id: "user-001",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    role: "user",
    status: "ACTIVE",
    joinDate: "2023-01-10",
    lastLogin: "2023-05-07T08:30:00",
    requestsCount: 5,
    isVerified: true,
  },
  {
    id: "user-002",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 (555) 987-6543",
    role: "user",
    status: "ACTIVE",
    joinDate: "2023-02-15",
    lastLogin: "2023-05-06T14:20:00",
    requestsCount: 3,
    isVerified: true,
  },
  {
    id: "user-003",
    name: "Bob Johnson",
    email: "bob@example.com",
    phone: "+1 (555) 456-7890",
    role: "user",
    status: "SUSPENDED",
    joinDate: "2023-03-05",
    lastLogin: "2023-04-20T09:15:00",
    requestsCount: 2,
    isVerified: true,
  },
  {
    id: "user-004",
    name: "Alice Brown",
    email: "alice@example.com",
    phone: "+1 (555) 234-5678",
    role: "user",
    status: "ACTIVE",
    joinDate: "2023-03-20",
    lastLogin: "2023-05-07T11:45:00",
    requestsCount: 4,
    isVerified: true,
  },
  {
    id: "user-005",
    name: "Charlie Wilson",
    email: "charlie@example.com",
    phone: "+1 (555) 345-6789",
    role: "user",
    status: "PENDING_VERIFICATION",
    joinDate: "2023-05-01",
    lastLogin: "2023-05-01T16:30:00",
    requestsCount: 1,
    isVerified: false,
  },
  {
    id: "user-006",
    name: "David Miller",
    email: "david@example.com",
    phone: "+1 (555) 567-8901",
    role: "user",
    status: "ACTIVE",
    joinDate: "2023-04-12",
    lastLogin: "2023-05-05T13:10:00",
    requestsCount: 2,
    isVerified: true,
  },
  {
    id: "user-007",
    name: "Emily Davis",
    email: "emily@example.com",
    phone: "+1 (555) 678-9012",
    role: "admin",
    status: "ACTIVE",
    joinDate: "2023-01-05",
    lastLogin: "2023-05-07T09:30:00",
    requestsCount: 0,
    isVerified: true,
  },
]

// User profile details
export const mockUserDetails = {
  id: "user-123",
  name: "John Doe",
  email: "john@example.com",
  phone: "+1 (555) 123-4567",
  address: "123 Main St, Anytown, USA",
  joinDate: "2023-01-15",
  vehicles: [
    {
      id: "veh-001",
      make: "Toyota",
      model: "Camry",
      year: 2020,
      licensePlate: "ABC-1234",
    },
    {
      id: "veh-002",
      make: "Honda",
      model: "Civic",
      year: 2018,
      licensePlate: "XYZ-5678",
    },
  ],
}

// Companies
export const mockCompanies = [
  {
    id: "comp-001",
    name: "FastFix Roadside",
    logo: "",
    address: "123 Service Rd, Mechanics Town, MT 12345",
    phone: "+1 (555) 123-4567",
    email: "contact@fastfixroadside.com",
    foundedYear: "2012",
    isVerified: true,
    status: "ACTIVE",
    vehicles: 5,
    completedRequests: 245,
    rating: 4.8,
    joinDate: "2023-01-15",
  },
  {
    id: "comp-002",
    name: "QuickHelp Auto",
    logo: "",
    address: "456 Rescue Blvd, Helpville, HV 23456",
    phone: "+1 (555) 987-6543",
    email: "info@quickhelpauto.com",
    foundedYear: "2015",
    isVerified: true,
    status: "ACTIVE",
    vehicles: 3,
    completedRequests: 178,
    rating: 4.6,
    joinDate: "2023-02-21",
  },
  {
    id: "comp-003",
    name: "RoadHeroes Assistance",
    logo: "",
    address: "789 Service Ave, Fixburg, FB 34567",
    phone: "+1 (555) 456-7890",
    email: "hello@roadheroes.com",
    foundedYear: "2018",
    isVerified: false,
    status: "PENDING_VERIFICATION",
    vehicles: 2,
    completedRequests: 56,
    rating: 4.5,
    joinDate: "2023-04-03",
  },
  {
    id: "comp-004",
    name: "TowPro Services",
    logo: "",
    address: "321 Towing Lane, Pulltown, PT 45678",
    phone: "+1 (555) 234-5678",
    email: "service@towpro.com",
    foundedYear: "2010",
    isVerified: true,
    status: "SUSPENDED",
    vehicles: 8,
    completedRequests: 412,
    rating: 3.9,
    joinDate: "2023-02-10",
  },
  {
    id: "comp-005",
    name: "BestRescue Team",
    logo: "",
    address: "555 Emergency Rd, Saveville, SV 56789",
    phone: "+1 (555) 345-6789",
    email: "team@bestrescue.com",
    foundedYear: "2016",
    isVerified: true,
    status: "ACTIVE",
    vehicles: 4,
    completedRequests: 195,
    rating: 4.7,
    joinDate: "2023-03-05",
  },
]

// Company profile data
export const mockCompanyData = {
  id: "comp-001",
  name: "FastFix Roadside",
  logo: "",
  description:
    "24/7 roadside assistance for all your vehicle needs. From flat tires to towing, we've got you covered with fast and reliable service.",
  address: "123 Service Rd, Mechanics Town, MT 12345",
  phone: "+1 (555) 123-4567",
  email: "contact@fastfixroadside.com",
  website: "https://fastfixroadside.com",
  operatingHours: "24/7",
  serviceArea: "50 mile radius from Mechanics Town",
  serviceTypes: ["Towing", "Flat Tire", "Battery Jump", "Fuel Delivery", "Lockout"],
  isVerified: true,
  foundedYear: "2012",
  employees: "15",
  insuranceInfo: {
    provider: "SafeGuard Insurance",
    policyNumber: "SG123456789",
    expiryDate: "2024-05-15",
  },
}

// Vehicles
export const mockVehicles = [
  {
    id: "veh-001",
    name: "Tow Truck #1",
    type: "Tow Truck",
    licensePlate: "ABC-1234",
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
    },
    status: "AVAILABLE",
    lastMaintenance: "2023-04-15",
    assignedDriver: "John Smith",
    capacity: "Small to medium vehicles",
    nextMaintenanceDate: "2023-07-15",
  },
  {
    id: "veh-002",
    name: "Service Van #1",
    type: "Service Van",
    licensePlate: "DEF-5678",
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
    },
    status: "IN_USE",
    lastMaintenance: "2023-04-20",
    assignedDriver: "Emily Johnson",
    capacity: "Carries equipment for on-site repairs",
    nextMaintenanceDate: "2023-07-20",
  },
  {
    id: "veh-003",
    name: "Tow Truck #2",
    type: "Tow Truck",
    licensePlate: "GHI-9012",
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
    },
    status: "MAINTENANCE",
    lastMaintenance: "2023-05-05",
    assignedDriver: "Michael Brown",
    capacity: "Large vehicles, trucks and SUVs",
    nextMaintenanceDate: "2023-08-05",
  },
  {
    id: "veh-004",
    name: "Flatbed Truck #1",
    type: "Flatbed Truck",
    licensePlate: "JKL-3456",
    company: {
      id: "comp-002",
      name: "QuickHelp Auto",
    },
    status: "AVAILABLE",
    lastMaintenance: "2023-05-01",
    assignedDriver: "Sarah Davis",
    capacity: "All vehicle types, complete transportation",
    nextMaintenanceDate: "2023-08-01",
  },
  {
    id: "veh-005",
    name: "Service Van #2",
    type: "Service Van",
    licensePlate: "MNO-7890",
    company: {
      id: "comp-002",
      name: "QuickHelp Auto",
    },
    status: "OUT_OF_SERVICE",
    lastMaintenance: "2023-03-10",
    assignedDriver: "Robert Wilson",
    capacity: "Carries equipment for on-site repairs",
    nextMaintenanceDate: "2023-06-10",
  },
  {
    id: "veh-006",
    name: "Wheel Lift Truck #1",
    type: "Wheel Lift Truck",
    licensePlate: "PQR-1234",
    company: {
      id: "comp-003",
      name: "RoadHeroes Assistance",
    },
    status: "AVAILABLE",
    lastMaintenance: "2023-05-03",
    assignedDriver: "David Jones",
    capacity: "Small to medium vehicles",
    nextMaintenanceDate: "2023-08-03",
  },
]

// Company Vehicles (for company dashboard)
export const mockCompanyVehicles = [
  {
    id: "veh-001",
    name: "Tow Truck #1",
    type: "Tow Truck",
    licensePlate: "ABC-1234",
    status: "AVAILABLE",
    lastMaintenance: "2023-04-15",
    assignedDriver: "John Smith",
    capacity: "Small to medium vehicles",
    nextMaintenanceDate: "2023-07-15",
  },
  {
    id: "veh-002",
    name: "Service Van #1",
    type: "Service Van",
    licensePlate: "DEF-5678",
    status: "IN_USE",
    lastMaintenance: "2023-04-20",
    assignedDriver: "Emily Johnson",
    capacity: "Carries equipment for on-site repairs",
    nextMaintenanceDate: "2023-07-20",
  },
  {
    id: "veh-003",
    name: "Tow Truck #2",
    type: "Tow Truck",
    licensePlate: "GHI-9012",
    status: "MAINTENANCE",
    lastMaintenance: "2023-05-05",
    assignedDriver: "Michael Brown",
    capacity: "Large vehicles, trucks and SUVs",
    nextMaintenanceDate: "2023-08-05",
  },
  {
    id: "veh-004",
    name: "Flatbed Truck #1",
    type: "Flatbed Truck",
    licensePlate: "JKL-3456",
    status: "AVAILABLE",
    lastMaintenance: "2023-05-01",
    assignedDriver: "Sarah Davis",
    capacity: "All vehicle types, complete transportation",
    nextMaintenanceDate: "2023-08-01",
  },
]

// Vehicle tracking data
export const mockTrackingVehicles = [
  {
    id: "veh-001",
    name: "Tow Truck #1",
    type: "Tow Truck",
    licensePlate: "ABC-1234",
    status: "IN_USE",
    driver: {
      name: "John Smith",
      phone: "+1 (555) 123-4567",
    },
    location: {
      coordinates: [40.72, -74.01] as [number, number],
      lastUpdated: "2023-06-15T14:45:00Z",
    },
    currentRequest: {
      id: "req-001",
      customerName: "Michael Johnson",
      serviceType: "Flat Tire Replacement",
      location: {
        address: "123 Main St, New York, NY 10001",
        coordinates: [40.7128, -74.006] as [number, number],
      },
      status: "RESCUE_VEHICLE_DISPATCHED",
    },
  },
  {
    id: "veh-002",
    name: "Service Van #1",
    type: "Service Van",
    licensePlate: "DEF-5678",
    status: "AVAILABLE",
    driver: {
      name: "Emily Johnson",
      phone: "+1 (555) 987-6543",
    },
    location: {
      coordinates: [40.73, -73.995] as [number, number],
      lastUpdated: "2023-06-15T14:40:00Z",
    },
    currentRequest: null,
  },
  {
    id: "veh-003",
    name: "Tow Truck #2",
    type: "Tow Truck",
    licensePlate: "GHI-9012",
    status: "MAINTENANCE",
    driver: {
      name: "Michael Brown",
      phone: "+1 (555) 456-7890",
    },
    location: {
      coordinates: [40.715, -74.02] as [number, number],
      lastUpdated: "2023-06-15T13:30:00Z",
    },
    currentRequest: null,
  },
  {
    id: "veh-004",
    name: "Flatbed Truck #1",
    type: "Flatbed Truck",
    licensePlate: "JKL-3456",
    status: "IN_USE",
    driver: {
      name: "Sarah Davis",
      phone: "+1 (555) 234-5678",
    },
    location: {
      coordinates: [40.705, -73.99] as [number, number],
      lastUpdated: "2023-06-15T14:30:00Z",
    },
    currentRequest: {
      id: "req-002",
      customerName: "Jennifer Wilson",
      serviceType: "Vehicle Towing",
      location: {
        address: "456 Park Ave, New York, NY 10022",
        coordinates: [40.7, -73.985] as [number, number],
      },
      status: "IN_PROGRESS",
    },
  },
]

// Pending tracking requests
export const mockPendingTrackingRequests = [
  {
    id: "req-003",
    customerName: "Robert Thompson",
    serviceType: "Battery Jump Start",
    location: {
      address: "789 Broadway, New York, NY 10003",
      coordinates: [40.735, -73.99] as [number, number],
    },
    status: "CREATED",
    createdAt: "2023-06-15T14:50:00Z",
  },
  {
    id: "req-004",
    customerName: "Lisa Anderson",
    serviceType: "Lockout Service",
    location: {
      address: "321 5th Ave, New York, NY 10016",
      coordinates: [40.745, -73.985] as [number, number],
    },
    status: "CREATED",
    createdAt: "2023-06-15T14:55:00Z",
  },
]

// Map overview vehicles and requests
export const mockMapVehicles = [
  {
    id: "veh-001",
    name: "Tow Truck #1",
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
    },
    type: "Tow Truck",
    status: "IN_USE",
    location: {
      coordinates: [40.72, -74.01] as [number, number],
      lastUpdated: "2023-06-15T14:45:00Z",
    },
    currentRequest: "req-001",
  },
  {
    id: "veh-002",
    name: "Service Van #1",
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
    },
    type: "Service Van",
    status: "AVAILABLE",
    location: {
      coordinates: [40.73, -73.995] as [number, number],
      lastUpdated: "2023-06-15T14:40:00Z",
    },
    currentRequest: null,
  },
  {
    id: "veh-003",
    name: "Tow Truck #2",
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
    },
    type: "Tow Truck",
    status: "MAINTENANCE",
    location: {
      coordinates: [40.715, -74.02] as [number, number],
      lastUpdated: "2023-06-15T13:30:00Z",
    },
    currentRequest: null,
  },
  {
    id: "veh-004",
    name: "Flatbed Truck #1",
    company: {
      id: "comp-002",
      name: "QuickHelp Auto",
    },
    type: "Flatbed Truck",
    status: "IN_USE",
    location: {
      coordinates: [40.705, -73.99] as [number, number],
      lastUpdated: "2023-06-15T14:30:00Z",
    },
    currentRequest: "req-002",
  },
  {
    id: "veh-005",
    name: "Service Van #2",
    company: {
      id: "comp-002",
      name: "QuickHelp Auto",
    },
    type: "Service Van",
    status: "AVAILABLE",
    location: {
      coordinates: [40.725, -73.98] as [number, number],
      lastUpdated: "2023-06-15T14:20:00Z",
    },
    currentRequest: null,
  },
]

export const mockMapRequests = [
  {
    id: "req-001",
    customerName: "Michael Johnson",
    serviceType: "Flat Tire Replacement",
    location: {
      address: "123 Main St, New York, NY 10001",
      coordinates: [40.7128, -74.006] as [number, number],
    },
    status: "RESCUE_VEHICLE_DISPATCHED",
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
    },
    assignedVehicle: "veh-001",
    createdAt: "2023-06-15T14:30:00Z",
  },
  {
    id: "req-002",
    customerName: "Jennifer Wilson",
    serviceType: "Vehicle Towing",
    location: {
      address: "456 Park Ave, New York, NY 10022",
      coordinates: [40.7, -73.985] as [number, number],
    },
    status: "IN_PROGRESS",
    company: {
      id: "comp-002",
      name: "QuickHelp Auto",
    },
    assignedVehicle: "veh-004",
    createdAt: "2023-06-15T14:20:00Z",
  },
  {
    id: "req-003",
    customerName: "Robert Thompson",
    serviceType: "Battery Jump Start",
    location: {
      address: "789 Broadway, New York, NY 10003",
      coordinates: [40.735, -73.99] as [number, number],
    },
    status: "CREATED",
    company: null,
    assignedVehicle: null,
    createdAt: "2023-06-15T14:50:00Z",
  },
  {
    id: "req-004",
    customerName: "Lisa Anderson",
    serviceType: "Lockout Service",
    location: {
      address: "321 5th Ave, New York, NY 10016",
      coordinates: [40.745, -73.985] as [number, number],
    },
    status: "CREATED",
    company: null,
    assignedVehicle: null,
    createdAt: "2023-06-15T14:55:00Z",
  },
]

// Vehicle types and statuses for dropdowns
export const vehicleTypes = ["Tow Truck", "Service Van", "Flatbed Truck", "Wheel Lift Truck", "Motorcycle Trailer"]
export const vehicleStatuses = ["AVAILABLE", "IN_USE", "MAINTENANCE", "OUT_OF_SERVICE"]

// Requests
export const mockRequests = [
  {
    id: "req-001",
    service: "Flat Tire Replacement",
    status: "COMPLETED",
    date: "2023-05-01T10:30:00",
    user: {
      id: "user-001",
      name: "John Doe",
      phone: "+1 (555) 123-4567",
    },
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
    },
    location: "123 Main St, Anytown",
    assignedVehicle: "Tow Truck #1",
    price: 85.0,
    hasIssue: false,
  },
  {
    id: "req-002",
    service: "Battery Jump Start",
    status: "IN_PROGRESS",
    date: "2023-05-05T14:15:00",
    user: {
      id: "user-002",
      name: "Jane Smith",
      phone: "+1 (555) 987-6543",
    },
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
    },
    location: "456 Oak Ave, Somewhere",
    assignedVehicle: "Service Van #1",
    price: 65.0,
    hasIssue: false,
  },
  {
    id: "req-003",
    service: "Vehicle Towing",
    status: "CREATED",
    date: "2023-05-07T09:00:00",
    user: {
      id: "user-003",
      name: "Bob Johnson",
      phone: "+1 (555) 456-7890",
    },
    company: null,
    location: "789 Pine Rd, Nowhere",
    assignedVehicle: null,
    price: null,
    hasIssue: true,
  },
  {
    id: "req-004",
    service: "Fuel Delivery",
    status: "ACCEPTED_BY_COMPANY",
    date: "2023-05-06T11:20:00",
    user: {
      id: "user-004",
      name: "Alice Brown",
      phone: "+1 (555) 234-5678",
    },
    company: {
      id: "comp-002",
      name: "QuickHelp Auto",
    },
    location: "321 Elm St, Anytown",
    assignedVehicle: null,
    price: 75.0,
    hasIssue: false,
  },
  {
    id: "req-005",
    service: "Lockout Service",
    status: "RESCUE_VEHICLE_DISPATCHED",
    date: "2023-05-06T16:45:00",
    user: {
      id: "user-005",
      name: "Charlie Wilson",
      phone: "+1 (555) 345-6789",
    },
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
    },
    location: "555 Maple Ave, Somewhere",
    assignedVehicle: "Service Van #1",
    price: 70.0,
    hasIssue: false,
  },
  {
    id: "req-006",
    service: "Flat Tire Replacement",
    status: "CANCELLED_BY_USER",
    date: "2023-05-04T13:20:00",
    user: {
      id: "user-006",
      name: "David Miller",
      phone: "+1 (555) 567-8901",
    },
    company: {
      id: "comp-003",
      name: "RoadHeroes Assistance",
    },
    location: "777 Cedar St, Somewhere",
    assignedVehicle: null,
    price: null,
    hasIssue: true,
  },
]

// Request details
export const mockRequestDetails = {
  id: "req-001",
  status: "RESCUE_VEHICLE_DISPATCHED",
  location: "123 Main St, New York, NY 10001",
  serviceType: "Flat Tire Replacement",
  description: "Left rear tire is flat. I have a spare but need help changing it.",
  createdAt: "2023-06-15T14:30:00Z",
  estimatedArrival: "2023-06-15T15:00:00Z",
  vehicle: {
    make: "Toyota",
    model: "Camry",
    year: "2020",
  },
  company: {
    id: "comp-001",
    name: "FastFix Roadside",
    phone: "+1 (555) 123-4567",
  },
  assignedVehicle: {
    id: "veh-001",
    name: "Tow Truck #1",
    driver: {
      name: "John Smith",
      phone: "+1 (555) 987-6543",
    },
  },
  price: 75.0,
  additionalFees: 15.0,
  total: 90.0,
  timeline: [
    {
      status: "CREATED",
      timestamp: "2023-06-15T14:30:00Z",
    },
    {
      status: "ACCEPTED_BY_COMPANY",
      timestamp: "2023-06-15T14:35:00Z",
    },
    {
      status: "RESCUE_VEHICLE_DISPATCHED",
      timestamp: "2023-06-15T14:40:00Z",
    },
  ],
  hasChat: true,
}

// Request map data
export const mockRequestMap = {
  id: "req-001",
  status: "RESCUE_VEHICLE_DISPATCHED",
  location: {
    address: "123 Main St, New York, NY 10001",
    coordinates: [40.7128, -74.006] as [number, number],
  },
  serviceType: "Flat Tire Replacement",
  createdAt: "2023-06-15T14:30:00Z",
  estimatedArrival: "2023-06-15T15:00:00Z",
  vehicle: {
    id: "veh-001",
    name: "Tow Truck #1",
    type: "Tow Truck",
    driver: {
      name: "John Smith",
      phone: "+1 (555) 123-4567",
    },
    location: {
      coordinates: [40.72, -74.01] as [number, number],
      lastUpdated: "2023-06-15T14:45:00Z",
    },
  },
}

// User Requests (for user dashboard)
export const mockUserRequests = [
  {
    id: "req-001",
    service: "Flat Tire Replacement",
    status: "COMPLETED",
    date: "2023-05-01T10:30:00",
    company: "FastFix Roadside",
    location: "123 Main St, Anytown",
    price: 85.0,
  },
  {
    id: "req-002",
    service: "Battery Jump Start",
    status: "IN_PROGRESS",
    date: "2023-05-05T14:15:00",
    company: "QuickHelp Auto",
    location: "456 Oak Ave, Somewhere",
    price: 65.0,
  },
  {
    id: "req-003",
    service: "Vehicle Towing",
    status: "CREATED",
    date: "2023-05-07T09:00:00",
    company: null,
    location: "789 Pine Rd, Nowhere",
    price: null,
  },
  {
    id: "req-004",
    service: "Fuel Delivery",
    status: "CANCELLED_BY_USER",
    date: "2023-04-29T11:30:00",
    company: null,
    location: "321 Cedar St, Anytown",
    price: null,
  },
  {
    id: "req-005",
    service: "Lockout Service",
    status: "ACCEPTED_BY_COMPANY",
    date: "2023-05-06T16:45:00",
    company: "FastFix Roadside",
    location: "555 Maple Ave, Somewhere",
    price: 70.0,
  },
]

// Status options for the select
export const statusOptions = [
  "CREATED",
  "ACCEPTED_BY_COMPANY",
  "RESCUE_VEHICLE_DISPATCHED",
  "RESCUE_VEHICLE_ARRIVED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED_BY_COMPANY",
]

// Service types for create request
export const serviceTypes = [
  { id: "flat-tire", name: "Flat Tire Replacement" },
  { id: "battery", name: "Battery Jump Start" },
  { id: "towing", name: "Vehicle Towing" },
  { id: "fuel", name: "Fuel Delivery" },
  { id: "lockout", name: "Lockout Service" },
  { id: "winching", name: "Winching" },
  { id: "other", name: "Other" },
]

// Invoices
export const mockInvoices = [
  {
    id: "inv-001",
    requestId: "req-001",
    service: "Flat Tire Replacement",
    user: {
      id: "user-001",
      name: "John Doe",
      email: "john@example.com",
    },
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
    },
    amount: 85.0,
    status: "PAID",
    paymentMethod: "Credit Card",
    date: "2023-05-01T16:45:00",
    dueDate: "2023-05-08T16:45:00",
    sentDate: "2023-05-01T16:50:00",
    paidDate: "2023-05-02T09:15:00",
  },
  {
    id: "inv-002",
    requestId: "req-002",
    service: "Battery Jump Start",
    user: {
      id: "user-002",
      name: "Jane Smith",
      email: "jane@example.com",
    },
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
    },
    amount: 65.0,
    status: "SENT",
    paymentMethod: null,
    date: "2023-05-05T17:30:00",
    dueDate: "2023-05-12T17:30:00",
    sentDate: "2023-05-05T17:35:00",
    paidDate: null,
  },
  {
    id: "inv-003",
    requestId: "req-005",
    service: "Lockout Service",
    user: {
      id: "user-005",
      name: "Charlie Wilson",
      email: "charlie@example.com",
    },
    company: {
      id: "comp-001",
      name: "FastFix Roadside",
    },
    amount: 70.0,
    status: "DRAFT",
    paymentMethod: null,
    date: "2023-05-06T17:00:00",
    dueDate: "2023-05-13T17:00:00",
    sentDate: null,
    paidDate: null,
  },
  {
    id: "inv-004",
    requestId: "req-004",
    service: "Fuel Delivery",
    user: {
      id: "user-004",
      name: "Alice Brown",
      email: "alice@example.com",
    },
    company: {
      id: "comp-002",
      name: "QuickHelp Auto",
    },
    amount: 75.0,
    status: "OVERDUE",
    paymentMethod: null,
    date: "2023-04-15T09:30:00",
    dueDate: "2023-04-22T09:30:00",
    sentDate: "2023-04-15T09:35:00",
    paidDate: null,
  },
  {
    id: "inv-005",
    requestId: "req-006",
    service: "Flat Tire Replacement",
    user: {
      id: "user-006",
      name: "David Miller",
      email: "david@example.com",
    },
    company: {
      id: "comp-003",
      name: "RoadHeroes Assistance",
    },
    amount: 80.0,
    status: "PAID",
    paymentMethod: "PayPal",
    date: "2023-04-20T14:30:00",
    dueDate: "2023-04-27T14:30:00",
    sentDate: "2023-04-20T14:35:00",
    paidDate: "2023-04-21T10:15:00",
  },
]

// User Invoices (for user dashboard)
export const mockUserInvoices = [
  {
    id: "inv-001",
    requestId: "req-001",
    amount: 85.0,
    status: "PAID",
    date: "2023-05-01T16:45:00",
  },
  {
    id: "inv-002",
    requestId: "req-002",
    amount: 65.0,
    status: "PENDING",
    date: "2023-05-05T17:30:00",
  },
]

// Services
export const mockServices = [
  {
    id: "serv-001",
    name: "Flat Tire Replacement",
    description: "Replace a flat tire with your spare or provide a temporary tire.",
    basePrice: 75.0,
    duration: 30,
    companies: 15,
    isActive: true,
  },
  {
    id: "serv-002",
    name: "Battery Jump Start",
    description: "Jump start your vehicle's battery to get you back on the road.",
    basePrice: 55.0,
    duration: 20,
    companies: 18,
    isActive: true,
  },
  {
    id: "serv-003",
    name: "Vehicle Towing",
    description: "Tow your vehicle to a nearby garage or your preferred location.",
    basePrice: 120.0,
    duration: 60,
    companies: 12,
    isActive: true,
  },
  {
    id: "serv-004",
    name: "Fuel Delivery",
    description: "Delivery of fuel when you've run out on the road.",
    basePrice: 65.0,
    duration: 30,
    companies: 14,
    isActive: true,
  },
  {
    id: "serv-005",
    name: "Lockout Service",
    description: "Help when you're locked out of your vehicle.",
    basePrice: 70.0,
    duration: 25,
    companies: 16,
    isActive: true,
  },
  {
    id: "serv-006",
    name: "Winching",
    description: "Pull your vehicle out when it's stuck in mud, snow, or off the road.",
    basePrice: 95.0,
    duration: 45,
    companies: 8,
    isActive: false,
  },
]

// Company Services (for company dashboard)
export const mockCompanyServices = [
  {
    id: "serv-001",
    name: "Flat Tire Replacement",
    description: "Replace a flat tire with your spare or provide a temporary tire.",
    basePrice: 75.0,
    duration: 30,
    isActive: true,
  },
  {
    id: "serv-002",
    name: "Battery Jump Start",
    description: "Jump start your vehicle's battery to get you back on the road.",
    basePrice: 55.0,
    duration: 20,
    isActive: true,
  },
  {
    id: "serv-003",
    name: "Vehicle Towing",
    description: "Tow your vehicle to a nearby garage or your preferred location.",
    basePrice: 120.0,
    duration: 60,
    isActive: true,
  },
  {
    id: "serv-004",
    name: "Fuel Delivery",
    description: "Delivery of fuel when you've run out on the road.",
    basePrice: 65.0,
    duration: 30,
    isActive: false,
  },
  {
    id: "serv-005",
    name: "Lockout Service",
    description: "Help when you're locked out of your vehicle.",
    basePrice: 70.0,
    duration: 25,
    isActive: true,
  },
]

// Chats
export const mockAdminChats = [
  {
    id: "chat-001",
    participants: [
      {
        id: "user-001",
        name: "John Doe",
        role: "user",
        avatar: "",
      },
      {
        id: "comp-001",
        name: "FastFix Roadside",
        role: "company",
        avatar: "",
      },
    ],
    requestId: "req-001",
    lastMessage: {
      sender: "user-001",
      content: "Thank you for your help!",
      timestamp: "2023-05-07T11:30:00",
    },
    status: "ACTIVE",
    unreadCount: 0,
    messages: [
      {
        id: "msg-001",
        sender: "comp-001",
        content: "We've dispatched a technician. ETA 20 minutes.",
        timestamp: "2023-05-01T10:42:00",
      },
      {
        id: "msg-002",
        sender: "user-001",
        content: "Thank you, I'll be waiting by the car.",
        timestamp: "2023-05-01T10:45:00",
      },
      {
        id: "msg-003",
        sender: "comp-001",
        content: "Our technician has arrived. Please meet them at your vehicle.",
        timestamp: "2023-05-01T11:00:00",
      },
      {
        id: "msg-004",
        sender: "user-001",
        content: "Thank you for your help!",
        timestamp: "2023-05-07T11:30:00",
      },
    ],
    hasIssue: false,
  },
  {
    id: "chat-002",
    participants: [
      {
        id: "user-002",
        name: "Jane Smith",
        role: "user",
        avatar: "",
      },
      {
        id: "comp-002",
        name: "QuickHelp Auto",
        role: "company",
        avatar: "",
      },
    ],
    requestId: "req-002",
    lastMessage: {
      sender: "user-002",
      content: "The technician is taking too long to arrive. Can you check the status?",
      timestamp: "2023-05-07T09:15:00",
    },
    status: "ACTIVE",
    unreadCount: 2,
    messages: [
      {
        id: "msg-001",
        sender: "comp-002",
        content: "We're on our way. Should arrive in about 25 minutes.",
        timestamp: "2023-05-05T14:28:00",
      },
      {
        id: "msg-002",
        sender: "user-002",
        content: "Great, thank you!",
        timestamp: "2023-05-05T14:30:00",
      },
      {
        id: "msg-003",
        sender: "user-002",
        content: "It's been 30 minutes now. Any update?",
        timestamp: "2023-05-07T09:00:00",
      },
      {
        id: "msg-004",
        sender: "user-002",
        content: "The technician is taking too long to arrive. Can you check the status?",
        timestamp: "2023-05-07T09:15:00",
      },
    ],
    hasIssue: true,
  },
  {
    id: "chat-003",
    participants: [
      {
        id: "user-004",
        name: "Alice Brown",
        role: "user",
        avatar: "",
      },
      {
        id: "comp-001",
        name: "FastFix Roadside",
        role: "company",
        avatar: "",
      },
    ],
    requestId: "req-004",
    lastMessage: {
      sender: "comp-001",
      content: "We'll be there in about 15 minutes with your fuel.",
      timestamp: "2023-05-06T11:45:00",
    },
    status: "ACTIVE",
    unreadCount: 0,
    messages: [
      {
        id: "msg-001",
        sender: "user-004",
        content: "I've run out of fuel. How soon can you get here?",
        timestamp: "2023-05-06T11:30:00",
      },
      {
        id: "msg-002",
        sender: "comp-001",
        content: "We'll be there in about 15 minutes with your fuel.",
        timestamp: "2023-05-06T11:45:00",
      },
    ],
    hasIssue: false,
  },
]

// User Chats
export const mockUserChats = [
  {
    id: "chat-001",
    requestId: "req-001",
    companyId: "company-001",
    companyName: "FastFix Roadside",
    lastMessage: "We'll be there in about 15 minutes.",
    timestamp: "2023-05-07T14:30:00",
    unread: 2,
    status: "ACTIVE",
  },
  {
    id: "chat-002",
    requestId: "req-002",
    companyId: "company-002",
    companyName: "QuickHelp Auto",
    lastMessage: "Your invoice has been generated. Please check your email.",
    timestamp: "2023-05-06T11:45:00",
    unread: 0,
    status: "COMPLETED",
  },
  {
    id: "chat-003",
    requestId: "req-003",
    companyId: "company-003",
    companyName: "RoadHeroes Assistance",
    lastMessage: "We need to update the price to $95 due to additional parts needed.",
    timestamp: "2023-05-05T16:20:00",
    unread: 0,
    status: "PRICE_NEGOTIATION",
  },
  {
    id: "chat-004",
    requestId: "req-004",
    companyId: "company-001",
    companyName: "FastFix Roadside",
    lastMessage: "Thank you for using our service!",
    timestamp: "2023-05-02T09:15:00",
    unread: 0,
    status: "CLOSED",
  },
]

// Company Chats
export const mockCompanyChats = [
  {
    id: "chat-001",
    requestId: "req-001",
    userId: "user-001",
    userName: "John Doe",
    service: "Flat Tire Replacement",
    lastMessage: "We'll be there in about 15 minutes.",
    timestamp: "2023-05-07T14:30:00",
    unread: 0,
    status: "ACTIVE",
  },
  {
    id: "chat-002",
    requestId: "req-002",
    userId: "user-002",
    userName: "Jane Smith",
    service: "Battery Jump Start",
    lastMessage: "Your invoice has been generated. Please check your email.",
    timestamp: "2023-05-06T11:45:00",
    unread: 1,
    status: "COMPLETED",
  },
  {
    id: "chat-003",
    requestId: "req-003",
    userId: "user-003",
    userName: "Bob Johnson",
    service: "Vehicle Towing",
    lastMessage: "We need to update the price to $95 due to additional parts needed.",
    timestamp: "2023-05-05T16:20:00",
    unread: 0,
    status: "PRICE_NEGOTIATION",
  },
  {
    id: "chat-004",
    requestId: "req-004",
    userId: "user-004",
    userName: "Alice Brown",
    service: "Fuel Delivery",
    lastMessage: "Thank you for using our service!",
    timestamp: "2023-05-02T09:15:00",
    unread: 0,
    status: "CLOSED",
  },
  {
    id: "chat-005",
    requestId: "req-005",
    userId: "user-005",
    userName: "Charlie Wilson",
    service: "Lockout Service",
    lastMessage: "I'm at the corner of Main St and Oak Ave.",
    timestamp: "2023-05-07T15:10:00",
    unread: 3,
    status: "ACTIVE",
  },
]

// Vehicle options for the select
export const vehicleOptions = [
  { id: "veh-001", name: "Tow Truck #1", type: "Tow Truck" },
  { id: "veh-002", name: "Service Van #1", type: "Service Van" },
  { id: "veh-004", name: "Flatbed Truck #1", type: "Flatbed Truck" },
]

// Admin dashboard stats
export const mockAdminStats = {
  totalRequests: 156,
  activeRequests: 42,
  totalCompanies: 15,
  totalVehicles: 78,
  totalUsers: 320,
  totalRevenue: 12450.75,
}

export const mockRequestsByStatus = [
  { status: "CREATED", count: 18 },
  { status: "ACCEPTED_BY_COMPANY", count: 12 },
  { status: "RESCUE_VEHICLE_DISPATCHED", count: 8 },
  { status: "RESCUE_VEHICLE_ARRIVED", count: 6 },
  { status: "INSPECTION_DONE", count: 4 },
  { status: "PRICE_UPDATED", count: 3 },
  { status: "IN_PROGRESS", count: 9 },
  { status: "COMPLETED", count: 25 },
  { status: "INVOICED", count: 15 },
  { status: "PAID", count: 45 },
  { status: "CANCELLED_BY_USER", count: 7 },
  { status: "CANCELLED_BY_COMPANY", count: 4 },
]

export const mockRecentActivity = [
  {
    id: "act-001",
    type: "request_created",
    user: "John Doe",
    details: "Created a new rescue request for Flat Tire Replacement",
    date: "2023-05-07T09:30:00",
  },
  {
    id: "act-002",
    type: "request_accepted",
    company: "FastFix Roadside",
    details: "Accepted rescue request #req-003",
    date: "2023-05-07T09:45:00",
  },
  {
    id: "act-003",
    type: "vehicle_dispatched",
    company: "QuickHelp Auto",
    details: "Dispatched vehicle 'Tow Truck #2' for request #req-002",
    date: "2023-05-07T10:15:00",
  },
  {
    id: "act-004",
    type: "invoice_paid",
    user: "Alice Brown",
    details: "Paid invoice #inv-001 for $85.00",
    date: "2023-05-07T11:20:00",
  },
  {
    id: "act-005",
    type: "company_registered",
    company: "RoadHeroes Assistance",
    details: "New company registered",
    date: "2023-05-07T12:05:00",
  },
]

// Company dashboard stats
export const mockCompanyDashboardStats = {
  newRequests: 0,
  activeRequests: 0,
  completedRequests: 0,
  availableVehicles: 0,
  totalRevenue: 0,
}

// Chat data for user and company chat pages
export const generateMockChat = (requestId: string, userId: string, companyId: string): Chat => {
  return {
    id: requestId,
    participants: [
      { id: userId, name: "John Doe", role: "user" },
      { id: companyId, name: "Rescue Company", role: "company" }
    ],
    messages: [
      {
        id: "msg-1",
        content: "Hello, I need help with my car.",
        type: "TEXT",
        senderId: userId,
        timestamp: new Date().toISOString()
      },
      {
        id: "msg-2",
        content: "Hi! We can help you. What's the issue?",
        type: "TEXT",
        senderId: companyId,
        timestamp: new Date().toISOString()
      }
    ],
    status: "ACTIVE",
    lastUpdated: new Date().toISOString()
  }
}

export const mockChatRequestDetails: RequestDetails = {
  id: "req-1",
  status: "PENDING",
  currentPrice: 0
}

// Add the PaymentInvoice type and mockPaymentInvoice data at the end of the file

// Payment Invoice type
export type PaymentInvoice = {
  id: string
  requestId: string
  userId: string
  companyId: string
  amount: number
  serviceType: string
  status: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED"
  createdAt: string
  dueDate: string
  paidAt?: string
  paymentMethod?: string
  transactionId?: string
  notes?: string
}

// Mock payment invoice data
export const mockPaymentInvoice: PaymentInvoice[] = [
  {
    id: "pinv-001",
    requestId: "req-001",
    userId: "user-001",
    companyId: "comp-001",
    amount: 85.0,
    serviceType: "Flat Tire Replacement",
    status: "PAID",
    createdAt: "2023-05-01T16:45:00",
    dueDate: "2023-05-08T16:45:00",
    paidAt: "2023-05-02T09:15:00",
    paymentMethod: "Credit Card",
    transactionId: "txn-12345",
    notes: "Payment received on time",
  },
  {
    id: "pinv-002",
    requestId: "req-002",
    userId: "user-002",
    companyId: "comp-001",
    amount: 65.0,
    serviceType: "Battery Jump Start",
    status: "PENDING",
    createdAt: "2023-05-05T17:30:00",
    dueDate: "2023-05-12T17:30:00",
  },
  {
    id: "pinv-003",
    requestId: "req-004",
    userId: "user-004",
    companyId: "comp-002",
    amount: 75.0,
    serviceType: "Fuel Delivery",
    status: "OVERDUE",
    createdAt: "2023-04-15T09:30:00",
    dueDate: "2023-04-22T09:30:00",
    notes: "Payment reminder sent on 2023-04-23",
  },
  {
    id: "pinv-004",
    requestId: "req-006",
    userId: "user-006",
    companyId: "comp-003",
    amount: 80.0,
    serviceType: "Flat Tire Replacement",
    status: "PAID",
    createdAt: "2023-04-20T14:30:00",
    dueDate: "2023-04-27T14:30:00",
    paidAt: "2023-04-21T10:15:00",
    paymentMethod: "PayPal",
    transactionId: "txn-67890",
    notes: "Early payment",
  },
  {
    id: "pinv-005",
    requestId: "req-005",
    userId: "user-005",
    companyId: "comp-001",
    amount: 70.0,
    serviceType: "Lockout Service",
    status: "PENDING",
    createdAt: "2023-05-06T17:00:00",
    dueDate: "2023-05-13T17:00:00",
  },
]
