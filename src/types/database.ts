export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined' | 'canceled'
export type YearType = 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Grad' | 'Other'
export type EventType = 'campus' | 'social' | 'academic' | 'sports' | 'club'
export type LocationType = 'building' | 'dining' | 'library' | 'gym' | 'dorm' | 'other'
export type AttendeeStatus = 'going' | 'interested' | 'maybe'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string
          username: string | null
          pronouns: string | null
          major: string | null
          year: YearType | null
          bio: string | null
          interests: string[]
          looking_for: string[]
          campus_area: string | null
          avatar_url: string | null
          dorm: string | null
          dorm_room: string | null
          latitude: number | null
          longitude: number | null
          location_updated_at: string | null
          location_sharing: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name: string
          username?: string | null
          pronouns?: string | null
          major?: string | null
          year?: YearType | null
          bio?: string | null
          interests?: string[]
          looking_for?: string[]
          campus_area?: string | null
          avatar_url?: string | null
          dorm?: string | null
          dorm_room?: string | null
          latitude?: number | null
          longitude?: number | null
          location_updated_at?: string | null
          location_sharing?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string
          username?: string | null
          pronouns?: string | null
          major?: string | null
          year?: YearType | null
          bio?: string | null
          interests?: string[]
          looking_for?: string[]
          campus_area?: string | null
          avatar_url?: string | null
          dorm?: string | null
          dorm_room?: string | null
          latitude?: number | null
          longitude?: number | null
          location_updated_at?: string | null
          location_sharing?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      friend_requests: {
        Row: {
          id: string
          from_user: string
          to_user: string
          status: FriendRequestStatus
          note: string | null
          created_at: string
          responded_at: string | null
        }
        Insert: {
          id?: string
          from_user: string
          to_user: string
          status?: FriendRequestStatus
          note?: string | null
          created_at?: string
          responded_at?: string | null
        }
        Update: {
          id?: string
          from_user?: string
          to_user?: string
          status?: FriendRequestStatus
          note?: string | null
          created_at?: string
          responded_at?: string | null
        }
      }
      friendships: {
        Row: {
          id: string
          user_a: string
          user_b: string
          created_at: string
        }
        Insert: {
          id?: string
          user_a: string
          user_b: string
          created_at?: string
        }
        Update: {
          id?: string
          user_a?: string
          user_b?: string
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          participant_a: string
          participant_b: string
          is_group: boolean
          group_name: string | null
          group_avatar_url: string | null
          created_by: string | null
          class_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant_a: string
          participant_b: string
          is_group?: boolean
          group_name?: string | null
          group_avatar_url?: string | null
          created_by?: string | null
          class_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participant_a?: string
          participant_b?: string
          is_group?: boolean
          group_name?: string | null
          group_avatar_url?: string | null
          created_by?: string | null
          class_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversation_members: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          role: 'admin' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          role?: 'admin' | 'member'
          joined_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          role?: 'admin' | 'member'
          joined_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          created_at?: string
          read_at?: string | null
        }
      }
      classes: {
        Row: {
          id: string
          course_code: string
          course_name: string
          department: string | null
          created_at: string
        }
        Insert: {
          id?: string
          course_code: string
          course_name: string
          department?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          course_code?: string
          course_name?: string
          department?: string | null
          created_at?: string
        }
      }
      user_classes: {
        Row: {
          id: string
          user_id: string
          class_id: string
          semester: string
          section: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          class_id: string
          semester: string
          section?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          class_id?: string
          semester?: string
          section?: string | null
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string | null
          location: string | null
          latitude: number | null
          longitude: number | null
          start_time: string
          end_time: string | null
          event_type: EventType
          is_public: boolean
          max_attendees: number | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description?: string | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          start_time: string
          end_time?: string | null
          event_type: EventType
          is_public?: boolean
          max_attendees?: number | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string | null
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          start_time?: string
          end_time?: string | null
          event_type?: EventType
          is_public?: boolean
          max_attendees?: number | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      event_attendees: {
        Row: {
          id: string
          event_id: string
          user_id: string
          status: AttendeeStatus
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          status?: AttendeeStatus
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          status?: AttendeeStatus
          created_at?: string
        }
      }
      spontaneous_posts: {
        Row: {
          id: string
          user_id: string
          content: string
          location_name: string | null
          latitude: number | null
          longitude: number | null
          expires_at: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          location_name?: string | null
          latitude?: number | null
          longitude?: number | null
          expires_at: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          location_name?: string | null
          latitude?: number | null
          longitude?: number | null
          expires_at?: string
          is_active?: boolean
          created_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          name: string
          location_type: LocationType
          address: string | null
          latitude: number | null
          longitude: number | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          location_type: LocationType
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          location_type?: LocationType
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          image_url?: string | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          location_id: string
          rating: number
          title: string | null
          content: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          location_id: string
          rating: number
          title?: string | null
          content?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          location_id?: string
          rating?: number
          title?: string | null
          content?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profile_photos: {
        Row: {
          id: string
          user_id: string
          photo_url: string
          display_order: number
          caption: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          photo_url: string
          display_order?: number
          caption?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          photo_url?: string
          display_order?: number
          caption?: string | null
          created_at?: string
        }
      }
    }
    Functions: {
      accept_friend_request: {
        Args: { p_request_id: string }
        Returns: undefined
      }
      get_or_create_conversation: {
        Args: { p_other_user: string }
        Returns: string
      }
      create_group_chat: {
        Args: { p_name: string; p_member_ids: string[] }
        Returns: string
      }
      get_or_create_class_chat: {
        Args: { p_class_id: string; p_semester: string }
        Returns: string
      }
    }
  }
}

// Type exports
export type Profile = Database['public']['Tables']['profiles']['Row']
export type FriendRequest = Database['public']['Tables']['friend_requests']['Row']
export type Friendship = Database['public']['Tables']['friendships']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type ConversationMember = Database['public']['Tables']['conversation_members']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Class = Database['public']['Tables']['classes']['Row']
export type UserClass = Database['public']['Tables']['user_classes']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type EventAttendee = Database['public']['Tables']['event_attendees']['Row']
export type SpontaneousPost = Database['public']['Tables']['spontaneous_posts']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type ProfilePhoto = Database['public']['Tables']['profile_photos']['Row']
