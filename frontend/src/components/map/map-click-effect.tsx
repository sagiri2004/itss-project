import { useEffect } from "react"

interface MapClickEffectProps {
  onClick: (lat: number, lng: number) => void
  mapCenter: [number, number]
}

export function MapClickEffect({ onClick }: MapClickEffectProps) {
  useEffect(() => {
    if (typeof window === "undefined") return
    let map: any = null
    import("leaflet").then(L => {
      // Try to get map from global _leaflet_id
      const containers = document.getElementsByClassName("leaflet-container")
      if (!containers.length) return
      const mapContainer = containers[0] as HTMLElement & { _leaflet_id?: number }
      if (mapContainer && mapContainer._leaflet_id && (L as any).Map && (L as any).Map._instances) {
        map = (L as any).Map._instances[mapContainer._leaflet_id]
      }
      if (!map || !map.on) return
      const handleClick = (e: any) => {
        const { lat, lng } = e.latlng
        onClick(lat, lng)
      }
      map.on("click", handleClick)
      return () => {
        map.off("click", handleClick)
      }
    })
  }, [onClick])
  return null
} 