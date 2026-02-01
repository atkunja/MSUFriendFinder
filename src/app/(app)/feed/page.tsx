'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile, SpontaneousPost } from '@/types/database'

interface PostWithUser extends SpontaneousPost {
  user: Profile
}

function PostCardSkeleton() {
  return (
    <div className="card-prestige !p-0 overflow-hidden">
      <div className="h-1.5 skeleton rounded-none" />
      <div className="p-5">
        <div className="flex gap-4">
          <div className="w-12 h-12 skeleton rounded-full" />
          <div className="flex-1">
            <div className="skeleton-text w-32 mb-2" />
            <div className="skeleton-text-sm w-full mb-1" />
            <div className="skeleton-text-sm w-3/4" />
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="card-prestige !bg-background-elevated/50 !border-dashed !border-2 text-center py-16 animate-fade-in">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-msu-green/5 flex items-center justify-center">
        <span className="text-4xl">📍</span>
      </div>
      <h3 className="text-heading text-xl mb-2 text-foreground">No Active Posts</h3>
      <p className="text-body-sm max-w-sm mx-auto mb-6">
        The feed is quiet right now. Share where you are and what you&apos;re up to!
      </p>
      <button onClick={onCreateClick} className="btn-prestige !px-8">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Share Your Location
      </button>
    </div>
  )
}

