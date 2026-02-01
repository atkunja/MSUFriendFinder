'use client'

import { useState } from 'react'
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

  // Combine avatar with photos for display
  const allPhotos = [
    ...(avatarUrl ? [{ id: 'avatar', photo_url: avatarUrl, display_order: -1, caption: 'Profile Photo', user_id: '', created_at: '' }] : []),
    ...photos.sort((a, b) => a.display_order - b.display_order),
  ]

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
        {/* Main Photo */}
        <div
          className="relative w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-pointer"
          onClick={() => setShowFullscreen(true)}
        >
          {currentPhoto ? (
            <img
              src={currentPhoto.photo_url}
              alt={currentPhoto.caption || 'Photo'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">👤</span>
            </div>
          )}

          {/* Photo Counter */}
          {allPhotos.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
              {selectedIndex + 1} / {allPhotos.length}
            </div>
          )}

          {/* Navigation Arrows */}
          {allPhotos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1))
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-colors shadow-lg"
              >
                ←
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0))
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-colors shadow-lg"
              >
                →
              </button>
            </>
          )}

          {/* Delete Button (Edit Mode) */}
          {isEditing && currentPhoto && currentPhoto.id !== 'avatar' && onDeletePhoto && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeletePhoto(currentPhoto.id)
                setSelectedIndex(Math.max(0, selectedIndex - 1))
              }}
              className="absolute top-3 left-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
            >
              ×
            </button>
          )}
        </div>

        {/* Dot Indicators */}
        {allPhotos.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {allPhotos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === selectedIndex
                    ? 'bg-msu-green w-4'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}

        {/* Thumbnail Strip */}
        {allPhotos.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {allPhotos.map((photo, idx) => (
              <button
                key={photo.id}
                onClick={() => setSelectedIndex(idx)}
                className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  idx === selectedIndex
                    ? 'border-msu-green shadow-lg'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={photo.photo_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            {isEditing && onAddPhoto && allPhotos.length < 6 && (
              <button
                onClick={onAddPhoto}
                className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-msu-green hover:text-msu-green transition-colors"
              >
                +
              </button>
            )}
          </div>
        )}

        {/* Add Photo Button (when no photos) */}
        {isEditing && allPhotos.length === 0 && onAddPhoto && (
          <button
            onClick={onAddPhoto}
            className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-msu-green hover:text-msu-green transition-colors"
          >
            + Add Photos
          </button>
        )}
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && currentPhoto && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={() => setShowFullscreen(false)}
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
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Caption */}
          {currentPhoto.caption && (
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <p className="inline-block bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                {currentPhoto.caption}
              </p>
            </div>
          )}

          {/* Navigation */}
          {allPhotos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1))
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                ←
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0))
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                →
              </button>
            </>
          )}

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full">
            {selectedIndex + 1} / {allPhotos.length}
          </div>
        </div>
      )}
    </>
  )
}
