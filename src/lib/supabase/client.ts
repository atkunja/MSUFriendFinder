import { createBrowserClient, SupabaseClient } from '@supabase/ssr'

// Placeholder to allow build to pass when env vars are unavailable
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder-key'

export function createClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY

  // During build, env vars may not be available. This allows the build to pass.
  // At runtime, the real values will be used.
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
