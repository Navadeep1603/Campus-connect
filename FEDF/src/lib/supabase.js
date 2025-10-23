import { createClient } from '@supabase/supabase-js'

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Temporary fallback for development - replace with your actual Supabase credentials
const fallbackUrl = 'https://temp-project.supabase.co'
const fallbackKey = 'temp-key'

// Use fallback values if environment variables are not set (for initial testing)
const finalUrl = supabaseUrl || fallbackUrl
const finalKey = supabaseAnonKey || fallbackKey

// Only throw error if we're using fallback values (to remind user to set up Supabase)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Using fallback Supabase config. Please set up your .env file with real Supabase credentials.')
  console.warn('📖 See SUPABASE_SETUP.md for instructions')
}

// Export Supabase client
export const supabase = createClient(finalUrl, finalKey)

// Export config check for conditional logic
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)
