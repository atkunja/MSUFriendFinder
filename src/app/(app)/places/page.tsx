'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Location, Review, LocationType } from '@/types/database'

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

    // Fetch all locations
    const { data: locationsData } = await supabase
      .from('locations')
      .select('*')
      .order('name')

    if (locationsData) {
      // Fetch all reviews with user profiles
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

  const renderStars = (rating: number, interactive = false, onChange?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onChange?.(star)}
            disabled={!interactive}
            className={`text-xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          >
            {star <= rating ? '⭐' : '☆'}
          </button>
        ))}
      </div>
    )
  }

  const filteredLocations = filter === 'all'
    ? locations
    : locations.filter(l => l.location_type === filter)

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-msu-green/5 blur-[100px] rounded-full -z-10" />

      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Campus Places</h1>
        <p className="text-gray-500 font-bold text-sm mt-1">Rate and review MSU locations</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar animate-fade-in">
        {LOCATION_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setFilter(type.value)}
            className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              filter === type.value
                ? 'bg-msu-green text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {type.emoji} {type.label}
          </button>
        ))}
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
        {filteredLocations.map((location) => {
          const typeInfo = LOCATION_TYPES.find(t => t.value === location.location_type)
          return (
            <div
              key={location.id}
              onClick={() => setSelectedLocation(location)}
              className="card-prestige !p-5 cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-msu-green/10 flex items-center justify-center text-2xl flex-shrink-0">
                  {typeInfo?.emoji || '📍'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{location.name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{location.location_type}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {location.reviewCount > 0 ? (
                      <>
                        <span className="text-yellow-500">{'⭐'.repeat(Math.round(location.averageRating))}</span>
                        <span className="text-sm font-bold text-gray-600">
                          {location.averageRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">({location.reviewCount} reviews)</span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">No reviews yet</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Location Detail Modal */}
      {selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">{selectedLocation.name}</h2>
                  <p className="text-sm text-gray-500 capitalize mt-1">{selectedLocation.location_type}</p>
                  {selectedLocation.address && (
                    <p className="text-xs text-gray-400 mt-1">📍 {selectedLocation.address}</p>
                  )}
                </div>
                <button
                  onClick={() => { setSelectedLocation(null); setShowReviewForm(false); }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="flex items-center gap-4 mt-4">
                {selectedLocation.reviewCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-gray-900">
                      {selectedLocation.averageRating.toFixed(1)}
                    </span>
                    {renderStars(Math.round(selectedLocation.averageRating))}
                  </div>
                )}
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="btn-prestige !py-2 !px-4 !text-sm ml-auto"
                >
                  Write Review
                </button>
              </div>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Your Rating</label>
                    {renderStars(newReview.rating, true, (r) => setNewReview({ ...newReview, rating: r }))}
                  </div>
                  <input
                    type="text"
                    value={newReview.title}
                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                    placeholder="Review title (optional)"
                    className="input-prestige"
                  />
                  <textarea
                    value={newReview.content}
                    onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                    placeholder="Share your experience..."
                    className="input-prestige min-h-[80px] resize-none"
                  />
                  <button
                    onClick={submitReview}
                    disabled={submitting}
                    className="btn-prestige w-full disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="p-6 overflow-y-auto max-h-[300px]">
              {selectedLocation.reviews.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No reviews yet. Be the first!</p>
              ) : (
                <div className="space-y-4">
                  {selectedLocation.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                          {review.user.avatar_url ? (
                            <img src={review.user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm flex items-center justify-center h-full">👤</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">{review.user.full_name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-yellow-500">{'⭐'.repeat(review.rating)}</span>
                          </div>
                        </div>
                      </div>
                      {review.title && <p className="font-bold text-gray-800">{review.title}</p>}
                      {review.content && <p className="text-sm text-gray-600 mt-1">{review.content}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
