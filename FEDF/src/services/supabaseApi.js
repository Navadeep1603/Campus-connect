import { supabase } from '../lib/supabase'

// Auth functions
export async function signUp({ email, password, collegeId, firstName, lastName, role = 'student' }) {
  try {
    console.log('Starting signUp process for:', email)
    
    // Check if college ID already exists (with error handling)
    console.log('Checking if college ID exists:', collegeId)
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('college_id')
      .eq('college_id', collegeId)
      .single()
    
    // Only throw error if college ID actually exists (ignore "not found" errors)
    if (existingProfile && !checkError) {
      throw new Error('College ID already registered')
    }

    console.log('College ID check passed, creating auth user...')
    
    // Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // Disable email confirmation for development
        data: {
          email_confirm: true // Auto-confirm email
        }
      }
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      throw authError
    }

    console.log('Auth user created successfully, ID:', authData.user.id)
    console.log('Creating profile...')

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        college_id: collegeId,
        first_name: firstName,
        last_name: lastName,
        email,
        role
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      throw profileError
    }

    console.log('Profile created successfully!')
    return { ok: true, user: authData.user }
  } catch (error) {
    console.error('SignUp error:', error)
    throw new Error(error.message)
  }
}

export async function signIn({ email, password }) {
  try {
    console.log('Attempting to sign in with email:', email)
    
    // Add a reasonable timeout to prevent infinite hanging
    const authPromise = supabase.auth.signInWithPassword({
      email,
      password
    })
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout - please check your internet or try again')), 30000)
    )
    
    const { data, error } = await Promise.race([authPromise, timeoutPromise])

    if (error) {
      console.error('Supabase auth error:', error)
      // Provide more helpful error messages
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials.')
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Please confirm your email address before signing in.')
      } else {
        throw new Error(`Login failed: ${error.message}`)
      }
    }

    console.log('Auth successful, user ID:', data.user.id)

    // Try to get user profile with timeout
    console.log('Fetching user profile...')
    try {
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      
      const profileTimeoutPromise = new Promise((resolve) => 
        setTimeout(() => resolve({ data: null, error: { code: 'TIMEOUT' } }), 10000)
      )
      
      const { data: profile, error: profileError } = await Promise.race([profilePromise, profileTimeoutPromise])

      if (profileError && profileError.code === 'TIMEOUT') {
        console.log('Profile fetch timed out, proceeding without profile')
      } else if (profileError && profileError.code === 'PGRST116') {
        console.log('No profile found, user can still login but should create profile')
      } else if (profileError) {
        console.error('Profile fetch error:', profileError)
      } else {
        console.log('Profile found:', profile)
      }

      return { 
        ok: true, 
        user: {
          ...data.user,
          profile: profile || null
        }
      }
    } catch (profileError) {
      console.error('Profile fetch failed:', profileError)
      // Still return success with auth user, just no profile
      return { 
        ok: true, 
        user: {
          ...data.user,
          profile: null
        }
      }
    }
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  return { ok: true }
}

