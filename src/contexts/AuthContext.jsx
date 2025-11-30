import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, hasSupabaseConfig } from '../lib/supabase'
import { signIn, signUp } from '../services/supabaseApi'
import { db, reloadDb } from '../services/api'

const AuthContext = createContext()

// Temporary bypass for testing - set to true to use mock API instead
const useSupabaseBypass = false  // Using Supabase cloud storage

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Safety timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('Auth loading timeout - forcing completion')
      setLoading(false)
    }, 5000)

    if (hasSupabaseConfig && !useSupabaseBypass) {
      // Supabase authentication
      const initializeAuth = async () => {
        try {
          // First check localStorage for saved user
          const savedUser = localStorage.getItem('campus-connect-user')
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser)
              console.log('Restored user from localStorage:', parsedUser)
              setUser(parsedUser)
              setLoading(false)
              return
            } catch (parseError) {
              console.error('Failed to parse saved user:', parseError)
              localStorage.removeItem('campus-connect-user')
            }
          }

          // If no saved user, check Supabase
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            // Get user profile to get role
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single()
            
            const userObj = {
              id: user.id,
              email: user.email,
              name: profile ? `${profile.first_name} ${profile.last_name}` : user.email,
              role: profile?.role || 'student',
              profile
            }
            setUser(userObj)
            localStorage.setItem('campus-connect-user', JSON.stringify(userObj))
          }
        } catch (error) {
          console.error('Auth initialization error:', error)
        } finally {
          setLoading(false)
          clearTimeout(loadingTimeout)
        }
      }
      
      initializeAuth()
      
      try {
        const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
          if (session?.user) {
            // Update localStorage when auth state changes
            const savedUser = localStorage.getItem('campus-connect-user')
            if (savedUser) {
              setUser(JSON.parse(savedUser))
            }
          } else {
            setUser(null)
            localStorage.removeItem('campus-connect-user')
          }
        })
        
        return () => {
          clearTimeout(loadingTimeout)
          if (subscription && typeof subscription.unsubscribe === 'function') {
            subscription.unsubscribe()
          }
        }
      } catch (error) {
        console.error('Failed to set up auth state change listener:', error)
        setLoading(false)
        clearTimeout(loadingTimeout)
        return () => {
          clearTimeout(loadingTimeout)
        }
      }
    } else {
      // Mock authentication - check localStorage
      const savedUser = localStorage.getItem('campus-connect-user')
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          console.log('Restored user from localStorage (mock):', parsedUser)
          setUser(parsedUser)
        } catch (error) {
          console.error('Failed to parse saved user:', error)
          localStorage.removeItem('campus-connect-user')
        }
      }
      setLoading(false)
      clearTimeout(loadingTimeout)
    }
    
    return () => clearTimeout(loadingTimeout)
  }, [])

  const login = async ({ emailOrId, password }) => {
    console.log('Login attempt started with:', emailOrId)
    
    if (hasSupabaseConfig && !useSupabaseBypass) {
      // Supabase authentication
      try {
        let email = emailOrId
        
        if (!emailOrId.includes('@')) {
          throw new Error('Please use your email address to login')
        }

        console.log('Calling signIn function...')
        const result = await signIn({ email, password })
        console.log('SignIn result:', result)
        
        if (result.ok) {
          // Check if user has a profile, if not, default to student
          const userRole = result.user.profile?.role || 'student'
          console.log('Login successful, user role:', userRole)
          console.log('Redirecting to:', userRole === 'student' ? '/student' : '/admin')
          
          // Set user state before navigation
          const userObj = {
            id: result.user.id,
            name: result.user.profile ? `${result.user.profile.first_name} ${result.user.profile.last_name}` : result.user.email,
            email: result.user.email,
            role: userRole,
            profile: result.user.profile
          }
          setUser(userObj)
          localStorage.setItem('campus-connect-user', JSON.stringify(userObj))
          
          navigate(userRole === 'student' ? '/student' : '/admin', { replace: true })
        } else {
          throw new Error('Login failed')
        }
      } catch (error) {
        console.error('Login error:', error)
        throw new Error(error.message)
      }
    } else {
      // Mock API authentication
      await new Promise((r) => setTimeout(r, 400))
      
      // IMPORTANT: Reload database to get newly registered users
      const currentDb = reloadDb()
      console.log('Checking login against database with', currentDb.users.length, 'users')
      
      const found = currentDb.users.find(u => 
        (u.email === emailOrId || u.collegeId === emailOrId) && u.password === password
      )
      
      console.log('Login attempt for:', emailOrId)
      console.log('User found:', found ? 'Yes' : 'No')
      if (found) {
        console.log('Found user details:', { email: found.email, role: found.role, collegeId: found.collegeId })
      }
      
      if (!found) throw new Error('Invalid credentials')
      
      // Use stored role, but validate with collegeId pattern if needed
      let userRole = found.role
      
      // If role isn't set or is undefined, determine from collegeId
      if (!userRole && found.collegeId) {
        const digitCount = found.collegeId.replace(/\D/g, '').length
        if (digitCount === 5 || found.collegeId.toUpperCase().includes('ADMIN')) {
          userRole = 'admin'
        } else if (digitCount === 10) {
          userRole = 'student'
        } else {
          userRole = 'student' // default
        }
      }
      
      // Ensure we have a valid role
      if (!userRole) userRole = 'student'
      
      console.log('Login successful for:', found.email, 'Role:', userRole, 'College ID:', found.collegeId)
      
      const userObj = { id: found.id, name: found.name, email: found.email, role: userRole, collegeId: found.collegeId }
      setUser(userObj)
      localStorage.setItem('campus-connect-user', JSON.stringify(userObj))
      navigate(userRole === 'student' ? '/student' : '/admin', { replace: true })
    }
  }

  const register = async ({ collegeId, email, firstName, lastName, password, role = 'student' }) => {
    console.log('AuthContext register called with:', { collegeId, email, firstName, lastName, role })
    
    if (hasSupabaseConfig && !useSupabaseBypass) {
      try {
        console.log('Using Supabase registration...')
        const result = await signUp({ collegeId, email, firstName, lastName, password, role })
        console.log('Supabase registration result:', result)
        return result
      } catch (error) {
        console.error('Supabase registration error:', error)
        throw new Error(error.message)
      }
    } else {
      // Mock registration - add user to mock database
      console.log('Using mock registration...')
      
      // Check if user already exists
      if (db.users.find(u => u.email === email || u.collegeId === collegeId)) {
        throw new Error('Email or College ID already registered')
      }
      
      // Add user to mock database
      const newUser = {
        id: String(Date.now()), // Simple ID generation
        collegeId,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        email,
        password,
        role
      }
      
      db.users.push(newUser)
      
      // Send notification to all admins about new student registration
      if (role === 'student') {
        const admins = db.users.filter(u => u.role === 'admin')
        admins.forEach(admin => {
          const notification = {
            id: String(Date.now() + Math.random()),
            userId: admin.id,
            message: `👤 New student registered: ${firstName} ${lastName} (${email})`,
            read: false,
            createdAt: new Date().toISOString()
          }
          if (!db.notifications) db.notifications = []
          db.notifications.push(notification)
        })
        console.log(`✅ Created ${admins.length} admin notifications for new student registration`)
      }
      
      // Save to localStorage
      try {
        localStorage.setItem('campus-connect-mock-db', JSON.stringify(db))
        console.log('✅ User saved to localStorage successfully')
      } catch (error) {
        console.warn('Failed to save user to localStorage:', error)
      }
      
      console.log('✅ Mock user created with role:', role)
      console.log('✅ User details:', { email, collegeId, role, firstName, lastName })
      console.log('✅ Total users in database:', db.users.length)
      
      return { ok: true, message: 'Registration successful (mock)' }
    }
  }

  const logout = async () => {
    console.log('Logout clicked')
    
    if (hasSupabaseConfig && !useSupabaseBypass) {
      // Supabase logout
      try {
        console.log('Attempting Supabase logout...')
        await signOut()
        setUser(null)
        localStorage.removeItem('campus-connect-user')
        console.log('Supabase logout successful')
        navigate('/login', { replace: true })
      } catch (error) {
        console.error('Error signing out:', error)
        setUser(null)
        localStorage.removeItem('campus-connect-user')
        navigate('/login', { replace: true })
      }
    } else {
      // Mock API logout
      console.log('Mock API logout')
      setUser(null)
      localStorage.removeItem('campus-connect-user')
      navigate('/login', { replace: true })
    }
  }

  const value = { user, loading, login, logout, register }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
