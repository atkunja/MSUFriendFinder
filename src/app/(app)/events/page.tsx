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

const EVENT_TYPES: { value: EventType; label: string; emoji: string }[] = [
  { value: 'campus', label: 'Campus', emoji: '🏫' },
  { value: 'social', label: 'Social', emoji: '🎉' },
  { value: 'academic', label: 'Academic', emoji: '📚' },
  { value: 'sports', label: 'Sports', emoji: '🏀' },
  { value: 'club', label: 'Club', emoji: '🎭' },
]

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

    // Fetch upcoming events
    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })

    if (eventsData) {
      // Get creator profiles
      const creatorIds = [...new Set(eventsData.map(e => e.creator_id))]
      const { data: creators } = await supabase
        .from('profiles')
        .select('*')
        .in('id', creatorIds)

      const creatorMap = new Map(creators?.map(c => [c.id, c]) || [])

      // Get attendee counts and user status
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

    const { error } = await supabase.from('events').insert({
      creator_id: currentUser.id,
      title: newEvent.title.trim(),
      description: newEvent.description.trim() || null,
      location: newEvent.location.trim() || null,
      start_time: new Date(newEvent.start_time).toISOString(),
      event_type: newEvent.event_type,
    })

    if (!error) {
      setNewEvent({ title: '', description: '', location: '', start_time: '', event_type: 'social' })
      setShowForm(false)
      fetchData()
    }

    setCreating(false)
  }

  const updateAttendance = async (eventId: string, status: 'going' | 'interested' | 'maybe' | null) => {
    if (!currentUser) return

    if (status === null) {
      await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', currentUser.id)
    } else {
      await supabase
        .from('event_attendees')
        .upsert({
          event_id: eventId,
          user_id: currentUser.id,
          status,
        })
    }

    fetchData()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
  }

  const filteredEvents = filter === 'all' ? events : events.filter(e => e.event_type === filter)

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 h-40" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-msu-green/5 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-msu-accent/5 blur-[120px] rounded-full -z-10" />

      <div className="flex justify-between items-end mb-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Events</h1>
          <p className="text-gray-500 font-bold text-sm mt-1">What's happening on campus</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-prestige !py-2 !px-4 !text-sm"
        >
          {showForm ? 'Cancel' : '+ Create Event'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar animate-fade-in">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
            filter === 'all'
              ? 'bg-msu-green text-white'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          All Events
        </button>
        {EVENT_TYPES.map((type) => (
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

      {/* Create Form */}
      {showForm && (
        <div className="card-prestige !p-6 mb-6 animate-fade-in">
          <h3 className="font-black text-gray-800 mb-4">Create New Event</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="Event title"
              className="input-prestige"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="datetime-local"
                value={newEvent.start_time}
                onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                className="input-prestige"
              />
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
            <input
              type="text"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              placeholder="Location (optional)"
              className="input-prestige"
            />
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder="Description (optional)"
              className="input-prestige min-h-[80px] resize-none"
            />
            <button
              onClick={createEvent}
              disabled={!newEvent.title.trim() || !newEvent.start_time || creating}
              className="btn-prestige w-full disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </div>
      )}

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="card-prestige text-center py-16 animate-fade-in">
          <span className="text-6xl block mb-4">📅</span>
          <h3 className="text-xl font-black text-gray-800 mb-2">No upcoming events</h3>
          <p className="text-gray-500 font-medium">
            Be the first to create one!
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {filteredEvents.map((event) => {
            const typeInfo = EVENT_TYPES.find(t => t.value === event.event_type)
            return (
              <div key={event.id} className="card-prestige !p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-msu-green/10 flex items-center justify-center text-2xl flex-shrink-0">
                    {typeInfo?.emoji || '📅'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-black text-lg text-gray-900">{event.title}</h3>
                        <p className="text-sm text-msu-green font-bold mt-1">
                          {formatDate(event.start_time)}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                        {event.attendeeCount} going
                      </span>
                    </div>
                    {event.location && (
                      <p className="text-sm text-gray-500 mt-2">📍 {event.location}</p>
                    )}
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <Link
                        href={`/profile/${event.creator.id}`}
                        className="flex items-center gap-2 text-xs text-gray-500 hover:text-msu-green"
                      >
                        <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden">
                          {event.creator.avatar_url ? (
                            <img src={event.creator.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs flex items-center justify-center h-full">👤</span>
                          )}
                        </div>
                        <span>by {event.creator.full_name}</span>
                      </Link>
                      <div className="flex gap-2">
                        {(['going', 'interested', 'maybe'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => updateAttendance(event.id, event.userStatus === status ? null : status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              event.userStatus === status
                                ? 'bg-msu-green text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {status === 'going' ? "I'm going" : status === 'interested' ? 'Interested' : 'Maybe'}
                          </button>
                        ))}
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
