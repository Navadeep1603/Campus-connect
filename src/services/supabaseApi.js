import { supabase } from '../lib/supabase'
// Auth functions
export async function signUp({ email, password, collegeId, firstName, lastName, role = 'student' }) {
  try {
    console.log('Starting signUp process for:', email)
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Registration timeout - please check your internet connection')), 15000)
    )
    
    // Sign up user with Supabase Auth
    const authPromise = supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
        data: {
          email_confirm: true
        }
      }
    })
    
    const { data: authData, error: authError } = await Promise.race([authPromise, timeoutPromise])

    if (authError) {
      console.error('Auth signup error:', authError)
      throw authError
    }

    console.log('Auth user created successfully, ID:', authData.user.id)
    console.log('Creating profile...')

    // Create profile with timeout
    const profilePromise = supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        college_id: collegeId,
        first_name: firstName,
        last_name: lastName,
        email: email,
        role: role
      })
    
    const { error: profileError } = await Promise.race([profilePromise, timeoutPromise])

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail completely if profile creation fails
      console.log('Profile creation failed, but auth user exists')
    } else {
      console.log('Profile created successfully!')
      
      // Send notification to all admins about new student registration
      if (role === 'student') {
        try {
          console.log('📢 Sending registration notification to admins')
          const { data: admins, error: adminError } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin')

          if (!adminError && admins && admins.length > 0) {
            const notifications = admins.map(admin => ({
              user_id: admin.id,
              message: `👤 New student registered: ${firstName} ${lastName} (${email})`,
              read: false
            }))

            const { error: notifError } = await supabase
              .from('notifications')
              .insert(notifications)

            if (notifError) {
              console.error('⚠️ Error creating admin notifications:', notifError)
            } else {
              console.log(`✅ Notified ${admins.length} admins about new student registration`)
            }
          }
        } catch (notifError) {
          console.error('❌ Admin notification failed:', notifError)
          // Don't fail registration if notification fails
        }
      }
    }

    return { ok: true, user: authData.user }
  } catch (error) {
    console.error('SignUp error:', error)
    throw new Error(error.message)
  }
}

export async function signIn({ email, password }) {
  try {
    console.log('Attempting to sign in with email:', email)
    
    // Add shorter timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout - please check your internet')), 8000)
    )
    
    // First try to sign in with existing account
    const authPromise = supabase.auth.signInWithPassword({
      email,
      password
    })
    
    const { data, error } = await Promise.race([authPromise, timeoutPromise])

    if (error) {
      console.error('Supabase auth error:', error)
      
      // If user doesn't exist, create account automatically for KL University emails
      if (error.message.includes('Invalid login credentials') && email.includes('@kluniversity.in')) {
        console.log('User not found, creating new KL University account...')
        return await createKLAccount(email, password)
      }
      
      // Provide helpful error messages
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials.')
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('Please confirm your email address before signing in.')
      } else {
        throw new Error(`Login failed: ${error.message}`)
      }
    }

    console.log('Auth successful, user ID:', data.user.id)

    // Get user profile with shorter timeout
    try {
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      
      const shortTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile timeout')), 5000)
      )
      
      const { data: profile } = await Promise.race([profilePromise, shortTimeoutPromise])
      
      return { 
        ok: true, 
        user: {
          ...data.user,
          profile: profile || null
        }
      }
    } catch (profileError) {
      console.log('Profile fetch failed, attempting to create profile:', profileError.message)
      
      // Try to create a profile if it doesn't exist
      try {
        const role = data.user.email === 'admin@hub.com' ? 'admin' : 'student'
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            college_id: role === 'admin' ? 'ADMIN001' : data.user.email.split('@')[0],
            first_name: role === 'admin' ? 'Admin' : 'User',
            last_name: role === 'admin' ? 'User' : 'Name',
            email: data.user.email,
            role: role
          })
          .select()
          .single()
        
        console.log('Profile created automatically:', newProfile)
        return { 
          ok: true, 
          user: {
            ...data.user,
            profile: newProfile
          }
        }
      } catch (createError) {
        console.log('Could not create profile automatically:', createError.message)
        return { 
          ok: true, 
          user: {
            ...data.user,
            profile: null
          }
        }
      }
    }
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

