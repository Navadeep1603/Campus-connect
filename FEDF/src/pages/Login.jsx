import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [emailOrId, setEmailOrId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ emailOrId, password })
    } catch (err) {
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
                <linearGradient id="gradient1-hero" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#FF6B6B', stopOpacity: 1}} />
                  <stop offset="50%" style={{stopColor: '#4ECDC4', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#45B7D1', stopOpacity: 1}} />
                </linearGradient>
                <linearGradient id="gradient2-hero" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#A8E6CF', stopOpacity: 1}} />
                  <stop offset="50%" style={{stopColor: '#FFD93D', stopOpacity: 1}} />
                  <stop offset="100%" style={{stopColor: '#FF6B9D', stopOpacity: 1}} />
                </linearGradient>
              </defs>
              
              {/* First C */}
              <path
                d="M 100 40 A 50 50 0 1 1 100 140 A 50 50 0 0 0 100 60 A 30 30 0 1 0 100 120"
                fill="none"
                stroke="url(#gradient1-hero)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Second C */}
              <path
                d="M 140 70 A 30 30 0 1 1 140 110 A 30 30 0 0 0 140 80 A 20 20 0 1 0 140 100"
                fill="none"
                stroke="url(#gradient2-hero)"
                strokeWidth="12"
                strokeLinecap="round"
              />
            </svg>
          </div>
          
          <h2 className="hero-title">
            Campus <span className="highlight">Connect</span>
          </h2>
          <p className="hero-subtitle">
            Unleash Your Academic Success with Campus Connect's Excellence Platform
          </p>
          
          {/* Stats */}
          <div className="stats-grid mt-12">
            <div className="stat-card bg-white/10 backdrop-blur-sm">
              <div className="stat-number text-white">1000+</div>
              <div className="stat-label text-white/80">Students</div>
            </div>
            <div className="stat-card bg-white/10 backdrop-blur-sm">
              <div className="stat-number text-white">50+</div>
              <div className="stat-label text-white/80">Events</div>
            </div>
            <div className="stat-card bg-white/10 backdrop-blur-sm">
              <div className="stat-number text-white">100+</div>
              <div className="stat-label text-white/80">Clubs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex items-center justify-center p-8 md:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome</h1>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg animate-slide-down">
                {error}
              </div>
            )}

            {/* College ID/Email Input */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">
                Clg ID or email
              </label>
              <input
                type="text"
                value={emailOrId}
                onChange={e => setEmailOrId(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none"
                placeholder="2400030987 or email@kluniversity.in"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none"
                placeholder="••••••••••••"
                required
              />
              <div className="mt-2 text-right">
                <a href="#" className="text-sm text-brand-600 hover:text-brand-700 hover:underline">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">or</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              className="btn btn-outline w-full"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>

            {/* Sign Up Link */}
            <div className="text-center text-sm text-gray-600 mt-6">
              Are you new?{' '}
              <a href="/register" className="text-brand-600 hover:text-brand-700 font-medium hover:underline">
                Create an Account
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        /* Logo styling */
        .logo-svg-login {
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
          animation: logo-float-login 3s ease-in-out infinite;
        }

        @keyframes logo-float-login {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        /* Animated gradient background */
        .animated-gradient-bg {
          background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
          background-size: 400% 400%;
          animation: gradient-shift 15s ease infinite;
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Floating colorful shapes */
        .floating-shapes-login {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
        }

        .shape-login {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.4;
          animation: float-shape-login 20s ease-in-out infinite;
        }

        .shape-login-1 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          top: -10%;
          left: -10%;
          animation-delay: 0s;
        }

        .shape-login-2 {
          width: 350px;
          height: 350px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          bottom: -10%;
          right: -10%;
          animation-delay: 5s;
        }

        .shape-login-3 {
          width: 300px;
          height: 300px;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          top: 40%;
          left: 30%;
          animation-delay: 10s;
        }

        .shape-login-4 {
          width: 280px;
          height: 280px;
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          bottom: 20%;
          left: 10%;
          animation-delay: 15s;
        }

        @keyframes float-shape-login {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(50px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-30px, 30px) scale(0.9);
          }
        }
      `}</style>
    </div>
  )
}
