'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Location, Review, LocationType } from '@/types/database'

interface LocationWithReviews extends Location {
  reviews: (Review & { user: Profile })[]
  averageRating: number
  reviewCount: number
}

const LOCATION_TYPES: { value: LocationType | 'all'; label: string; emoji: string; gradient: string }[] = [
  { value: 'all', label: 'All Places', emoji: '🗺️', gradient: 'from-msu-green to-msu-green-light' },
  { value: 'dining', label: 'Dining', emoji: '🍽️', gradient: 'from-orange-500 to-amber-500' },
  { value: 'library', label: 'Library', emoji: '📚', gradient: 'from-blue-500 to-indigo-500' },
  { value: 'gym', label: 'Gym', emoji: '💪', gradient: 'from-red-500 to-rose-500' },
  { value: 'building', label: 'Building', emoji: '🏛️', gradient: 'from-slate-500 to-gray-600' },
  { value: 'dorm', label: 'Dorm', emoji: '🏠', gradient: 'from-green-500 to-emerald-500' },
]

function PlaceCardSkeleton() {
  return (
    <div className="card-prestige !p-0 overflow-hidden">
      <div className="h-24 skeleton rounded-b-none" />
      <div className="p-5">
        <div className="skeleton-text w-3/4 mb-2" />
        <div className="skeleton-text-sm w-1/2 mb-3" />
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-5 h-5 skeleton rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}

function StarRating({
  rating,
  interactive = false,
  onChange,
  size = 'md'
}: {
  rating: number
  interactive?: boolean
  onChange?: (r: number) => void
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

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
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function PlacesPage() {
  const [locations, setLocations] = useState<LocationWithReviews[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [filter, setFilter] = useState<LocationType | 'all'>('all')
  const [selectedLocation, setSelectedLocation] = useState<LocationWithReviews | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, title: '', content: '' })
  const [submitting, setSubmitting] = useState(false)
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
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')

      const userIds = [...new Set(reviewsData?.map(r => r.user_id) || [])]
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)

      const userMap = new Map(users?.map(u => [u.id, u]) || [])

      const reviewsByLocation = new Map<string, (Review & { user: Profile })[]>()
      reviewsData?.forEach(review => {
        const existing = reviewsByLocation.get(review.location_id) || []
        const user = userMap.get(review.user_id)
        if (user) {
          reviewsByLocation.set(review.location_id, [...existing, { ...review, user }])
        }
      })

      const locationsWithReviews: LocationWithReviews[] = locationsData.map(location => {
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

  const filteredLocations = filter === 'all'
    ? locations
    : locations.filter(l => l.location_type === filter)

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="skeleton-text w-56 h-10 mb-2" />
          <div className="skeleton-text-sm w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => <PlaceCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 relative">
      {/* Grain Overlay */}
      <div className="grain-overlay" />

      {/* Background accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-msu-green/5 blur-[150px] rounded-full -z-10" />

      {/* Header */}
      <div className="mb-10 animate-fade-in">
        <h1 className="text-display text-3xl md:text-4xl text-foreground tracking-tight">
          Campus <span className="text-gradient-gold">Places</span>
        </h1>
        <p className="text-body-sm mt-2">
          Discover and rate the best spots at MSU
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar animate-fade-in">
        {LOCATION_TYPES.map((type) => {
          const count = type.value === 'all' ? locations.length : locations.filter(l => l.location_type === type.value).length
          return (
            <button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                filter === type.value
                  ? `bg-gradient-to-r ${type.gradient} text-white shadow-lg`
                  : 'bg-background-elevated text-foreground-muted border border-glass-border hover:border-glass-border-hover'
              }`}
            >
              <span>{type.emoji}</span>
              {type.label}
              <span className="text-xs opacity-70">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Locations Grid */}
      {filteredLocations.length === 0 ? (
        <div className="card-prestige !bg-background-elevated/50 !border-dashed !border-2 text-center py-16 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gold/5 flex items-center justify-center">
            <span className="text-4xl">📍</span>
          </div>
          <h3 className="text-heading text-xl mb-2 text-foreground">No Places Found</h3>
          <p className="text-body-sm max-w-sm mx-auto">
            No locations match this filter. Try selecting a different category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLocations.map((location, idx) => {
            const typeInfo = LOCATION_TYPES.find(t => t.value === location.location_type)

            return (
              <div
                key={location.id}
                onClick={() => setSelectedLocation(location)}
                className={`card-profile !p-0 cursor-pointer group animate-fade-in reveal-delay-${(idx % 3) + 1}`}
              >
                {/* Header gradient */}
                <div className={`h-20 bg-gradient-to-r ${typeInfo?.gradient || 'from-msu-green to-msu-green-light'} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                  <div className="absolute top-3 right-3 text-3xl opacity-80">{typeInfo?.emoji}</div>
                </div>

                <div className="p-5">
                  <h3 className="text-heading text-base text-foreground leading-tight group-hover:text-msu-green transition-colors">
                    {location.name}
                  </h3>
                  <p className="text-label text-xs mt-1 capitalize">{location.location_type}</p>

                  <div className="flex items-center justify-between mt-4">
                    {location.reviewCount > 0 ? (
                      <div className="flex items-center gap-2">
                        <StarRating rating={Math.round(location.averageRating)} size="sm" />
                        <span className="text-sm font-bold text-foreground">{location.averageRating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-body-sm text-xs">No reviews yet</span>
                    )}
                    <span className="text-label text-xs">{location.reviewCount} reviews</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Location Detail Modal */}
      {selectedLocation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => { setSelectedLocation(null); setShowReviewForm(false) }}
        >
          <div
            className="bg-background-elevated rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden animate-fade-in-scale"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`h-24 bg-gradient-to-r ${LOCATION_TYPES.find(t => t.value === selectedLocation.location_type)?.gradient || 'from-msu-green to-msu-green-light'} relative`}>
              <div className="absolute inset-0 bg-black/10" />
              <button
                onClick={() => { setSelectedLocation(null); setShowReviewForm(false) }}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-2xl bg-background-elevated shadow-xl flex items-center justify-center text-3xl border-4 border-background-elevated">
                {LOCATION_TYPES.find(t => t.value === selectedLocation.location_type)?.emoji || '📍'}
              </div>
            </div>

            {/* Modal Content */}
            <div className="pt-12 px-6 pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-heading text-xl text-foreground">{selectedLocation.name}</h2>
                  <p className="text-label text-sm mt-1 capitalize">{selectedLocation.location_type}</p>
                  {selectedLocation.address && (
                    <p className="text-body-sm text-xs mt-2 flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {selectedLocation.address}
                    </p>
                  )}
                </div>

                {selectedLocation.reviewCount > 0 && (
                  <div className="text-right">
                    <div className="text-3xl font-black text-foreground">{selectedLocation.averageRating.toFixed(1)}</div>
                    <StarRating rating={Math.round(selectedLocation.averageRating)} size="sm" />
                    <p className="text-label text-xs mt-1">{selectedLocation.reviewCount} reviews</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className={`w-full mt-6 ${showReviewForm ? 'btn-secondary-prestige' : 'btn-prestige'}`}
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
                <div className="mt-6 p-5 bg-background rounded-2xl border border-glass-border animate-fade-in">
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
                      className="input-prestige min-h-[100px] resize-none"
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
              <div className="mt-6 max-h-[250px] overflow-y-auto">
                {selectedLocation.reviews.length === 0 ? (
                  <div className="text-center py-8 bg-background rounded-2xl border border-glass-border">
                    <span className="text-3xl block mb-2">💭</span>
                    <p className="text-body-sm">No reviews yet. Be the first to share your experience!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedLocation.reviews.map((review) => (
                      <div key={review.id} className="bg-background rounded-2xl p-4 border border-glass-border">
                        <div className="flex items-start gap-3">
                          <Link href={`/profile/${review.user.id}`} className="flex-shrink-0 group">
                            <div className="w-10 h-10 rounded-full bg-background-elevated overflow-hidden border border-glass-border group-hover:border-msu-green/50 transition-colors">
                              {review.user.avatar_url ? (
                                <img src={review.user.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm flex items-center justify-center h-full">👤</span>
                              )}
                            </div>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <Link href={`/profile/${review.user.id}`} className="font-semibold text-sm text-foreground hover:text-msu-green transition-colors">
                                {review.user.full_name}
                              </Link>
                              <StarRating rating={review.rating} size="sm" />
                            </div>
                            {review.title && (
                              <p className="font-semibold text-foreground mt-2">{review.title}</p>
                            )}
                            {review.content && (
                              <p className="text-body-sm mt-1">{review.content}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
