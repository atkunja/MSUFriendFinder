'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Location, Review, Profile, LocationType } from '@/types/database'

interface LocationWithReviews extends Location {
  reviews: (Review & { user: Profile })[]
  averageRating: number
  reviewCount: number
}

interface CampusMapProps {
  locations: LocationWithReviews[]
  onLocationSelect: (location: LocationWithReviews) => void
  selectedLocation: LocationWithReviews | null
  currentUser: Profile | null
}

// Custom marker icons for different location types
const getMarkerIcon = (type: LocationType, isSelected: boolean) => {
  const colors: Record<LocationType, string> = {
    dining: '#F97316',
    library: '#3B82F6',
    gym: '#EF4444',
    building: '#64748B',
    dorm: '#22C55E',
    other: '#18453B',
  }

  const emojis: Record<LocationType, string> = {
    dining: '🍽️',
    library: '📚',
    gym: '💪',
    building: '🏛️',
    dorm: '🏠',
    other: '📍',
  }

  const color = colors[type] || '#18453B'
  const size = isSelected ? 48 : 36
  const shadowSize = isSelected ? 12 : 8

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 ${shadowSize / 2}px ${shadowSize}px rgba(0,0,0,0.3);
        transition: all 0.2s ease;
      ">
        <span style="
          font-size: ${size / 2.2}px;
          transform: rotate(45deg);
        ">${emojis[type]}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

// Star rating helper
function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= rating ? '#F59E0B' : 'none'}
          stroke={star <= rating ? '#F59E0B' : '#D1D5DB'}
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      ))}
    </div>
  )
}

export default function CampusMap({
  locations,
  onLocationSelect,
  selectedLocation,
  currentUser,
}: CampusMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const [mapReady, setMapReady] = useState(false)

  // MSU campus center coordinates
  const MSU_CENTER: [number, number] = [42.7251, -84.4816]

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map
    const map = L.map(mapRef.current, {
      center: MSU_CENTER,
      zoom: 15,
      zoomControl: false,
    })

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Add tile layer with a clean style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map
    setMapReady(true)

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Update markers when locations change
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return

    const map = mapInstanceRef.current

    // Clear old markers
    markersRef.current.forEach((marker) => {
      map.removeLayer(marker)
    })
    markersRef.current.clear()

    // Add markers for locations with coordinates
    locations
      .filter((loc) => loc.latitude && loc.longitude)
      .forEach((location) => {
        const isSelected = selectedLocation?.id === location.id
        const marker = L.marker([location.latitude!, location.longitude!], {
          icon: getMarkerIcon(location.location_type, isSelected),
        })

        // Create popup content
        const popupContent = document.createElement('div')
        popupContent.className = 'map-popup'
        popupContent.innerHTML = `
          <div style="min-width: 180px; padding: 4px 0;">
            <h3 style="font-weight: bold; font-size: 14px; margin: 0 0 4px 0;">${location.name}</h3>
            <p style="font-size: 12px; color: #6B7280; margin: 0 0 8px 0; text-transform: capitalize;">${location.location_type}</p>
            ${location.reviewCount > 0
              ? `<div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-weight: bold; color: #F59E0B;">${location.averageRating.toFixed(1)}</span>
                  <span style="font-size: 11px; color: #9CA3AF;">(${location.reviewCount} reviews)</span>
                </div>`
              : '<p style="font-size: 12px; color: #9CA3AF;">No reviews yet</p>'
            }
          </div>
        `

        marker.bindPopup(popupContent, {
          closeButton: false,
          className: 'custom-popup',
        })

        marker.on('click', () => {
          onLocationSelect(location)
        })

        marker.addTo(map)
        markersRef.current.set(location.id, marker)
      })
  }, [locations, mapReady, selectedLocation, onLocationSelect])

  // Update selected marker appearance
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return

    markersRef.current.forEach((marker, id) => {
      const location = locations.find((l) => l.id === id)
      if (location) {
        const isSelected = selectedLocation?.id === id
        marker.setIcon(getMarkerIcon(location.location_type, isSelected))

        if (isSelected && location.latitude && location.longitude) {
          mapInstanceRef.current?.panTo([location.latitude, location.longitude], {
            animate: true,
            duration: 0.5,
          })
        }
      }
    })
  }, [selectedLocation, locations, mapReady])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden" />

      {/* Map Legend */}
      <div className="absolute top-4 left-4 bg-background-elevated/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-glass-border z-[1000]">
        <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-2">Legend</p>
        <div className="space-y-1.5">
          {[
            { type: 'dining', emoji: '🍽️', label: 'Dining', color: '#F97316' },
            { type: 'library', emoji: '📚', label: 'Library', color: '#3B82F6' },
            { type: 'gym', emoji: '💪', label: 'Gym', color: '#EF4444' },
            { type: 'building', emoji: '🏛️', label: 'Building', color: '#64748B' },
            { type: 'dorm', emoji: '🏠', label: 'Dorm', color: '#22C55E' },
          ].map(({ emoji, label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{ backgroundColor: color }}
              >
                {emoji}
              </div>
              <span className="text-xs font-medium text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Location count */}
      <div className="absolute top-4 right-4 bg-msu-gradient text-white px-4 py-2 rounded-xl shadow-lg z-[1000]">
        <p className="text-sm font-bold">{locations.filter((l) => l.latitude && l.longitude).length} Locations</p>
      </div>

      {/* Custom styles for popups */}
      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }
        .leaflet-control-zoom a {
          border-radius: 8px !important;
          border: none !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
        }
        .leaflet-control-zoom-in {
          border-radius: 8px 8px 0 0 !important;
        }
        .leaflet-control-zoom-out {
          border-radius: 0 0 8px 8px !important;
        }
      `}</style>
    </div>
  )
}
