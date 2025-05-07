import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format date
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Helper function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

// Helper function to get status badge variant
export function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" | null {
  const statusMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    CREATED: "secondary",
    ACCEPTED_BY_COMPANY: "default",
    RESCUE_VEHICLE_DISPATCHED: "default",
    RESCUE_VEHICLE_ARRIVED: "default",
    INSPECTION_DONE: "default",
    PRICE_UPDATED: "default",
    PRICE_CONFIRMED: "default",
    IN_PROGRESS: "default",
    COMPLETED: "default",
    INVOICED: "default",
    PAID: "default",
    REJECTED_BY_USER: "destructive",
    CANCELLED_BY_USER: "destructive",
    CANCELLED_BY_COMPANY: "destructive",
  }

  return statusMap[status] || "outline"
}

// Helper function to format status text
export function formatStatus(status: string): string {
  return status.replace(/_/g, " ")
}