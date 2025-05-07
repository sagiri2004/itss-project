"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MapViewProps {
  className?: string
  markers?: Array<{
    id: string
    position: [number, number]
    type: "vehicle" | "request" | "user"
    label?: string
    status?: string
  }>
  center?: [number, number]
  zoom?: number
  onMarkerClick?: (id: string) => void
  showControls?: boolean
  height?: string
}

export function MapView({
  className,
  markers = [],
  center = [40.7128, -74.006], // Default to NYC
  zoom = 12,
  onMarkerClick,
  showControls = true,
  height = "500px",
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [isMapInitialized, setIsMapInitialized] = useState(false)

  // Fix for Leaflet marker icons in Next.js
  useEffect(() => {
    // Only run this on the client side
    if (typeof window !== "undefined") {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      })
    }
  }, [])

  // Initialize map
  useEffect(() => {
    let map: L.Map | null = null
    if (mapContainerRef.current && !mapRef.current) {
      map = L.map(mapContainerRef.current).setView(center, zoom)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      if (showControls) {
        L.control.zoom({ position: "bottomright" }).addTo(map)
        L.control.scale({ position: "bottomleft" }).addTo(map)
      }

      mapRef.current = map
      setIsMapInitialized(true)
    }

    return () => {
      if (map) {
        map.remove()
      }
      mapRef.current = null
    }
  }, [center, zoom, showControls])

  // Handle markers
  useEffect(() => {
    if (mapRef.current && isMapInitialized) {
      // Clear existing markers
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapRef.current?.removeLayer(layer)
        }
      })

      // Add new markers
      markers.forEach((marker) => {
        const markerIcon = getMarkerIcon(marker.type, marker.status)

        const mapMarker = L.marker(marker.position, { icon: markerIcon })
          .addTo(mapRef.current!)
          .bindTooltip(marker.label || getDefaultLabel(marker.type))

        if (onMarkerClick) {
          mapMarker.on("click", () => onMarkerClick(marker.id))
        }
      })
    }
  }, [markers, isMapInitialized, onMarkerClick])

  // Update center and zoom if they change
  useEffect(() => {
    if (mapRef.current && isMapInitialized) {
      mapRef.current.setView(center, zoom)
    }
  }, [center, zoom, isMapInitialized])

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div ref={mapContainerRef} style={{ height }} className="w-full" />
    </Card>
  )
}

// Helper functions for marker icons
function getMarkerIcon(type: "vehicle" | "request" | "user", status?: string) {
  const iconSize = [25, 41]
  const iconAnchor = [12, 41]
  const popupAnchor = [1, -34]
  const tooltipAnchor = [16, -28]

  let iconUrl = ""

  switch (type) {
    case "vehicle":
      iconUrl =
        status === "MAINTENANCE"
          ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png"
          : status === "IN_USE"
            ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png"
            : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"
      break
    case "request":
      iconUrl =
        status === "COMPLETED"
          ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"
          : status === "IN_PROGRESS"
            ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png"
            : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"
      break
    case "user":
      iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png"
      break
    default:
      iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png"
  }

  return L.icon({
    iconUrl,
    iconSize,
    iconAnchor,
    popupAnchor,
    tooltipAnchor,
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  })
}

function getDefaultLabel(type: "vehicle" | "request" | "user") {
  switch (type) {
    case "vehicle":
      return "Service Vehicle"
    case "request":
      return "Service Request"
    case "user":
      return "Your Location"
    default:
      return "Location"
  }
}
