'use client'

export const dynamicMode = 'force-dynamic'

import { useEffect, useState } from 'react'
import dynamicImport from 'next/dynamic'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Location, Review, LocationType } from '@/types/database'

// Dynamically import the map component (Leaflet requires window)
const CampusMap = dynamicImport(() => import('@/components/CampusMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-background-elevated rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-msu-green/30 border-t-msu-green rounded-full animate-spin mx-auto mb-4" />
        <p className="text-foreground-muted font-medium">Loading map...</p>
      </div>
    </div>
  ),
})

interface LocationWithReviews extends Location {
  reviews: (Review & { user: Profile })[]
  averageRating: number
  reviewCount: number
}

const LOCATION_TYPES: { value: LocationType | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '🗺️' },
  { value: 'dining', label: 'Dining', emoji: '🍽️' },
  { value: 'library', label: 'Library', emoji: '📚' },
  { value: 'gym', label: 'Gym', emoji: '💪' },
  { value: 'building', label: 'Building', emoji: '🏛️' },
  { value: 'dorm', label: 'Dorm', emoji: '🏠' },
]

function StarRating({
  rating,
  interactive = false,
  onChange,
  size = 'md',
}: {
  rating: number
  interactive?: boolean
  onChange?: (r: number) => void
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onChange?.(star)}
          disabled={!interactive}
          className={`${sizeClasses[size]} ${interactive ? 'cursor-pointer hover:scale-125 transition-transform' : ''}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill={star <= rating ? '#F59E0B' : 'none'}
            stroke={star <= rating ? '#F59E0B' : '#D1D5DB'}
            strokeWidth={1.5}
            className="w-full h-full"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function MapPage() {
  const [locations, setLocations] = useState<LocationWithReviews[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [filter, setFilter] = useState<LocationType | 'all'>('all')
  const [selectedLocation, setSelectedLocation] = useState<LocationWithReviews | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, title: '', content: '' })
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setCurrentUser(profile)

    const { data: locationsData } = await supabase
      .from('locations')
      .select('*')
      .order('name')

    if (locationsData) {
      const { data: reviewsData } = await supabase.from('reviews').select('*')

      const userIds = [...new Set(reviewsData?.map((r) => r.user_id) || [])]
      const { data: users } = await supabase.from('profiles').select('*').in('id', userIds)

      const userMap = new Map(users?.map((u) => [u.id, u]) || [])

      const reviewsByLocation = new Map<string, (Review & { user: Profile })[]>()
      reviewsData?.forEach((review) => {
        const existing = reviewsByLocation.get(review.location_id) || []
        const user = userMap.get(review.user_id)
        if (user) {
          reviewsByLocation.set(review.location_id, [...existing, { ...review, user }])
        }
      })

      const locationsWithReviews: LocationWithReviews[] = locationsData.map((location) => {
        const reviews = reviewsByLocation.get(location.id) || []
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
        return {
          ...location,
          reviews,
          averageRating: reviews.length > 0 ? totalRating / reviews.length : 0,
          reviewCount: reviews.length,
        }
      })

      setLocations(locationsWithReviews)
    }

    setLoading(false)
  }

  const submitReview = async () => {
    if (!selectedLocation || !currentUser || !newReview.rating) return

    setSubmitting(true)

    const { error } = await supabase.from('reviews').upsert({
      user_id: currentUser.id,
      location_id: selectedLocation.id,
      rating: newReview.rating,
      title: newReview.title.trim() || null,
      content: newReview.content.trim() || null,
    })

    if (!error) {
      setNewReview({ rating: 5, title: '', content: '' })
      setShowReviewForm(false)
      fetchData()
    }

    setSubmitting(false)
  }

  // Filter by type and search query
  const filteredLocations = locations.filter((l) => {
    const matchesFilter = filter === 'all' || l.location_type === filter
    const matchesSearch = !searchQuery || l.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-msu-green/30 border-t-msu-green rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground-muted font-medium">Loading campus map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-background overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          selectedLocation ? 'w-full lg:w-96' : 'w-full lg:w-80'
        } flex-shrink-0 bg-background-elevated border-b lg:border-b-0 lg:border-r border-glass-border overflow-hidden transition-all duration-300`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 lg:p-6 border-b border-glass-border">
            <h1 className="text-xl lg:text-2xl font-black text-foreground flex items-center gap-2">
              <span className="text-gradient-primary">Campus Map</span>
              <span className="text-2xl">🗺️</span>
            </h1>
            <p className="text-sm text-foreground-muted mt-1">
              Explore and rate MSU locations
            </p>

            {/* Search Bar */}
            <div className="relative mt-4">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-subtle"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search buildings, dining, dorms..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-glass-border text-foreground placeholder:text-foreground-subtle text-sm focus:outline-none focus:ring-2 focus:ring-msu-green/30 focus:border-msu-green/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle hover:text-foreground"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-glass-border">
            <div className="flex flex-wrap gap-2">
              {LOCATION_TYPES.map((type) => {
                const count =
                  type.value === 'all'
                    ? locations.filter((l) => l.latitude && l.longitude).length
                    : locations.filter((l) => l.location_type === type.value && l.latitude && l.longitude).length
                return (
                  <button
                    key={type.value}
                    onClick={() => setFilter(type.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      filter === type.value
                        ? 'bg-msu-gradient text-white shadow-md'
                        : 'bg-background text-foreground-muted border border-glass-border hover:border-msu-green/30'
                    }`}
                  >
                    <span>{type.emoji}</span>
                    {type.label}
                    <span className="opacity-70">({count})</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Location Card or Location List */}
          <div className="flex-1 overflow-y-auto">
            {selectedLocation ? (
              <div className="p-4 lg:p-6 animate-fade-in">
                {/* Back button */}
                <button
                  onClick={() => {
                    setSelectedLocation(null)
                    setShowReviewForm(false)
                  }}
                  className="flex items-center gap-2 text-foreground-muted hover:text-msu-green transition-colors mb-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-semibold">Back to list</span>
                </button>

                {/* Location Header */}
                <div className="bg-background rounded-2xl p-5 border border-glass-border mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-msu-green/10 flex items-center justify-center text-2xl flex-shrink-0">
                      {LOCATION_TYPES.find((t) => t.value === selectedLocation.location_type)?.emoji || '📍'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-black text-lg text-foreground">{selectedLocation.name}</h2>
                      <p className="text-sm text-foreground-muted capitalize">{selectedLocation.location_type}</p>
                      {selectedLocation.address && (
                        <p className="text-xs text-foreground-subtle mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {selectedLocation.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Rating summary */}
                  <div className="mt-4 pt-4 border-t border-glass-border flex items-center justify-between">
                    {selectedLocation.reviewCount > 0 ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-foreground">
                            {selectedLocation.averageRating.toFixed(1)}
                          </span>
                          <StarRating rating={Math.round(selectedLocation.averageRating)} size="sm" />
                        </div>
                        <span className="text-sm text-foreground-muted">{selectedLocation.reviewCount} reviews</span>
                      </>
                    ) : (
                      <p className="text-sm text-foreground-muted">No reviews yet - be the first!</p>
                    )}
                  </div>
                </div>

                {/* Write Review Button */}
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className={`w-full ${showReviewForm ? 'btn-secondary-prestige' : 'btn-prestige'} mb-4`}
                >
                  {showReviewForm ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Write a Review
                    </>
                  )}
                </button>

                {/* Review Form */}
                {showReviewForm && (
                  <div className="bg-background rounded-2xl p-5 border border-glass-border mb-4 animate-fade-in">
                    <div className="mb-4">
                      <label className="text-label block mb-2">Your Rating</label>
                      <StarRating
                        rating={newReview.rating}
                        interactive
                        onChange={(r) => setNewReview({ ...newReview, rating: r })}
                        size="lg"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="text-label block mb-2">Title (optional)</label>
                      <input
                        type="text"
                        value={newReview.title}
                        onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                        placeholder="Sum up your experience"
                        className="input-prestige"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="text-label block mb-2">Your Review (optional)</label>
                      <textarea
                        value={newReview.content}
                        onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                        placeholder="Share your experience with other Spartans..."
                        className="input-prestige min-h-[80px] resize-none"
                      />
                    </div>

                    <button
                      onClick={submitReview}
                      disabled={submitting}
                      className="btn-prestige w-full disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Submit Review
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Reviews List */}
                <div>
                  <h3 className="text-sm font-black text-foreground-muted uppercase tracking-wider mb-3">
                    Reviews ({selectedLocation.reviewCount})
                  </h3>

                  {selectedLocation.reviews.length === 0 ? (
                    <div className="text-center py-8 bg-background rounded-2xl border border-glass-border">
                      <span className="text-3xl block mb-2">💭</span>
                      <p className="text-sm text-foreground-muted">No reviews yet. Be the first!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedLocation.reviews.map((review) => (
                        <div key={review.id} className="bg-background rounded-xl p-4 border border-glass-border">
                          <div className="flex items-start gap-3">
                            <Link href={`/profile/${review.user.id}`} className="flex-shrink-0 group">
                              <div className="w-9 h-9 rounded-full bg-background-elevated overflow-hidden border border-glass-border group-hover:border-msu-green/50 transition-colors">
                                {review.user.avatar_url ? (
                                  <img src={review.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-sm flex items-center justify-center h-full">👤</span>
                                )}
                              </div>
                            </Link>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <Link
                                  href={`/profile/${review.user.id}`}
                                  className="font-semibold text-sm text-foreground hover:text-msu-green transition-colors truncate"
                                >
                                  {review.user.full_name}
                                </Link>
                                <StarRating rating={review.rating} size="sm" />
                              </div>
                              {review.title && (
                                <p className="font-semibold text-foreground mt-1.5 text-sm">{review.title}</p>
                              )}
                              {review.content && (
                                <p className="text-sm text-foreground-muted mt-1">{review.content}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Location List */
              <div className="p-4">
                <p className="text-xs font-bold text-foreground-muted uppercase tracking-wider mb-3">
                  {filteredLocations.filter((l) => l.latitude && l.longitude).length} Locations on Map
                </p>
                <div className="space-y-2">
                  {filteredLocations
                    .filter((l) => l.latitude && l.longitude)
                    .map((location) => (
                      <button
                        key={location.id}
                        onClick={() => setSelectedLocation(location)}
                        className="w-full text-left p-3 rounded-xl bg-background border border-glass-border hover:border-msu-green/30 hover:bg-background-elevated transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-msu-green/10 flex items-center justify-center text-lg flex-shrink-0">
                            {LOCATION_TYPES.find((t) => t.value === location.location_type)?.emoji || '📍'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm text-foreground group-hover:text-msu-green transition-colors truncate">
                              {location.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              {location.reviewCount > 0 ? (
                                <>
                                  <span className="text-xs font-bold text-amber-500">
                                    {location.averageRating.toFixed(1)}
                                  </span>
                                  <StarRating rating={Math.round(location.averageRating)} size="sm" />
                                </>
                              ) : (
                                <span className="text-xs text-foreground-subtle">No reviews</span>
                              )}
                            </div>
                          </div>
                          <svg
                            className="w-4 h-4 text-foreground-subtle group-hover:text-msu-green transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}

                  {filteredLocations.filter((l) => l.latitude && l.longitude).length === 0 && (
                    <div className="text-center py-8">
                      <span className="text-3xl block mb-2">📍</span>
                      <p className="text-sm text-foreground-muted">No locations with coordinates found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative min-h-[300px] lg:min-h-0">
        <CampusMap
          locations={filteredLocations}
          onLocationSelect={setSelectedLocation}
          selectedLocation={selectedLocation}
          currentUser={currentUser}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  )
}
