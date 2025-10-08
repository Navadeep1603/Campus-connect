import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { signIn, signOut, getCurrentUser, signUp } from '../services/supabaseApi'
import { db } from '../services/api'

const AuthContext = createContext()

// Check if we have valid Supabase configuration
const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY

// Temporary bypass for testing - set to true to use mock API instead
const useSupabaseBypass = false

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (hasSupabaseConfig && !useSupabaseBypass) {
      // Supabase authentication
      const initializeAuth = async () => {
        try {
          const currentUser = await getCurrentUser()
          if (currentUser && currentUser.profile) {
            setUser({
              id: currentUser.id,
              name: `${currentUser.profile.first_name} ${currentUser.profile.last_name}`,
              email: currentUser.email,
              role: currentUser.profile.role,
              profile: currentUser.profile
            })
          }
        } catch (error) {
          console.error('Error initializing auth:', error)
        }
      }

      initializeAuth()

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const currentUser = await getCurrentUser()
          if (currentUser && currentUser.profile) {
            setUser({
              id: currentUser.id,
              name: `${currentUser.profile.first_name} ${currentUser.profile.last_name}`,
              email: currentUser.email,
              role: currentUser.profile.role,
              profile: currentUser.profile
            })
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      })

      return () => subscription.unsubscribe()
    } else {
      // Fallback to localStorage for mock API
      const cached = localStorage.getItem('auth:user')
      if (cached) setUser(JSON.parse(cached))
    }
  }, [])

  useEffect(() => {
    if (!hasSupabaseConfig) {
      // Only use localStorage when not using Supabase
      if (user) localStorage.setItem('auth:user', JSON.stringify(user))
      else localStorage.removeItem('auth:user')
    }
  }, [user])

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
          setUser({
            id: result.user.id,
            name: result.user.profile ? `${result.user.profile.first_name} ${result.user.profile.last_name}` : result.user.email,
            email: result.user.email,
            role: userRole,
            profile: result.user.profile
          })
          
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
      
      const found = db.users.find(u => 
        (u.email === emailOrId || u.collegeId === emailOrId) && u.password === password
      )
      
      if (!found) throw new Error('Invalid credentials')
      
      let userRole = found.role
      if (found.collegeId) {
        const digitCount = found.collegeId.replace(/\D/g, '').length
        if (digitCount === 5) {
          userRole = 'admin'
        } else if (digitCount === 10) {
          userRole = 'student'
        }
      }
      
      setUser({ id: found.id, name: found.name, email: found.email, role: userRole })
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
      
      // Save to localStorage
      try {
        localStorage.setItem('campus-connect-mock-db', JSON.stringify(db))
      } catch (error) {
        console.warn('Failed to save user to localStorage:', error)
      }
      
      console.log('Mock user created:', newUser)
      
      return { ok: true, message: 'Registration successful (mock)' }
    }
  }

  const logout = async () => {
    if (hasSupabaseConfig) {
      // Supabase logout
      try {
        await signOut()
        setUser(null)
        navigate('/login', { replace: true })
      } catch (error) {
        console.error('Error signing out:', error)
        setUser(null)
        navigate('/login', { replace: true })
      }
    } else {
      // Mock API logout
      setUser(null)
      navigate('/login', { replace: true })
    }
  }

  const value = useMemo(() => ({ user, login, logout, register }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
