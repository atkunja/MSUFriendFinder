'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import MessageBubble from '@/components/MessageBubble'
import type { Profile, Message, Conversation } from '@/types/database'

interface MessageWithSender extends Message {
  sender?: Profile
}

export default function ChatPage() {
  const params = useParams()
  const conversationId = params.conversationId as string
  const router = useRouter()
  const supabase = createClient()

  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [participants, setParticipants] = useState<Profile[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [displayAvatar, setDisplayAvatar] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    fetchChatData()
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const showNotification = (title: string, body: string, avatar?: string | null) => {
    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
      const notification = new Notification(title, {
        body,
        icon: avatar || '/icon.png',
        badge: '/icon.png',
        tag: conversationId,
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    }
  }

  const fetchChatData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setCurrentUserId(user.id)

    // Fetch conversation
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .maybeSingle()

    if (convError) {
      console.error('Conversation error:', convError)
      setError(`Database error: ${convError.message}`)
      setLoading(false)
      return
    }

    if (!convData) {
      setError('Conversation not found or you do not have access')
      setLoading(false)
      return
    }

    setConversation(convData)

    // Check user access and get participants
    if (convData.is_group) {
      // Group chat - check membership
      const { data: membership } = await supabase
        .from('conversation_members')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        router.push('/messages')
        return
      }

      // Get all group members
      const { data: allMembers } = await supabase
        .from('conversation_members')
        .select('user_id')
        .eq('conversation_id', conversationId)

      if (allMembers) {
        const memberIds = allMembers.map(m => m.user_id)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', memberIds)

        setParticipants(profiles || [])

        // Set display name
        if (convData.group_name) {
          setDisplayName(convData.group_name)
        } else {
          const otherMembers = (profiles || []).filter(p => p.id !== user.id)
          setDisplayName(otherMembers.slice(0, 3).map(p => p.full_name.split(' ')[0]).join(', '))
        }
        setDisplayAvatar(convData.group_avatar_url)
      }
    } else {
      // 1-on-1 chat - verify participant
      if (convData.participant_a !== user.id && convData.participant_b !== user.id) {
        router.push('/messages')
        return
      }

      const otherUserId = convData.participant_a === user.id ? convData.participant_b : convData.participant_a
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherUserId)
        .single()

      if (profileData) {
        setParticipants([profileData])
        setDisplayName(profileData.full_name)
        setDisplayAvatar(profileData.avatar_url)
      }
    }

    // Fetch messages
    const { data: messagesData } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    setMessages(messagesData || [])
    setLoading(false)

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .is('read_at', null)
  }

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })

          // Show notification for messages from others
          if (newMsg.sender_id !== currentUserId) {
            const sender = participants.find(p => p.id === newMsg.sender_id)
            showNotification(
              sender?.full_name || displayName,
              newMsg.content,
              sender?.avatar_url || displayAvatar
            )

            // Mark as read if window is focused
            if (!document.hidden) {
              supabase
                .from('messages')
                .update({ read_at: new Date().toISOString() })
                .eq('id', newMsg.id)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, currentUserId, participants, displayName, displayAvatar])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUserId || sending) return

    setSending(true)
    setError(null)
    const messageContent = newMessage.trim()
    setNewMessage('')

    const { error: insertError } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: messageContent,
    })

    if (insertError) {
      console.error('Error sending message:', insertError)
      setError(`Failed to send: ${insertError.message}`)
      setNewMessage(messageContent)
      setSending(false)
      return
    }

    // Update conversation updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    setSending(false)
    inputRef.current?.focus()
  }

  const getSenderInfo = (senderId: string) => {
    return participants.find(p => p.id === senderId)
  }

  if (loading && !error) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)] bg-background">
        <div className="p-4 border-b border-glass-border bg-background-elevated/80 backdrop-blur-lg">
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-10 h-10 bg-foreground-subtle/20 rounded-full" />
            <div className="h-4 bg-foreground-subtle/20 rounded w-32" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`animate-pulse flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
              <div className={`h-12 ${i % 2 === 0 ? 'bg-msu-green/20' : 'bg-foreground-subtle/10'} rounded-2xl w-48`} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error && !conversation) {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)] bg-background">
        <div className="p-4 border-b border-glass-border bg-background-elevated">
          <Link href="/messages" className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Messages
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-500 font-medium mb-4">{error}</p>
            <Link href="/messages" className="btn-prestige">
              Go to Messages
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-background">
      {/* Chat Header */}
      <div className="p-4 border-b border-glass-border bg-background-elevated/80 backdrop-blur-lg sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/messages" className="text-foreground-subtle hover:text-foreground transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-3 flex-1">
            {conversation?.is_group ? (
              <div className="w-11 h-11 rounded-full bg-msu-green/10 flex items-center justify-center border-2 border-background shadow-md">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-lg">👥</span>
                )}
              </div>
            ) : participants[0] ? (
              <Link href={`/profile/${participants[0].id}`} className="group">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-background-elevated overflow-hidden border-2 border-background shadow-md group-hover:border-msu-green/30 transition-colors">
                    {displayAvatar ? (
                      <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg flex items-center justify-center h-full">👤</span>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background-elevated rounded-full" />
                </div>
              </Link>
            ) : (
              <div className="w-11 h-11 rounded-full bg-background-elevated flex items-center justify-center border-2 border-background shadow-md">
                <span className="text-lg">👤</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-foreground truncate">{displayName}</h2>
              <p className="text-xs text-foreground-subtle">
                {conversation?.is_group
                  ? `${participants.length} members`
                  : participants[0]?.major || 'MSU Student'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background-elevated/30 to-background">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-msu-green/10 flex items-center justify-center">
              <span className="text-3xl">👋</span>
            </div>
            <h3 className="font-bold text-foreground mb-1">Start the conversation</h3>
            <p className="text-foreground-muted text-sm">
              {conversation?.is_group
                ? 'Send a message to the group!'
                : `Say hi to ${displayName.split(' ')[0]}!`}
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const sender = getSenderInfo(message.sender_id)
            const isOwn = message.sender_id === currentUserId
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={isOwn}
                senderAvatar={!isOwn ? sender?.avatar_url || undefined : undefined}
                senderName={!isOwn && conversation?.is_group ? sender?.full_name : undefined}
                showSenderName={conversation?.is_group && !isOwn}
              />
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-glass-border bg-background-elevated">
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
        <form onSubmit={sendMessage} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-5 py-3.5 rounded-full bg-background border border-glass-border
                       text-foreground placeholder:text-foreground-subtle
                       focus:outline-none focus:ring-2 focus:ring-msu-green/30 focus:border-msu-green/50
                       transition-all font-medium"
              disabled={sending}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-12 h-12 rounded-full bg-msu-gradient text-white flex items-center justify-center
                     disabled:opacity-40 hover:opacity-90 transition-all shadow-lg hover:shadow-xl
                     hover:scale-105 active:scale-95"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
