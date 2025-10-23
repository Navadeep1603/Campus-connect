import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    collegeId: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    let updatedData = { ...formData, [name]: value }
    
    // Auto-set role based on collegeId pattern
    if (name === 'collegeId') {
      const upperValue = value.toUpperCase()
      if (upperValue.includes('ADMIN') || upperValue.startsWith('ADM')) {
        updatedData.role = 'admin'
      } else {
        const digitCount = value.replace(/\D/g, '').length
        if (digitCount === 5) {
          updatedData.role = 'admin'
        } else if (digitCount === 10) {
          updatedData.role = 'student'
        } else {
          updatedData.role = 'student' // default to student
        }
      }
    }
    
    setFormData(updatedData)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.collegeId || !formData.email || !formData.firstName || !formData.lastName || !formData.password || !formData.confirmPassword) {
      setError('All fields are required')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      console.log('Attempting to register user with data:', {
        collegeId: formData.collegeId,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      })
      
      await register({
        collegeId: formData.collegeId,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        role: formData.role
      })
      
      console.log('Registration successful!')
      alert('Account created successfully! Please login.')
      navigate('/login')
    } catch (err) {
      console.error('Registration error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-[55%_45%] bg-light">
      {/* Left Panel - Hero Section */}
      <div className="hero-section hidden md:flex items-center justify-center">
        <div className="max-w-lg relative z-10 text-center">
          {/* CC Logo SVG */}
          <div className="mb-8 flex justify-center">
            <svg className="logo-svg-login" viewBox="0 0 200 200" width="120" height="120">
              <defs>
                <linearGradient id="gradient1-register" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#FF6B6B', stopOpacity: 1}} />
                  <stop offset="50%" style={{stopColor: '#4ECDC4', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#45B7D1', stopOpacity: 1}} />
                </linearGradient>
                <linearGradient id="gradient2-register" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#A8E6CF', stopOpacity: 1}} />
                  <stop offset="50%" style={{stopColor: '#FFD93D', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#FF6B9D', stopOpacity: 1}} />
                </linearGradient>
              </defs>
              
              {/* First C */}
              <path
                d="M 100 40 A 50 50 0 1 1 100 140 A 50 50 0 0 0 100 60 A 30 30 0 1 0 100 120"
                fill="none"
                stroke="url(#gradient1-register)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Second C */}
              <path
                d="M 140 70 A 30 30 0 1 1 140 110 A 30 30 0 0 0 140 80 A 20 20 0 1 0 140 100"
                fill="none"
                stroke="url(#gradient2-register)"
                strokeWidth="12"
                strokeLinecap="round"
              />
            </svg>
          </div>
          
          <h2 className="hero-title">
            Join <span className="highlight">Campus Connect</span>
          </h2>
          <p className="hero-subtitle">
            Start your journey to academic excellence and community engagement
          </p>
          
          {/* Benefits */}
          <div className="mt-12 space-y-4 text-left max-w-sm mx-auto">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">🎯</div>
              <span className="text-lg">Explore and register for events</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">🏆</div>
              <span className="text-lg">Track your achievements</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">🔔</div>
              <span className="text-lg">Get real-time notifications</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex items-center justify-center p-8 md:p-12 bg-white overflow-y-auto">
        <form onSubmit={onSubmit} className="w-full max-w-md">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Sign up to get started with Campus Connect</p>
          </div>

          {error && <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg animate-slide-down mb-5">{error}</div>}

          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Clg ID *</label>
              <input 
                type="text" 
                name="collegeId"
                value={formData.collegeId} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none" 
                placeholder="5 digits for Admin, 10 digits for Student"
                required
              />
              {formData.collegeId && (
                <p className="mt-2 text-xs text-gray-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                  Role: <span className="font-bold text-orange-600">{formData.role === 'admin' ? '👨‍💼 Admin' : '🎓 Student'}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">First Name *</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none" 
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Last Name *</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none" 
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Email *</label>
              <input 
                type="email" 
                name="email"
                value={formData.email} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none" 
                placeholder="you@college.edu"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Create Password *</label>
              <input 
                type="password" 
                name="password"
                value={formData.password} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none" 
                placeholder="••••••••"
                required
              />
              <p className="mt-2 text-xs text-gray-500">Minimum 6 characters</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Confirm Password *</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none" 
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              disabled={loading} 
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="text-center text-sm text-gray-600 pt-4">
              Already have an account? <a className="text-orange hover:underline font-medium" href="/login">Sign in</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
