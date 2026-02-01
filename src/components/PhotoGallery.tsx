'use client'

import { useState, useRef } from 'react'
import type { ProfilePhoto } from '@/types/database'

interface PhotoGalleryProps {
  photos: ProfilePhoto[]
  avatarUrl?: string | null
  isEditing?: boolean
  onAddPhoto?: () => void
  onDeletePhoto?: (photoId: string) => void
  onReorder?: (photos: ProfilePhoto[]) => void
}

export default function PhotoGallery({
  photos,
  avatarUrl,
  isEditing = false,
  onAddPhoto,
  onDeletePhoto,
}: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  // Combine avatar with photos for display
  const allPhotos = [
    ...(avatarUrl ? [{ id: 'avatar', photo_url: avatarUrl, display_order: -1, caption: 'Profile Photo', user_id: '', created_at: '' }] : []),
    ...photos.sort((a, b) => a.display_order - b.display_order),
  ]

  const minSwipeDistance = 50

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return

    const distance = touchStartX.current - touchEndX.current
    const isSwipe = Math.abs(distance) > minSwipeDistance

    if (isSwipe) {
      if (distance > 0) {
        // Swipe left - go to next
        setSelectedIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0))
      } else {
        // Swipe right - go to previous
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1))
      }
    }

    touchStartX.current = null
    touchEndX.current = null
  }

  // Tap on left/right side to navigate (like Instagram stories)
  const handleTapNavigation = (e: React.MouseEvent) => {
    if (isEditing) return // Don't navigate when editing

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width

    if (clickX < width / 3) {
      // Left third - go back
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1))
    } else if (clickX > (width * 2) / 3) {
      // Right third - go forward
      setSelectedIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0))
    } else {
      // Middle - open fullscreen
      setShowFullscreen(true)
    }
  }

  if (allPhotos.length === 0 && !isEditing) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
        <span className="text-4xl">👤</span>
      </div>
    )
  }

  const currentPhoto = allPhotos[selectedIndex]

  return (
    <>
      {/* Main Gallery */}
      <div className="relative">
        {/* Main Photo with swipe support */}
        <div
          className="relative w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-pointer select-none"
          onClick={handleTapNavigation}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {currentPhoto ? (
            <img
              src={currentPhoto.photo_url}
              alt={currentPhoto.caption || 'Photo'}
              className="w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">👤</span>
            </div>
          )}

          {/* Progress bars at top (Instagram-style) */}
          {allPhotos.length > 1 && (
            <div className="absolute top-2 left-2 right-2 flex gap-1">
              {allPhotos.map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-1 rounded-full overflow-hidden bg-white/30"
                >
                  <div
                    className={`h-full bg-white transition-all duration-300 ${
                      idx < selectedIndex ? 'w-full' : idx === selectedIndex ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Photo Counter */}
          {allPhotos.length > 1 && (
            <div className="absolute top-4 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
              {selectedIndex + 1} / {allPhotos.length}
            </div>
          )}

          {/* Tap zones indicator (subtle) */}
          {allPhotos.length > 1 && !isEditing && (
            <>
              <div className="absolute left-0 top-0 bottom-0 w-1/3 flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-sm">
                  ‹
                </div>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-sm">
                  ›
                </div>
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Strip with Edit Controls */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {allPhotos.map((photo, idx) => (
            <div key={photo.id} className="relative flex-shrink-0">
              <button
                onClick={() => setSelectedIndex(idx)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  idx === selectedIndex
                    ? 'border-msu-green shadow-lg scale-105'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={photo.photo_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>

              {/* Delete button on each thumbnail (Edit Mode) */}
              {isEditing && photo.id !== 'avatar' && onDeletePhoto && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeletePhoto(photo.id)
                    if (selectedIndex >= allPhotos.length - 1) {
                      setSelectedIndex(Math.max(0, allPhotos.length - 2))
                    }
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-md"
                >
                  ×
                </button>
              )}

              {/* Avatar badge */}
              {photo.id === 'avatar' && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-msu-green text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                  Main
                </div>
              )}
            </div>
          ))}

          {/* Add Photo Button */}
          {isEditing && onAddPhoto && allPhotos.length < 6 && (
            <button
              onClick={onAddPhoto}
              className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-msu-green hover:text-msu-green transition-colors bg-gray-50"
            >
              <span className="text-2xl">+</span>
            </button>
          )}
        </div>

        {/* Add Photo Button (when no photos) */}
        {isEditing && allPhotos.length === 0 && onAddPhoto && (
          <button
            onClick={onAddPhoto}
            className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-msu-green hover:text-msu-green transition-colors"
          >
            + Add Photos
          </button>
        )}

        {/* Edit mode hint */}
        {isEditing && allPhotos.length > 0 && (
          <p className="text-xs text-gray-400 text-center mt-2">
            Tap × to remove photos • Add up to {6 - allPhotos.length} more
          </p>
        )}
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && currentPhoto && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={() => setShowFullscreen(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
          >
            ×
          </button>

          <img
            src={currentPhoto.photo_url}
            alt={currentPhoto.caption || 'Photo'}
            className="max-w-full max-h-full object-contain pointer-events-none"
            draggable={false}
          />

          {/* Progress bars in fullscreen */}
          {allPhotos.length > 1 && (
            <div className="absolute top-4 left-4 right-16 flex gap-1">
              {allPhotos.map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-1 rounded-full overflow-hidden bg-white/30"
                >
                  <div
                    className={`h-full bg-white transition-all duration-300 ${
                      idx <= selectedIndex ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Caption */}
          {currentPhoto.caption && (
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <p className="inline-block bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                {currentPhoto.caption}
              </p>
            </div>
          )}

          {/* Tap zones for fullscreen navigation */}
          {allPhotos.length > 1 && (
            <>
              <div
                className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1))
                }}
              />
              <div
                className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0))
                }}
              />
            </>
          )}
        </div>
      )}
    </>
  )
}