export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return {
      ...user,
      profile
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Club functions
export async function listClubs() {
  try {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching clubs:', error)
    return []
  }
}

// Event functions
export async function listEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        clubs:club_id (
          name,
          category
        ),
        event_registrations (
          id,
          student_id,
          status
        )
      `)
      .order('start_time')

    if (error) throw error
    
    // Transform data to match existing API structure
    return (data || []).map(event => ({
      ...event,
      id: event.id,
      title: event.title,
      clubId: event.club_id,
      venue: event.venue,
      start: event.start_time,
      end: event.end_time,
      category: event.category,
      capacity: event.capacity,
      attendees: event.event_registrations
        ?.filter(reg => reg.status === 'approved')
        ?.map(reg => reg.student_id) || []
    }))
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export async function createEvent(eventData) {
  try {
    // Check for conflicts
    const conflict = await checkConflict(eventData)
    if (conflict) {
      throw new Error(`Time/venue conflict with ${conflict.title} at ${conflict.venue}`)
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        title: eventData.title,
        club_id: eventData.clubId,
        venue: eventData.venue,
        start_time: eventData.start,
        end_time: eventData.end,
        category: eventData.category,
        capacity: eventData.capacity,
        description: eventData.description
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function updateEvent(eventId, patch) {
  try {
    // Check for conflicts if time/venue changed
    if (patch.start || patch.end || patch.venue) {
      const conflict = await checkConflict(patch, eventId)
      if (conflict) {
        throw new Error(`Time/venue conflict with ${conflict.title} at ${conflict.venue}`)
      }
    }

    const updateData = {}
    if (patch.title) updateData.title = patch.title
    if (patch.clubId) updateData.club_id = patch.clubId
    if (patch.venue) updateData.venue = patch.venue
    if (patch.start) updateData.start_time = patch.start
    if (patch.end) updateData.end_time = patch.end
    if (patch.category) updateData.category = patch.category
    if (patch.capacity) updateData.capacity = patch.capacity
    if (patch.description) updateData.description = patch.description

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function deleteEvent(eventId) {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) throw error
    return { ok: true }
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function checkConflict(event, ignoreId = null) {
  try {
    let query = supabase
      .from('events')
      .select('*')
      .eq('venue', event.venue)
      .or(`start_time.lt.${event.end},end_time.gt.${event.start}`)

    if (ignoreId) {
      query = query.neq('id', ignoreId)
    }

    const { data, error } = await query

    if (error) throw error
    return data && data.length > 0 ? data[0] : null
  } catch (error) {
    console.error('Error checking conflicts:', error)
    return null
  }
}

// Registration functions
export async function registerForEvent(eventId, studentId) {
  try {
    // Check if already registered
    const { data: existing } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('student_id', studentId)
      .single()

    if (existing) {
      if (existing.status === 'approved') {
        throw new Error('Already registered')
      } else if (existing.status === 'pending') {
        throw new Error('Registration pending approval')
      }
    }

    // Check event capacity
    const { data: event } = await supabase
      .from('events')
      .select('capacity, title')
      .eq('id', eventId)
      .single()

    if (!event) throw new Error('Event not found')

    const { count: approvedCount } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact' })
      .eq('event_id', eventId)
      .eq('status', 'approved')

    if (approvedCount >= (event.capacity || 9999)) {
      throw new Error('Event full')
    }

    // Create registration
    const { error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        student_id: studentId,
        status: 'pending'
      })

    if (error) throw error

    // Send notifications
    await pushNotification('admin', `New registration request from student for ${event.title}`)
    await pushNotification(studentId, `Registration request submitted for ${event.title}. Waiting for admin approval.`)

    return { ok: true, pending: true }
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function listRegistrations() {
  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        events (title, start_time),
        profiles (first_name, last_name, college_id)
      `)
      .eq('status', 'approved')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return []
  }
}

export async function listPendingRegistrations() {
  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        events (title, start_time),
        profiles (first_name, last_name, college_id)
      `)
      .eq('status', 'pending')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching pending registrations:', error)
    return []
  }
}

export async function approveRegistration(regId) {
  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', regId)
      .select(`
        *,
        events (title)
      `)
      .single()

    if (error) throw error

    // Notify student
    await pushNotification(data.student_id, `Your registration for ${data.events.title} has been approved!`)

    return { ok: true }
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function rejectRegistration(regId) {
  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .update({ status: 'rejected' })
      .eq('id', regId)
      .select(`
        *,
        events (title)
      `)
      .single()

    if (error) throw error

    // Notify student
    await pushNotification(data.student_id, `Your registration for ${data.events.title} has been rejected.`)

    return { ok: true }
  } catch (error) {
    throw new Error(error.message)
  }
}

// Notification functions
export async function pushNotification(userId, message) {
  try {
    // If userId is 'admin', send to all admin users
    if (userId === 'admin') {
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')

      if (admins && admins.length > 0) {
        const notifications = admins.map(admin => ({
          user_id: admin.id,
          message
        }))

        await supabase
          .from('notifications')
          .insert(notifications)
      }
    } else {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          message
        })
    }
  } catch (error) {
    console.error('Error sending notification:', error)
  }
}

export async function listNotifications(userId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export async function getUnreadNotificationCount(userId) {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Error getting unread count:', error)
    return 0
  }
}

export async function markNotificationRead(notificationId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) throw error
    return { ok: true }
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

// Achievement functions
export async function listAchievements(studentId) {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('student_id', studentId)
      .order('issue_date', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return []
  }
}

// Feedback functions
export async function submitFeedback({ studentId, message }) {
  try {
    const { error } = await supabase
      .from('feedback')
      .insert({
        student_id: studentId,
        message
      })

    if (error) throw error
    return { ok: true }
  } catch (error) {
    throw new Error(error.message)
  }
}

// User management functions
export async function listUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('first_name')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

// Export CSV function (client-side)
export function exportCSV(rows, filename = 'export.csv') {
  const csv = rows.map(r => 
    Object.values(r).map(v => 
      '"' + String(v).replaceAll('"', '""') + '"'
    ).join(',')
  ).join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
