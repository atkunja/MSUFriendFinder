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
  searchQuery: string
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
        box-shadow: 0 ${shadowSize / 2}px ${shadowSize}px rgba(0,0,0,0.5);
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

export default function CampusMap({
  locations,
  onLocationSelect,
  selectedLocation,
  searchQuery,
}: CampusMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const [mapReady, setMapReady] = useState(false)

  // MSU campus center coordinates
  const MSU_CENTER: [number, number] = [42.7251, -84.4816]

  // East Lansing bounds - restricts map panning
  const EAST_LANSING_BOUNDS = L.latLngBounds(
    L.latLng(42.695, -84.520), // Southwest corner
    L.latLng(42.755, -84.440)  // Northeast corner
  )

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map with bounds restriction
    const map = L.map(mapRef.current, {
      center: MSU_CENTER,
      zoom: 15,
      zoomControl: false,
      minZoom: 14,
      maxZoom: 19,
      maxBounds: EAST_LANSING_BOUNDS,
      maxBoundsViscosity: 1.0, // Prevents dragging outside bounds
    })

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Add dark tile layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
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

        // Create popup content with dark theme
        const popupContent = document.createElement('div')
        popupContent.className = 'map-popup'
        popupContent.innerHTML = `
          <div style="min-width: 180px; padding: 4px 0;">
            <h3 style="font-weight: bold; font-size: 14px; margin: 0 0 4px 0; color: #fff;">${location.name}</h3>
            <p style="font-size: 12px; color: #9CA3AF; margin: 0 0 8px 0; text-transform: capitalize;">${location.location_type}</p>
            ${location.reviewCount > 0
              ? `<div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-weight: bold; color: #F59E0B;">${location.averageRating.toFixed(1)}</span>
                  <span style="font-size: 11px; color: #6B7280;">(${location.reviewCount} reviews)</span>
                </div>`
              : '<p style="font-size: 12px; color: #6B7280;">No reviews yet</p>'
            }
          </div>
        `

        marker.bindPopup(popupContent, {
          closeButton: false,
          className: 'dark-popup',
        })

        marker.on('click', () => {
          onLocationSelect(location)
        })

        marker.addTo(map)
        markersRef.current.set(location.id, marker)
      })
  }, [locations, mapReady, selectedLocation, onLocationSelect])

  // Update selected marker appearance and pan to it
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

  // Pan to first search result
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady || !searchQuery) return

    const matchingLocation = locations.find(
      (loc) =>
        loc.latitude &&
        loc.longitude &&
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (matchingLocation && matchingLocation.latitude && matchingLocation.longitude) {
      mapInstanceRef.current.panTo([matchingLocation.latitude, matchingLocation.longitude], {
        animate: true,
        duration: 0.5,
      })
    }
  }, [searchQuery, locations, mapReady])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden" />

      {/* Map Legend */}
      <div className="absolute bottom-20 left-4 bg-gray-900/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-700 z-[1000]">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Legend</p>
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
              <span className="text-xs font-medium text-gray-200">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Location count */}
      <div className="absolute top-4 right-4 bg-msu-gradient text-white px-4 py-2 rounded-xl shadow-lg z-[1000]">
        <p className="text-sm font-bold">{locations.filter((l) => l.latitude && l.longitude).length} Locations</p>
      </div>

      {/* East Lansing badge */}
      <div className="absolute bottom-4 right-4 bg-gray-900/90 backdrop-blur-sm text-gray-300 px-3 py-1.5 rounded-lg shadow-lg z-[1000] flex items-center gap-2">
        <svg className="w-4 h-4 text-msu-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-xs font-medium">East Lansing, MI</span>
      </div>

      {/* Custom styles for dark popups */}
      <style jsx global>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: #1F2937;
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
          border: 1px solid #374151;
        }
        .dark-popup .leaflet-popup-tip {
          background: #1F2937;
          border: 1px solid #374151;
        }
        .custom-marker {
          background: transparent;
          border: none;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
        }
        .leaflet-control-zoom a {
          background: #1F2937 !important;
          color: #E5E7EB !important;
          border-radius: 8px !important;
          border: 1px solid #374151 !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
        }
        .leaflet-control-zoom a:hover {
          background: #374151 !important;
          color: #fff !important;
        }
        .leaflet-control-zoom-in {
          border-radius: 8px 8px 0 0 !important;
          margin-bottom: 0 !important;
        }
        .leaflet-control-zoom-out {
          border-radius: 0 0 8px 8px !important;
          border-top: none !important;
        }
        .leaflet-container {
          background: #111827;
        }
      `}</style>
    </div>
  )
}
