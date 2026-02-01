'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile, SpontaneousPost } from '@/types/database'

interface PostWithUser extends SpontaneousPost {
  user: Profile
}

export default function FeedPage() {
  const [posts, setPosts] = useState<PostWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [newPost, setNewPost] = useState('')
  const [locationName, setLocationName] = useState('')
  const [posting, setPosting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get current user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setCurrentUser(profile)

    // Get active posts from friends
    const { data: postsData } = await supabase
      .from('spontaneous_posts')
      .select('*')
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (postsData) {
      // Fetch user profiles for each post
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

    // Set expiration to 4 hours from now
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

    if (diffMins < 60) return `${diffMins}m left`
    const diffHours = Math.floor(diffMins / 60)
    return `${diffHours}h left`
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 relative">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-msu-green/5 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-msu-accent/5 blur-[120px] rounded-full -z-10" />

      <div className="flex justify-between items-end mb-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Live Feed</h1>
          <p className="text-gray-500 font-bold text-sm mt-1">See what your friends are up to</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-prestige !py-2 !px-4 !text-sm"
        >
          {showForm ? 'Cancel' : "+ I'm here!"}
        </button>
      </div>

      {/* Create Post Form */}
      {showForm && (
        <div className="card-prestige !p-6 mb-6 animate-fade-in">
          <h3 className="font-black text-gray-800 mb-4">Share where you are</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Location (e.g., Main Library, IM West)"
              className="input-prestige"
            />
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's happening? Looking for someone to study with?"
              className="input-prestige min-h-[100px] resize-none"
              maxLength={280}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Expires in 4 hours</span>
              <button
                onClick={createPost}
                disabled={!newPost.trim() || posting}
                className="btn-prestige !py-2 !px-6 disabled:opacity-50"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="card-prestige text-center py-16 animate-fade-in">
          <span className="text-6xl block mb-4">📍</span>
          <h3 className="text-xl font-black text-gray-800 mb-2">No one's posted yet</h3>
          <p className="text-gray-500 font-medium">
            Be the first to share where you are!
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {posts.map((post) => (
            <div key={post.id} className="card-prestige !p-5">
              <div className="flex items-start gap-4">
                <Link href={`/profile/${post.user.id}`}>
                  <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                    {post.user.avatar_url ? (
                      <img
                        src={post.user.avatar_url}
                        alt={post.user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl flex items-center justify-center h-full">👤</span>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/profile/${post.user.id}`} className="font-bold text-gray-900 hover:text-msu-green">
                      {post.user.full_name}
                    </Link>
                    {post.location_name && (
                      <span className="text-xs font-bold text-msu-green bg-msu-green/10 px-2 py-0.5 rounded-full">
                        📍 {post.location_name}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mt-2">{post.content}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span>{timeAgo(post.created_at)}</span>
                    <span className="text-orange-500">{expiresIn(post.expires_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
