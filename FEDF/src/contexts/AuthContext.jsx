import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const cached = localStorage.getItem('auth:user')
    if (cached) setUser(JSON.parse(cached))
  }, [])

  useEffect(() => {
    if (user) localStorage.setItem('auth:user', JSON.stringify(user))
    else localStorage.removeItem('auth:user')
  }, [user])

  const login = async ({ emailOrId, password }) => {
    await new Promise((r) => setTimeout(r, 400))
    
    // Find user by email or collegeId
    const found = db.users.find(u => 
      (u.email === emailOrId || u.collegeId === emailOrId) && u.password === password
    )
    
    if (!found) throw new Error('Invalid credentials')
    
    // Auto-determine role based on collegeId digit count if not already set
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

  const logout = () => {
    setUser(null)
    navigate('/login', { replace: true })
  }

  const value = useMemo(() => ({ user, login, logout }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
