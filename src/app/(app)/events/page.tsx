'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Event, EventAttendee, EventType } from '@/types/database'

interface EventWithDetails extends Event {
  creator: Profile
  attendeeCount: number
  userStatus: 'going' | 'interested' | 'maybe' | null
}

const EVENT_TYPES: { value: EventType; label: string; emoji: string; color: string }[] = [
  { value: 'campus', label: 'Campus', emoji: '🏫', color: 'from-blue-500 to-blue-600' },
  { value: 'social', label: 'Social', emoji: '🎉', color: 'from-pink-500 to-rose-500' },
  { value: 'academic', label: 'Academic', emoji: '📚', color: 'from-amber-500 to-orange-500' },
  { value: 'sports', label: 'Sports', emoji: '🏀', color: 'from-green-500 to-emerald-500' },
  { value: 'club', label: 'Club', emoji: '🎭', color: 'from-purple-500 to-violet-500' },
]

function EventCardSkeleton() {
  return (
    <div className="card-prestige !p-0 overflow-hidden">
      <div className="h-2 skeleton rounded-none" />
      <div className="p-6">
        <div className="flex gap-4">
          <div className="w-16 h-16 skeleton rounded-2xl" />
          <div className="flex-1">
            <div className="skeleton-text w-3/4 mb-2" />
            <div className="skeleton-text-sm w-1/2" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <div className="skeleton h-9 w-24 rounded-xl" />
          <div className="skeleton h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="card-prestige !bg-background-elevated/50 !border-dashed !border-2 text-center py-16 animate-fade-in">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-msu-green/5 flex items-center justify-center">
        <span className="text-4xl">📅</span>
      </div>
      <h3 className="text-heading text-xl mb-2 text-foreground">No Upcoming Events</h3>
      <p className="text-body-sm max-w-sm mx-auto mb-6">
        Be the first to create an event and bring Spartans together!
      </p>
      <button onClick={onCreateClick} className="btn-prestige !px-8">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Create First Event
      </button>
    </div>
  )
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<EventType | 'all'>('all')
  const [creating, setCreating] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    start_time: '',
    event_type: 'social' as EventType,
  })
  const [error, setError] = useState<string | null>(null)
  const [deletingEvent, setDeletingEvent] = useState<string | null>(null)
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

    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })

    if (eventsData) {
      const creatorIds = [...new Set(eventsData.map(e => e.creator_id))]
      const { data: creators } = await supabase
        .from('profiles')
        .select('*')
        .in('id', creatorIds)

      const creatorMap = new Map(creators?.map(c => [c.id, c]) || [])

      const eventIds = eventsData.map(e => e.id)
      const { data: attendees } = await supabase
        .from('event_attendees')
        .select('*')
        .in('event_id', eventIds)

      const attendeesByEvent = new Map<string, EventAttendee[]>()
      attendees?.forEach(a => {
        const existing = attendeesByEvent.get(a.event_id) || []
        attendeesByEvent.set(a.event_id, [...existing, a])
      })

      const eventsWithDetails: EventWithDetails[] = eventsData.map(event => {
        const eventAttendees = attendeesByEvent.get(event.id) || []
        const userAttendee = eventAttendees.find(a => a.user_id === user.id)

        return {
          ...event,
          creator: creatorMap.get(event.creator_id) as Profile,
          attendeeCount: eventAttendees.filter(a => a.status === 'going').length,
          userStatus: userAttendee?.status || null,
        }
      }).filter(e => e.creator)

      setEvents(eventsWithDetails)
    }

    setLoading(false)
  }

  const createEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.start_time || !currentUser) return

    setCreating(true)
    setError(null)

    const { error: insertError } = await supabase.from('events').insert({
      creator_id: currentUser.id,
      title: newEvent.title.trim(),
      description: newEvent.description.trim() || null,
      location: newEvent.location.trim() || null,
      start_time: new Date(newEvent.start_time).toISOString(),
      event_type: newEvent.event_type,
    })

    if (insertError) {
      setError(`Failed to create event: ${insertError.message}`)
      setCreating(false)
      return
    }

    setNewEvent({ title: '', description: '', location: '', start_time: '', event_type: 'social' })
    setShowForm(false)
    fetchData()
    setCreating(false)
  }

  const updateAttendance = async (eventId: string, status: 'going' | 'interested' | 'maybe' | null) => {
    if (!currentUser) return

    setError(null)

    if (status === null) {
      const { error: deleteError } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', currentUser.id)

      if (deleteError) {
        setError(`Failed to update: ${deleteError.message}`)
        return
      }
    } else {
      const { error: upsertError } = await supabase
        .from('event_attendees')
        .upsert({
          event_id: eventId,
          user_id: currentUser.id,
          status,
        })

      if (upsertError) {
        setError(`Failed to update: ${upsertError.message}`)
        return
      }
    }

    fetchData()
  }

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Delete this event? This cannot be undone.')) return

    setDeletingEvent(eventId)
    setError(null)

    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('creator_id', currentUser?.id)

    if (deleteError) {
      setError(`Failed to delete: ${deleteError.message}`)
    } else {
      setEvents(events.filter(e => e.id !== eventId))
    }
    setDeletingEvent(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === now.toDateString()) {
      return { day: 'Today', time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return { day: 'Tomorrow', time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    } else {
      return {
        day: date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    }
  }

  const filteredEvents = filter === 'all' ? events : events.filter(e => e.event_type === filter)

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="skeleton-text w-48 h-10 mb-2" />
          <div className="skeleton-text-sm w-64" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <EventCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative">
      {/* Grain Overlay */}
      <div className="grain-overlay" />

      {/* Background accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-msu-green/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/5 blur-[150px] rounded-full -z-10" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 animate-fade-in">
        <div>
          <h1 className="text-display text-3xl md:text-4xl text-foreground tracking-tight">
            Campus <span className="text-gradient-primary">Events</span>
          </h1>
          <p className="text-body-sm mt-2">
            Discover what&apos;s happening around MSU
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Event
            </>
          )}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert-error-prestige">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="card-prestige !p-8 mb-8 animate-fade-in-scale">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-msu-gradient flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-heading text-lg text-foreground">Create New Event</h3>
              <p className="text-body-sm text-sm">Fill in the details below</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-label block mb-2">Event Title *</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="What's happening?"
                className="input-prestige"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-label block mb-2">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={newEvent.start_time}
                  onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                  className="input-prestige"
                />
              </div>
              <div>
                <label className="text-label block mb-2">Event Type</label>
                <select
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value as EventType })}
                  className="input-prestige"
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.emoji} {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-label block mb-2">Location</label>
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="Where is it happening?"
                className="input-prestige"
              />
            </div>

            <div>
              <label className="text-label block mb-2">Description</label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Tell people more about this event..."
                className="input-prestige min-h-[100px] resize-none"
              />
            </div>

            <button
              onClick={createEvent}
              disabled={!newEvent.title.trim() || !newEvent.start_time || creating}
              className="btn-prestige w-full disabled:opacity-50"
            >
              {creating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Create Event
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar animate-fade-in">
        <button
          onClick={() => setFilter('all')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
            filter === 'all'
              ? 'bg-msu-gradient text-white shadow-lg'
              : 'bg-background-elevated text-foreground-muted border border-glass-border hover:border-glass-border-hover'
          }`}
        >
          All Events
          <span className="ml-2 text-xs opacity-70">({events.length})</span>
        </button>
        {EVENT_TYPES.map((type) => {
          const count = events.filter(e => e.event_type === type.value).length
          return (
            <button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                filter === type.value
                  ? 'bg-msu-gradient text-white shadow-lg'
                  : 'bg-background-elevated text-foreground-muted border border-glass-border hover:border-glass-border-hover'
              }`}
            >
              <span>{type.emoji}</span>
              {type.label}
              {count > 0 && <span className="text-xs opacity-70">({count})</span>}
            </button>
          )
        })}
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <EmptyState onCreateClick={() => setShowForm(true)} />
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event, idx) => {
            const typeInfo = EVENT_TYPES.find(t => t.value === event.event_type)
            const { day, time } = formatDate(event.start_time)

            return (
              <div
                key={event.id}
                className={`card-prestige !p-0 overflow-hidden animate-fade-in reveal-delay-${(idx % 3) + 1}`}
              >
                {/* Color accent bar */}
                <div className={`h-1.5 bg-gradient-to-r ${typeInfo?.color || 'from-msu-green to-msu-green-light'}`} />

                <div className="p-6">
                  <div className="flex gap-5">
                    {/* Date/Time Box */}
                    <div className="flex-shrink-0 w-20 text-center">
                      <div className="bg-background rounded-xl border border-glass-border p-3">
                        <div className="text-xs font-bold text-msu-green uppercase tracking-wider">{day.split(' ')[0]}</div>
                        <div className="text-2xl font-black text-foreground mt-0.5">{day.split(' ')[1] || day.split(' ')[0]}</div>
                        <div className="text-xs text-foreground-subtle mt-1">{time}</div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{typeInfo?.emoji}</span>
                            <span className="text-label text-msu-green">{typeInfo?.label}</span>
                          </div>
                          <h3 className="text-heading text-lg text-foreground leading-tight">{event.title}</h3>
                        </div>

                        {/* Attendee count */}
                        <div className="flex items-center gap-2 bg-msu-green/5 px-3 py-1.5 rounded-full border border-msu-green/10">
                          <svg className="w-4 h-4 text-msu-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-sm font-bold text-msu-green">{event.attendeeCount}</span>
                        </div>
                      </div>

                      {event.location && (
                        <p className="text-body-sm flex items-center gap-1.5 mt-2">
                          <svg className="w-4 h-4 text-foreground-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.location}
                        </p>
                      )}

                      {event.description && (
                        <p className="text-body-sm line-clamp-2 mt-2">{event.description}</p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-glass-border">
                        <Link
                          href={`/profile/${event.creator.id}`}
                          className="flex items-center gap-2.5 group"
                        >
                          <div className="w-8 h-8 rounded-full bg-background overflow-hidden border-2 border-background-elevated">
                            {event.creator.avatar_url ? (
                              <img src={event.creator.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs flex items-center justify-center h-full">👤</span>
                            )}
                          </div>
                          <span className="text-sm font-medium text-foreground-muted group-hover:text-msu-green transition-colors">
                            {event.creator.full_name}
                          </span>
                        </Link>

                        {/* RSVP Buttons */}
                        <div className="flex gap-2">
                          {(['going', 'interested', 'maybe'] as const).map((status) => (
                            <button
                              key={status}
                              onClick={() => updateAttendance(event.id, event.userStatus === status ? null : status)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                                event.userStatus === status
                                  ? 'bg-msu-gradient text-white shadow-md'
                                  : 'bg-background text-foreground-muted border border-glass-border hover:border-msu-green/30 hover:text-msu-green'
                              }`}
                            >
                              {status === 'going' ? '✓ Going' : status === 'interested' ? '♡ Interested' : '? Maybe'}
                            </button>
                          ))}

                          {/* Delete button for own events */}
                          {currentUser && event.creator_id === currentUser.id && (
                            <button
                              onClick={() => deleteEvent(event.id)}
                              disabled={deletingEvent === event.id}
                              className="px-3 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-50 border border-red-100
                                       hover:bg-red-100 transition-all disabled:opacity-50"
                              title="Delete event"
                            >
                              {deletingEvent === event.id ? (
                                <span className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin inline-block" />
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
