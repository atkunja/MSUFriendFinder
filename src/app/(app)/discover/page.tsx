'use client'

// Force dynamic rendering - this page uses Supabase which requires runtime env vars
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { calculateMatchScore } from '@/lib/matchScore'
import type { Profile, FriendRequest } from '@/types/database'

/* =======================================================================
   SPARTANFINDER DISCOVER PAGE
   Premium profile browsing with enhanced cards and animations
   ======================================================================= */

interface ProfileWithMatch extends Profile {
  matchScore: number
  matchReasons: string[]
  requestStatus?: 'pending' | 'sent' | null
}

const INTERESTS_FILTER = [
  'Basketball', 'Soccer', 'Football', 'Gaming', 'Music', 'Movies',
  'Reading', 'Hiking', 'Cooking', 'Photography', 'Fitness', 'Coding'
]

const YEARS_FILTER = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Grad']

// Match score tier helper
function getMatchTier(score: number): 'high' | 'medium' | 'low' {
  if (score >= 60) return 'high'
  if (score >= 30) return 'medium'
  return 'low'
}

// Loading skeleton component
function ProfileCardSkeleton() {
  return (
    <div className="card-profile !p-0 overflow-hidden">
      <div className="h-28 skeleton rounded-b-none" />
      <div className="px-6 pb-6 pt-14">
        <div className="flex justify-between items-start -mt-16 mb-5">
          <div className="skeleton-avatar border-4 border-background-elevated rounded-2xl" />
          <div className="w-16 h-14 skeleton rounded-xl mt-6" />
        </div>
        <div className="skeleton-text w-2/3 mb-2" />
        <div className="skeleton-text-sm w-1/2 mb-4" />
        <div className="skeleton-text-sm w-full mb-2" />
        <div className="skeleton-text-sm w-4/5 mb-6" />
        <div className="flex gap-3">
          <div className="flex-1 h-12 skeleton rounded-xl" />
          <div className="w-20 h-12 skeleton rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// Empty state component
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-20 card-prestige !bg-background-elevated/50 !border-dashed !border-2 animate-fade-in">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-msu-green/5 flex items-center justify-center">
        <span className="text-4xl opacity-50">🔍</span>
      </div>
      <h3 className="text-heading text-lg mb-2 text-foreground">
        No Matches Found
      </h3>
      <p className="text-body-sm max-w-sm mx-auto mb-6">
        We couldn&apos;t find any Spartans matching your current filters.
        Try adjusting your preferences.
      </p>
      <button
        onClick={onReset}
        className="btn-secondary-prestige !px-6"
      >
        Clear All Filters
      </button>
    </div>
  )
}