export default function FeedPage() {
  const [posts, setPosts] = useState<PostWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [newPost, setNewPost] = useState('')
  const [locationName, setLocationName] = useState('')
  const [posting, setPosting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [deletingPost, setDeletingPost] = useState<string | null>(null)
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

    const { data: postsData } = await supabase
      .from('spontaneous_posts')
      .select('*')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (postsData) {
      const userIds = [...new Set(postsData.map(p => p.user_id))]
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)

      const userMap = new Map(users?.map(u => [u.id, u]) || [])

      const postsWithUsers = postsData
        .map(post => ({
          ...post,
          user: userMap.get(post.user_id) as Profile
        }))
        .filter(p => p.user)

      setPosts(postsWithUsers)
    }

    setLoading(false)
  }

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('feed-posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'spontaneous_posts',
        },
        () => fetchData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const createPost = async () => {
    if (!newPost.trim() || !currentUser) return

    setPosting(true)

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 4)

    const { error } = await supabase.from('spontaneous_posts').insert({
      user_id: currentUser.id,
      content: newPost.trim(),
      location_name: locationName.trim() || null,
      expires_at: expiresAt.toISOString(),
    })

    if (!error) {
      setNewPost('')
      setLocationName('')
      setShowForm(false)
      fetchData()
    }

    setPosting(false)
  }

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  const expiresIn = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Expiring soon'
    if (diffMins < 60) return `${diffMins}m left`
    const diffHours = Math.floor(diffMins / 60)
    return `${diffHours}h left`
  }

  const getExpiryUrgency = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 30) return 'text-red-500 bg-red-50'
    if (diffMins < 60) return 'text-orange-500 bg-orange-50'
    return 'text-amber-600 bg-amber-50'
  }

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return

    setDeletingPost(postId)
    const { error } = await supabase
      .from('spontaneous_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', currentUser?.id)

    if (!error) {
      setPosts(posts.filter(p => p.id !== postId))
    }
    setDeletingPost(null)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="skeleton-text w-40 h-10 mb-2" />
          <div className="skeleton-text-sm w-56" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <PostCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 relative">
      {/* Grain Overlay */}
      <div className="grain-overlay" />

      {/* Background accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-msu-green/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 blur-[150px] rounded-full -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 animate-fade-in">
        <div>
          <h1 className="text-display text-3xl md:text-4xl text-foreground tracking-tight">
            Live <span className="text-gradient-primary">Feed</span>
          </h1>
          <p className="text-body-sm mt-2">
            {posts.length > 0 ? (
              <>
                <span className="font-mono font-semibold text-msu-green">{posts.length}</span> active posts nearby
              </>
            ) : (
              'See what Spartans are up to right now'
            )}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={showForm ? 'btn-secondary-prestige' : 'btn-prestige'}
        >
          {showForm ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              I&apos;m Here!
            </>
          )}
        </button>
      </div>

      {/* Create Post Form */}
      {showForm && (
        <div className="card-prestige !p-8 mb-8 animate-fade-in-scale">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-msu-gradient flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-heading text-lg text-foreground">Share Your Location</h3>
              <p className="text-body-sm text-sm">Let others know where you are</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-label block mb-2">Location</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-subtle">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Main Library, IM West, Sparty..."
                  className="input-prestige !pl-12"
                />
              </div>
            </div>

            <div>
              <label className="text-label block mb-2">What&apos;s happening?</label>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Looking for a study buddy? Grabbing coffee? Share what you're up to..."
                className="input-prestige min-h-[120px] resize-none"
                maxLength={280}
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-foreground-subtle">
                  {280 - newPost.length} characters remaining
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Expires in 4 hours
              </div>
              <button
                onClick={createPost}
                disabled={!newPost.trim() || posting}
                className="btn-prestige disabled:opacity-50"
              >
                {posting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts */}
      {posts.length === 0 ? (
        <EmptyState onCreateClick={() => setShowForm(true)} />
      ) : (
        <div className="space-y-4">
          {posts.map((post, idx) => {
            const isOwnPost = currentUser && post.user_id === currentUser.id

            return (
              <div
                key={post.id}
                className={`card-prestige !p-0 overflow-hidden group animate-fade-in reveal-delay-${(idx % 3) + 1}`}
              >
                {/* Accent bar */}
                <div className="h-1 bg-gradient-to-r from-msu-green to-msu-green-light" />

                <div className="p-5">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <Link href={`/profile/${post.user.id}`} className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-background overflow-hidden border-2 border-background-elevated shadow-md group-hover:border-msu-green/30 transition-colors">
                          {post.user.avatar_url ? (
                            <img
                              src={post.user.avatar_url}
                              alt={post.user.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xl flex items-center justify-center h-full bg-msu-green/5">👤</span>
                          )}
                        </div>
                        {/* Online indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-background-elevated rounded-full" />
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <Link
                            href={`/profile/${post.user.id}`}
                            className="font-bold text-foreground hover:text-msu-green transition-colors truncate"
                          >
                            {post.user.full_name}
                          </Link>
                          {isOwnPost && (
                            <span className="text-[10px] font-bold text-msu-green bg-msu-green/10 px-2 py-0.5 rounded-full uppercase">
                              You
                            </span>
                          )}
                        </div>

                        {/* Delete button */}
                        {isOwnPost && (
                          <button
                            onClick={() => deletePost(post.id)}
                            disabled={deletingPost === post.id}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-foreground-subtle
                                     hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100
                                     disabled:opacity-50"
                            title="Delete post"
                          >
                            {deletingPost === post.id ? (
                              <span className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Location badge */}
                      {post.location_name && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <svg className="w-4 h-4 text-msu-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span className="text-sm font-semibold text-msu-green">
                            {post.location_name}
                          </span>
                        </div>
                      )}

                      {/* Post content */}
                      <p className="text-foreground-muted leading-relaxed">
                        {post.content}
                      </p>

                      {/* Meta info */}
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-glass-border">
                        <span className="text-xs text-foreground-subtle flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {timeAgo(post.created_at)}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${getExpiryUrgency(post.expires_at)}`}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {expiresIn(post.expires_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info banner */}
      {posts.length > 0 && (
        <div className="mt-8 p-4 rounded-2xl bg-msu-green/5 border border-msu-green/10 animate-fade-in">
          <p className="text-sm text-foreground-muted text-center">
            <span className="font-semibold text-msu-green">Tip:</span> Posts automatically expire after 4 hours to keep the feed fresh and relevant.
          </p>
        </div>
      )}
    </div>
  )
}