// Helper function to create KL University accounts automatically
async function createKLAccount(email, password) {
  try {
    console.log('Creating new KL University account for:', email)
    
    const collegeId = email.split('@')[0]
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
        data: {
          email_confirm: true
        }
      }
    })

    if (authError) {
      throw authError
    }

    console.log('Auth user created, creating profile...')

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        college_id: collegeId,
        first_name: 'KL',
        last_name: 'Student',
        email: email,
        role: 'student'
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
    } else {
      // Notify admins about new KL University student
      try {
        console.log('📢 Notifying admins about KL University student')
        const { data: admins } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin')

        if (admins && admins.length > 0) {
          const notifications = admins.map(admin => ({
            user_id: admin.id,
            message: `👤 New KL University student: ${email}`,
            read: false
          }))

          await supabase.from('notifications').insert(notifications)
          console.log(`✅ Notified ${admins.length} admins about KL student`)
        }
      } catch (err) {
        console.error('⚠️ Failed to notify admins:', err)
      }
    }

    // Now sign in with the new account
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      throw signInError
    }

    // Get the created profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signInData.user.id)
      .single()

    console.log('KL University account created and signed in successfully!')

    return { 
      ok: true, 
      user: {
        ...signInData.user,
        profile: profile || null
      }
    }
  } catch (error) {
    console.error('Error creating KL account:', error)
    throw new Error(`Failed to create account: ${error.message}`)
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

    // Format dates properly for Supabase
    const formatDateTime = (dateTimeString) => {
      if (!dateTimeString) return null
      
      try {
        // If it's already an ISO string with Z, return as is
        if (typeof dateTimeString === 'string' && dateTimeString.includes('T') && dateTimeString.includes('Z')) {
          return dateTimeString
        }
        
        // If it's datetime-local format (YYYY-MM-DDTHH:MM) without timezone
        if (typeof dateTimeString === 'string' && dateTimeString.includes('T')) {
          // Append seconds if missing
          const withSeconds = dateTimeString.length === 16 ? `${dateTimeString}:00` : dateTimeString
          const date = new Date(withSeconds)
          if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateTimeString)
            throw new Error(`Invalid date: ${dateTimeString}`)
          }
          return date.toISOString()
        }
        
        // Try to parse as regular date
        const date = new Date(dateTimeString)
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date: ${dateTimeString}`)
        }
        return date.toISOString()
      } catch (error) {
        console.error('Date formatting error:', error)
        throw new Error(`Invalid date format: ${dateTimeString}`)
      }
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        title: eventData.title,
        club_id: eventData.clubId,
        venue: eventData.venue,
        start_time: formatDateTime(eventData.start),
        end_time: formatDateTime(eventData.end),
        category: eventData.category,
        capacity: eventData.capacity,
        description: eventData.description
      })
      .select()
      .single()

    if (error) throw error

    // Send notifications to all students about the new event
    try {
      console.log('📢 Creating notifications for new event:', eventData.title)
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'student')

      if (studentsError) {
        console.error('⚠️ Error fetching students:', studentsError)
        // Continue even if student fetch fails
      } else {
        console.log('👥 Found students:', students?.length || 0, students)

        if (students && students.length > 0) {
          let eventDate = 'soon'
          try {
            const formattedStart = formatDateTime(eventData.start)
            if (formattedStart) {
              eventDate = new Date(formattedStart).toLocaleDateString()
            }
          } catch (err) {
            console.warn('Could not format event date for notification:', err)
          }
          
          const notifications = students.map(student => ({
            user_id: student.id,
            message: `🎉 New Event: ${eventData.title} on ${eventDate} at ${eventData.venue}`,
            read: false
          }))

          console.log('📨 Preparing to insert notifications:', notifications)

          const { data: insertedNotifs, error: notifError } = await supabase
            .from('notifications')
            .insert(notifications)
            .select()

          if (notifError) {
            console.error('⚠️ Error inserting notifications:', notifError)
            // Continue even if notification insert fails
          } else {
            console.log(`✅ Successfully created ${students.length} notifications for event: ${eventData.title}`)
            console.log('📬 Inserted notifications:', insertedNotifs)
          }
        } else {
          console.log('⚠️ No students found to notify')
        }
      }
    } catch (notifError) {
      console.error('❌ Notification creation failed, but event was created:', notifError)
      // Don't fail event creation if notifications fail
    }

    return data
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function updateEvent(eventId, patch) {
  try {
    // Format dates properly for Supabase
    const formatDateTime = (dateTimeString) => {
      if (!dateTimeString) return null
      
      try {
        // If it's already an ISO string with Z, return as is
        if (typeof dateTimeString === 'string' && dateTimeString.includes('T') && dateTimeString.includes('Z')) {
          return dateTimeString
        }
        
        // If it's datetime-local format (YYYY-MM-DDTHH:MM) without timezone
        if (typeof dateTimeString === 'string' && dateTimeString.includes('T')) {
          // Append seconds if missing
          const withSeconds = dateTimeString.length === 16 ? `${dateTimeString}:00` : dateTimeString
          const date = new Date(withSeconds)
          if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateTimeString)
            throw new Error(`Invalid date: ${dateTimeString}`)
          }
          return date.toISOString()
        }
        
        // Try to parse as regular date
        const date = new Date(dateTimeString)
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date: ${dateTimeString}`)
        }
        return date.toISOString()
      } catch (error) {
        console.error('Date formatting error:', error)
        throw new Error(`Invalid date format: ${dateTimeString}`)
      }
    }

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
    if (patch.start) updateData.start_time = formatDateTime(patch.start)
    if (patch.end) updateData.end_time = formatDateTime(patch.end)
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
    console.log('🎫 Student attempting to register for event:', eventId)
    
    // Check if already registered
    const { data: existing, error: checkError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('student_id', studentId)
      .maybeSingle() // Use maybeSingle() instead of single() to avoid error when no row found

    // Log for debugging
    if (existing) {
      console.log('⚠️ Existing registration found:', existing)
    }

    if (existing) {
      if (existing.status === 'approved') {
        throw new Error('You are already registered for this event')
      } else if (existing.status === 'pending') {
        throw new Error('Your registration is already pending approval')
      } else if (existing.status === 'rejected') {
        throw new Error('Your previous registration was rejected. Please contact admin.')
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

    if (error) {
      // Handle duplicate registration error
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new Error('You have already registered for this event')
      }
      throw error
    }

    // Send notifications
    console.log('📢 Sending registration approval notifications')
    await pushNotification('admin', `🎫 New event registration: Student ${studentId} wants to join "${event.title}"`)
    await pushNotification(studentId, `⏳ Registration submitted for "${event.title}". Waiting for admin approval.`)

    return { ok: true, pending: true }
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function listRegistrations() {
  try {
    console.log('🔍 Fetching approved registrations...')
    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        events:event_id (title, start_time),
        profiles:student_id (id, first_name, last_name, college_id, email)
      `)
      .eq('status', 'approved')

    if (error) {
      console.error('❌ Error fetching approved registrations:', error)
      
      // Fallback: fetch without joins
      const { data: simpleData, error: simpleError } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('status', 'approved')
      
      if (simpleError) throw simpleError
      
      // Manually fetch related data
      if (simpleData && simpleData.length > 0) {
        for (const reg of simpleData) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, college_id, email')
            .eq('id', reg.student_id)
            .single()
          
          const { data: event } = await supabase
            .from('events')
            .select('title, start_time')
            .eq('id', reg.event_id)
            .single()
          
          reg.profiles = profile
          reg.events = event
        }
      }
      
      return simpleData || []
    }
    
    console.log('✅ Approved registrations found:', data?.length || 0, data)
    console.log('✅ Sample registration:', data?.[0])
    return data || []
  } catch (error) {
    console.error('❌ Failed to fetch approved registrations:', error.message)
    return []
  }
}

export async function listPendingRegistrations() {
  try {
    console.log('🔍 Fetching pending registrations...')
    
    // First try to get ALL registrations to check if table exists and is accessible
    const { data: allData, error: allError } = await supabase
      .from('event_registrations')
      .select('*')
      .limit(100)
    
    console.log('📊 All registrations in table:', allData?.length || 0, allData)
    if (allError) {
      console.error('❌ Error accessing event_registrations table:', allError)
    }
    
    // Now get pending with joins
    const { data, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        events:event_id (title, start_time),
        profiles:student_id (id, first_name, last_name, college_id, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching pending registrations with joins:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // Try without joins as fallback
      console.log('🔄 Trying without joins...')
      const { data: simpleData, error: simpleError } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('status', 'pending')
        
      if (simpleError) {
        console.error('❌ Simple query also failed:', simpleError)
        throw simpleError
      }
      
      // Fetch profile and event data separately
      if (simpleData && simpleData.length > 0) {
        for (const reg of simpleData) {
          // Fetch profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, college_id, email')
            .eq('id', reg.student_id)
            .single()
          
          // Fetch event
          const { data: event } = await supabase
            .from('events')
            .select('title, start_time')
            .eq('id', reg.event_id)
            .single()
          
          reg.profiles = profile
          reg.events = event
        }
      }
      
      console.log('📋 Pending registrations (manual joins):', simpleData?.length || 0, simpleData)
      return simpleData || []
    }
    
    console.log('📋 Pending registrations found (with joins):', data?.length || 0, data)
    console.log('📋 Sample registration:', data?.[0])
    return data || []
  } catch (error) {
    console.error('❌ Failed to fetch pending registrations:', error.message, error)
    return []
  }
}

export async function approveRegistration(regId) {
  try {
    // First update the registration
    const { data: updateData, error: updateError } = await supabase
      .from('event_registrations')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', regId)
      .select()
      .single()

    if (updateError) throw updateError

    // Then fetch event details separately
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('title')
      .eq('id', updateData.event_id)
      .single()

    if (eventError) throw eventError

    // Notify student
    await pushNotification(updateData.student_id, `✅ Approved! You're registered for "${eventData.title}"`)

    return { ok: true }
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function rejectRegistration(regId) {
  try {
    // First update the registration
    const { data: updateData, error: updateError } = await supabase
      .from('event_registrations')
      .update({ status: 'rejected' })
      .eq('id', regId)
      .select()
      .single()

    if (updateError) throw updateError

    // Then fetch event details separately
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('title')
      .eq('id', updateData.event_id)
      .single()

    if (eventError) throw eventError

    // Notify student
    await pushNotification(updateData.student_id, `Your registration for ${eventData.title} has been rejected.`)

    return { ok: true }
  } catch (error) {
    throw new Error(error.message)
  }
}

// Notification functions
export async function pushNotification(userId, message) {
  try {
    console.log('📤 pushNotification called with userId:', userId, 'message:', message)
    
    // If userId is 'admin', send to all admin users
    if (userId === 'admin') {
      const { data: admins, error: adminError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')

      console.log('👥 Found admins:', admins?.length || 0, admins?.map(a => a.id))
      
      if (adminError) {
        console.error('❌ Error fetching admins:', adminError)
        return
      }

      if (admins && admins.length > 0) {
        const notifications = admins.map(admin => ({
          user_id: admin.id,
          message,
          read: false
        }))

        console.log('📨 Creating notifications for admin user_ids:', notifications.map(n => n.user_id))

        const { data: inserted, error: insertError } = await supabase
          .from('notifications')
          .insert(notifications)
          .select()
        
        if (insertError) {
          console.error('❌ Error inserting admin notifications:', insertError)
        } else {
          console.log(`✅ Sent notification to ${admins.length} admins:`, inserted)
        }
      }
    } else {
      console.log('📨 Creating notification for single user_id:', userId)
      
      const { data: inserted, error: insertError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          message,
          read: false
        })
        .select()
      
      if (insertError) {
        console.error('❌ Error inserting notification:', insertError)
      } else {
        console.log(`✅ Sent notification to user ${userId}:`, inserted)
      }
    }
  } catch (error) {
    console.error('❌ Error in pushNotification:', error)
  }
}

export async function listNotifications(userId) {
  try {
    console.log('🔍 Fetching notifications for user ID:', userId)
    
    // First check ALL notifications in table
    const { data: allNotifs, error: allError } = await supabase
      .from('notifications')
      .select('*')
      .limit(50)
    
    console.log('📊 Total notifications in table:', allNotifs?.length || 0)
    if (allNotifs && allNotifs.length > 0) {
      console.log('📋 Sample notification user_ids:', allNotifs.slice(0, 5).map(n => n.user_id))
      console.log('🎯 Looking for user_id:', userId)
      console.log('✅ Matches found:', allNotifs.filter(n => n.user_id === userId).length)
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching notifications:', error)
      throw error
    }
    
    console.log('📬 Notifications for this user:', data?.length || 0, data)
    return data || []
  } catch (error) {
    console.error('❌ Error fetching notifications:', error)
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

// Announcement functions
export async function createAnnouncement({ title, message, type, targetAudience, eventId, userId }) {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title,
        message,
        type,
        target_audience: targetAudience,
        event_id: eventId || null,
        created_by: userId
      })
      .select()
      .single()

    if (error) throw error

    // Send notifications based on target audience
    try {
      if (targetAudience === 'all' || targetAudience === 'students') {
        console.log('📢 Creating notifications for announcement:', title)
        const { data: students, error: studentsError } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'student')

        if (studentsError) {
          console.error('⚠️ Error fetching students for announcement:', studentsError)
        } else if (students && students.length > 0) {
          const notifications = students.map(student => ({
            user_id: student.id,
            message: `📢 Announcement: ${title} - ${message}`,
            read: false
          }))

          const { error: notifError } = await supabase
            .from('notifications')
            .insert(notifications)
          
          if (notifError) {
            console.error('⚠️ Error creating announcement notifications:', notifError)
          } else {
            console.log(`✅ Created ${students.length} notifications for announcement: ${title}`)
          }
        }
      }
    } catch (notifError) {
      console.error('❌ Announcement notification failed:', notifError)
      // Don't fail announcement creation if notifications fail
    }

    return data
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function listAnnouncements(limit = 50) {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        profiles:created_by (
          first_name,
          last_name
        ),
        events:event_id (
          title
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return []
  }
}

export async function deleteAnnouncement(announcementId) {
  try {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', announcementId)

    if (error) throw error
    return { ok: true }
  } catch (error) {
    throw new Error(error.message)
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
