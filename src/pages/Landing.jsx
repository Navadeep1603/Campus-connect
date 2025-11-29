import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to login after animation completes (7 seconds)
    const timer = setTimeout(() => {
      navigate('/login')
    }, 7000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden animated-bg">
      {/* Colorful floating shapes */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>

      {/* Simple Logo Animation - Colorful Style */}
      <div className="text-center relative z-10">
        {/* Animated CC Logo */}
        <div className="logo-container">
          <svg className="logo-svg" viewBox="0 0 200 200" width="220" height="220">
            {/* Glow effect circle */}
            <circle cx="100" cy="90" r="70" fill="url(#glow)" className="glow-circle" opacity="0.3"/>
            
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#FF6B6B', stopOpacity: 1}} />
                <stop offset="50%" style={{stopColor: '#4ECDC4', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#45B7D1', stopOpacity: 1}} />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#A8E6CF', stopOpacity: 1}} />
                <stop offset="50%" style={{stopColor: '#FFD93D', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#FF6B9D', stopOpacity: 1}} />
              </linearGradient>
              <radialGradient id="glow">
                <stop offset="0%" style={{stopColor: '#4ECDC4', stopOpacity: 0.8}} />
                <stop offset="100%" style={{stopColor: '#45B7D1', stopOpacity: 0}} />
              </radialGradient>
            </defs>
            
            {/* First C - Colorful gradient */}
            <path
              className="letter-c first-c"
              d="M 100 40 A 50 50 0 1 1 100 140 A 50 50 0 0 0 100 60 A 30 30 0 1 0 100 120"
              fill="none"
              stroke="url(#gradient1)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Second C - Colorful gradient */}
            <path
              className="letter-c second-c"
              d="M 140 70 A 30 30 0 1 1 140 110 A 30 30 0 0 0 140 80 A 20 20 0 1 0 140 100"
              fill="none"
              stroke="url(#gradient2)"
              strokeWidth="12"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Brand Name - Fades in after logo with gradient */}
        <div className="brand-name">
          <h1 className="text-5xl font-bold tracking-tight gradient-text-animated">
            Campus Connect
          </h1>
          <p className="text-lg mt-2 text-gray-600 tagline">Your Academic Excellence Platform</p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        /* Animated gradient background */
        .animated-bg {
          background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
          background-size: 400% 400%;
          animation: gradient-shift 8s ease infinite;
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Floating colorful shapes */
        .floating-shapes {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.6;
          animation: float-shape 15s ease-in-out infinite;
        }

        .shape-1 {
          width: 300px;
          height: 300px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 250px;
          height: 250px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          top: 60%;
          right: 10%;
          animation-delay: 2s;
        }

        .shape-3 {
          width: 200px;
          height: 200px;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          bottom: 10%;
          left: 20%;
          animation-delay: 4s;
        }

        .shape-4 {
          width: 180px;
          height: 180px;
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          top: 30%;
          right: 25%;
          animation-delay: 1s;
        }

        .shape-5 {
          width: 220px;
          height: 220px;
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          bottom: 30%;
          right: 40%;
          animation-delay: 3s;
        }

        @keyframes float-shape {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }

        .logo-container {
          margin-bottom: 2rem;
        }

        .logo-svg {
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
        }

        /* Glow circle pulse */
        .glow-circle {
          animation: glow-pulse 2s ease-in-out infinite;
        }

        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        /* First C Animation - Draw from start */
        .first-c {
          stroke-dasharray: 300;
          stroke-dashoffset: 300;
          animation: draw-c 1.2s ease-out forwards;
        }

        /* Second C Animation - Draw with delay */
        .second-c {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: draw-c 1s ease-out 0.4s forwards;
        }

        @keyframes draw-c {
          to {
            stroke-dashoffset: 0;
          }
        }

        /* Logo pulse after drawing */
        .logo-svg {
          animation: logo-pulse 1s ease-in-out 1.5s, logo-rotate 2s ease-in-out 1.5s;
        }

        @keyframes logo-pulse {
          0%, 100% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.1) rotate(5deg);
          }
        }

        @keyframes logo-rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Gradient animated text */
        .gradient-text-animated {
          background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #667eea);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-text 3s ease infinite;
        }

        @keyframes gradient-text {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        /* Brand name fade in */
        .brand-name {
          opacity: 0;
          animation: fade-in-brand 0.8s ease-out 1.8s forwards;
        }

        @keyframes fade-in-brand {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Tagline animation */
        .tagline {
          opacity: 0;
          animation: fade-in 0.6s ease-out 2.2s forwards;
        }

        @keyframes fade-in {
          to {
            opacity: 1;
          }
        }

        /* Smooth fade out of entire page before redirect */
        @keyframes page-fade-out {
          to {
            opacity: 0;
          }
        }

        body {
          animation: page-fade-out 0.5s ease-out 6.5s forwards;
        }
      `}</style>
    </div>
  )
}
