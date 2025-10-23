// API Router - automatically uses Supabase when available, falls back to mock API
import * as supabaseApi from './supabaseApi'
import * as mockApi from './api'

// Check if we have valid Supabase configuration
const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

// Bypass mode - force use of mock API for reliability
const useSupabaseBypass = false

// Use Supabase API if configured and not bypassed, otherwise use mock API
const api = (hasSupabaseConfig && !useSupabaseBypass) ? supabaseApi : mockApi

// Export all API functions
export const {
  // Auth functions
  signIn,
  signOut,
  signUp,
  getCurrentUser,
  
  // Club functions
  listClubs,
  createClub,
  updateClub,
  deleteClub,
  
  // Event functions
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  getMyRegisteredEvents,
  isRegisteredForEvent,
  
  // Registration functions
  listRegistrations,
  listPendingRegistrations,
  approveRegistration,
  rejectRegistration,
  
  // Notification functions
  listNotifications,
  markNotificationRead,
  getUnreadNotificationCount,
  
  // Announcement functions
  createAnnouncement,
  listAnnouncements,
  deleteAnnouncement,
  
  // Other functions
  submitFeedback,
  listAchievements,
  listUsers
} = api

// For components that need to know which API is being used
export const isUsingSupabase = hasSupabaseConfig && !useSupabaseBypass
export const isUsingMockApi = !hasSupabaseConfig || useSupabaseBypass

console.log(`🔗 API Router: Using ${(hasSupabaseConfig && !useSupabaseBypass) ? 'Supabase' : 'Mock'} API`)