// Profile Card Component
function ProfileCard({
  profile,
  index,
  sending,
  onConnect
}: {
  profile: ProfileWithMatch
  index: number
  sending: string | null
  onConnect: (id: string) => void
}) {
  const matchTier = getMatchTier(profile.matchScore)

  return (
    <div
      className={`card-profile !p-0 overflow-hidden group animate-fade-in reveal-delay-${(index % 3) + 1}`}
    >
      {/* Header Gradient */}
      <div className="relative h-28 bg-msu-gradient overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-2xl translate-x-8 translate-y-8" />
        <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-gold/10 blur-2xl -translate-x-8 -translate-y-8" />
      </div>

      {/* Card Body */}
      <div className="px-6 pb-6 relative">
        {/* Avatar & Match Score Row */}
        <div className="flex justify-between items-end -mt-14 mb-5">
          {/* Avatar */}
          <div className="relative">
            <div className="avatar-prestige w-24 h-24 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-msu-green/10 flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
              )}
            </div>
            <div className="avatar-status online" title="Online recently" />
          </div>

          {/* Match Score Badge */}
          <div className="badge-match mt-4 group-hover:shadow-lg transition-shadow">
            <span className={`badge-match-score ${matchTier}`}>
              {profile.matchScore}%
            </span>
            <span className="badge-match-label">Match</span>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mb-4">
          <Link href={`/profile/${profile.id}`} className="group/name">
            <h3 className="font-display text-xl font-semibold text-foreground group-hover/name:text-msu-green transition-colors leading-tight">
              {profile.full_name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {profile.pronouns && (
              <span className="text-label text-msu-green bg-msu-green/5 px-2 py-0.5 rounded text-[10px]">
                {profile.pronouns}
              </span>
            )}
            <span className="text-body-sm text-sm">
              {profile.major && profile.year
                ? `${profile.major} • ${profile.year}`
                : profile.major || profile.year || 'MSU Student'}
            </span>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-body-sm italic line-clamp-2 mb-4 text-foreground-muted">
            &ldquo;{profile.bio}&rdquo;
          </p>
        )}

        {/* Match Reasons */}
        {profile.matchReasons.length > 0 && (
          <div className="space-y-2 mb-5">
            {profile.matchReasons.slice(0, 2).map((reason, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[11px] font-semibold text-msu-green-light uppercase tracking-tight bg-msu-green/5 px-3 py-1.5 rounded-lg border border-msu-green/5"
              >
                <span className="text-gold">✦</span>
                {reason}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {profile.requestStatus === 'sent' ? (
            <button
              disabled
              className="flex-1 btn-secondary-prestige !bg-msu-green/5 !text-foreground-subtle !border-transparent cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pending
            </button>
          ) : profile.requestStatus === 'pending' ? (
            <Link href="/requests" className="flex-1 btn-prestige">
              View Request
            </Link>
          ) : (
            <button
              onClick={() => onConnect(profile.id)}
              disabled={sending === profile.id}
              className="flex-1 btn-prestige"
            >
              {sending === profile.id ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Connect
                </>
              )}
            </button>
          )}
          <Link
            href={`/profile/${profile.id}`}
            className="btn-secondary-prestige !px-4"
            title="View full profile"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function DiscoverPage() {
  const [profiles, setProfiles] = useState<ProfileWithMatch[]>([])
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    year: '',
    interests: [] as string[],
  })
  const [showFilters, setShowFilters] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch current user profile
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single() as { data: Profile | null }

    if (!currentProfile) {
      window.location.href = '/onboarding'
      return
    }

    setCurrentUser(currentProfile)

    // Fetch all other profiles
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id)
      .order('updated_at', { ascending: false })
      .limit(50) as { data: Profile[] | null }

    // Fetch existing friend requests
    const { data: sentRequests } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('from_user', user.id) as { data: FriendRequest[] | null }

    const { data: receivedRequests } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('to_user', user.id) as { data: FriendRequest[] | null }

    // Fetch friendships
    const { data: friendshipsA } = await supabase
      .from('friendships')
      .select('user_a, user_b')
      .eq('user_a', user.id) as { data: { user_a: string; user_b: string }[] | null }

    const { data: friendshipsB } = await supabase
      .from('friendships')
      .select('user_a, user_b')
      .eq('user_b', user.id) as { data: { user_a: string; user_b: string }[] | null }

    const allFriendships = [...(friendshipsA || []), ...(friendshipsB || [])]
    const friendIds = new Set(
      allFriendships.map((f) =>
        f.user_a === user.id ? f.user_b : f.user_a
      )
    )

    const sentMap = new Map(
      sentRequests?.map((r) => [r.to_user, r.status]) || []
    )
    const receivedMap = new Map(
      receivedRequests?.map((r) => [r.from_user, r.status]) || []
    )

    // Calculate match scores and filter out friends
    const profilesWithMatch: ProfileWithMatch[] = (allProfiles || [])
      .filter((p) => !friendIds.has(p.id))
      .map((profile) => {
        const match = calculateMatchScore(currentProfile, profile)
        let requestStatus: 'pending' | 'sent' | null = null

        if (sentMap.get(profile.id) === 'pending') {
          requestStatus = 'sent'
        } else if (receivedMap.get(profile.id) === 'pending') {
          requestStatus = 'pending'
        }

        return {
          ...profile,
          matchScore: match.score,
          matchReasons: match.reasons,
          requestStatus,
        }
      })
      .sort((a, b) => b.matchScore - a.matchScore)

    setProfiles(profilesWithMatch)
    setLoading(false)
  }

  const filteredProfiles = profiles.filter((profile) => {
    if (filters.year && profile.year !== filters.year) return false
    if (filters.interests.length > 0) {
      const hasInterest = filters.interests.some((i) =>
        profile.interests.includes(i)
      )
      if (!hasInterest) return false
    }
    return true
  })

  const sendFriendRequest = async (toUserId: string, note?: string) => {
    setSending(toUserId)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('friend_requests')
      .insert({
        from_user: user.id,
        to_user: toUserId,
        note: note || null,
      })

    if (!error) {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === toUserId ? { ...p, requestStatus: 'sent' } : p
        )
      )
    }

    setSending(null)
  }

  const resetFilters = () => {
    setFilters({ year: '', interests: [] })
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="skeleton-text w-64 h-10 mb-2" />
          <div className="skeleton-text-sm w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProfileCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Grain Overlay */}
      <div className="grain-overlay" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 animate-fade-in">
        <div>
          <h1 className="text-display text-3xl md:text-4xl text-foreground tracking-tight">
            Discover <span className="text-gradient-primary">Spartans</span>
          </h1>
          <p className="text-body-sm mt-1">
            Found <span className="font-mono font-semibold text-msu-green">{filteredProfiles.length}</span> potential matches for you
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary-prestige !px-5 ${showFilters ? '!bg-msu-green/10 !border-msu-green/30' : ''}`}
        >
          {showFilters ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Hide Filters
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter Results
            </>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card-prestige !p-8 mb-10 animate-fade-in-scale !bg-background-elevated/70">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Year Filter */}
            <div>
              <label className="text-label block mb-4">
                Academic Year
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters({ ...filters, year: '' })}
                  className={!filters.year ? 'chip-prestige chip-prestige-active' : 'chip-prestige'}
                >
                  All Years
                </button>
                {YEARS_FILTER.map((year) => (
                  <button
                    key={year}
                    onClick={() => setFilters({ ...filters, year })}
                    className={filters.year === year ? 'chip-prestige chip-prestige-active' : 'chip-prestige'}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Interests Filter */}
            <div>
              <label className="text-label block mb-4">
                Interests & Activities
              </label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS_FILTER.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        interests: prev.interests.includes(interest)
                          ? prev.interests.filter((i) => i !== interest)
                          : [...prev.interests, interest],
                      }))
                    }}
                    className={
                      filters.interests.includes(interest)
                        ? 'chip-prestige chip-prestige-active'
                        : 'chip-prestige'
                    }
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="mt-8 pt-6 border-t border-glass-border flex justify-between items-center">
            <span className="text-body-sm">
              {filters.year || filters.interests.length > 0 ? (
                <>
                  <span className="font-mono font-semibold text-msu-green">{filteredProfiles.length}</span> results
                </>
              ) : (
                'No filters applied'
              )}
            </span>
            <button
              onClick={resetFilters}
              className="btn-ghost text-sm"
            >
              Reset All
            </button>
          </div>
        </div>
      )}

      {/* Profile Grid or Empty State */}
      {filteredProfiles.length === 0 ? (
        <EmptyState onReset={resetFilters} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile, idx) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              index={idx}
              sending={sending}
              onConnect={sendFriendRequest}
            />
          ))}
        </div>
      )}
    </div>
  )
}
