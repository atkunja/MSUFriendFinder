'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'

/* =======================================================================
   SPARTANFINDER LANDING PAGE
   Premium, animated landing page with dynamic effects
   ======================================================================= */

// Animated counter hook
function useCountUp(target: number, duration: number = 2000, delay: number = 0) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (!started) return

    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * target))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [target, duration, started])

  return count
}

// Sample student profiles for preview
const SAMPLE_STUDENTS = [
  {
    name: 'Alaina N.',
    major: 'Business',
    year: "'26",
    status: 'Committed',
    location: 'From Detroit',
    tags: ['Rushing', 'Fitness'],
    bio: "Hi! My name's Alaina and I'm from metro Detroit. Super excited to meet fellow Spartans!",
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    name: 'Marcus T.',
    major: 'Engineering',
    year: "'27",
    status: 'Committed',
    location: 'From Chicago',
    tags: ['Gaming', 'Night Owl'],
    bio: "Yo, I'm Marcus and I'm from Chicago. Looking for study partners and gaming buddies.",
    gradient: 'from-blue-400 to-indigo-500',
  },
  {
    name: 'Priya M.',
    major: 'Biology',
    year: "'28",
    status: 'Committed',
    location: 'From Ohio',
    tags: ['Pre-Med', 'Hiking'],
    bio: "Hey everyone, my name is Priya and I am from Cleveland, OH. I'll be living in...",
    gradient: 'from-purple-400 to-pink-500',
  },
]

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const heroRef = useRef<HTMLDivElement>(null)

  // Parallax mouse tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!heroRef.current) return
    const rect = heroRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height
    setMousePosition({ x, y })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  // Stats counter
  const memberCount = useCountUp(4892, 2500, 800)

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Grain Overlay */}
      <div className="grain-overlay" />

      {/* Animated Background - Gradient Orbs with Parallax */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
          transition: 'transform 0.4s ease-out',
        }}
      >
        {/* Primary Orb */}
        <div
          className="absolute top-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(24, 69, 59, 0.25) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'pulse-glow 4s ease-in-out infinite',
          }}
        />
        {/* Secondary Orb */}
        <div
          className="absolute bottom-[-20%] left-[-15%] w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(61, 107, 94, 0.2) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animation: 'pulse-glow 5s ease-in-out infinite',
            animationDelay: '1s',
          }}
        />
        {/* Accent Orb */}
        <div
          className="absolute top-[30%] left-[50%] w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(201, 169, 98, 0.1) 0%, transparent 60%)',
            filter: 'blur(60px)',
            animation: 'floatSlow 8s ease-in-out infinite',
          }}
        />
      </div>

      {/* Animated Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(24, 69, 59, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(24, 69, 59, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Navigation */}
      <nav className="relative z-20 flex justify-between items-center px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-msu-gradient rounded-xl flex items-center justify-center shadow-lg animate-fade-in">
            <span className="text-white font-display font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-display font-bold text-gradient-primary tracking-tight hidden sm:block animate-fade-in">
            SpartanFinder
          </span>
        </div>

        <div className="flex items-center gap-4 md:gap-6 animate-fade-in">
          <Link
            href="/login"
            className="text-xs font-semibold uppercase tracking-widest text-foreground-muted hover:text-msu-green transition-colors"
          >
            Log In
          </Link>
          <Link href="/signup" className="btn-prestige !py-3 !px-6 md:!px-8 text-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main ref={heroRef} className="relative z-10 px-6 md:px-12 pt-12 md:pt-16 pb-16 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">

          {/* Animated Ring Behind Badge */}
          <div className="relative mb-8 animate-fade-in">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, #18453B, #3D6B5E, #C9A962, #18453B)',
                filter: 'blur(20px)',
                opacity: 0.3,
                animation: 'rotate 8s linear infinite',
              }}
            />
            <div className="relative inline-flex items-center gap-3 glass-panel !border-msu-green/20 px-5 py-2.5 rounded-full">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-msu-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-msu-green"></span>
              </span>
              <span className="text-label text-msu-green">
                Free Friend & Roommate Finder
              </span>
            </div>
          </div>

          {/* Main Heading with Animated Underline */}
          <div className="relative mb-6">
            <h1 className="text-display-xl text-foreground animate-fade-in reveal-delay-1">
              Easily Find Your{' '}
              <span className="relative inline-block text-gradient-primary">
                Spartans
                {/* Animated underline */}
                <span
                  className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-msu-green to-msu-green-light rounded-full"
                  style={{
                    animation: 'expandWidth 1s ease-out 0.8s forwards',
                    width: '0%',
                  }}
                />
              </span>
            </h1>
          </div>

          {/* Subheading */}
          <p className="text-subheading max-w-2xl mb-8 animate-fade-in reveal-delay-2">
            We understand the importance of finding the right students to share your college journey with.
            Connect with future classmates before you even step on campus.
          </p>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-8 mb-10 animate-fade-in reveal-delay-3">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['🧑‍🎓', '👩‍🎓', '👨‍🎓', '👩‍💻'].map((emoji, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-msu-green/10 flex items-center justify-center border-2 border-background text-sm"
                  >
                    {emoji}
                  </div>
                ))}
              </div>
              <p className="text-sm text-foreground-muted">
                <span className="font-mono font-bold text-msu-green">{memberCount.toLocaleString()}+</span> Spartans joined
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-20 animate-fade-in reveal-delay-4">
            <Link href="/signup" className="btn-prestige !px-10 !py-4 text-base shadow-xl group">
              View Community
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/login" className="btn-secondary-prestige !px-8 !py-4 text-base">
              I Have an Account
            </Link>
          </div>

          {/* Student Profile Preview Cards */}
          <div className="w-full max-w-5xl">
            <p className="text-label text-center mb-8 animate-fade-in reveal-delay-4">
              Meet Your Future Friends
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SAMPLE_STUDENTS.map((student, index) => (
                <div
                  key={student.name}
                  className="card-profile !p-0 overflow-hidden group"
                  style={{
                    animation: `slideUp 0.6s ease-out ${0.5 + index * 0.15}s forwards`,
                    opacity: 0,
                  }}
                >
                  {/* Profile Image with Gradient */}
                  <div className={`relative h-44 bg-gradient-to-br ${student.gradient} flex items-center justify-center overflow-hidden`}>
                    {/* Animated circles */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div
                        className="absolute w-32 h-32 rounded-full bg-white/10 -top-10 -left-10"
                        style={{ animation: 'float 6s ease-in-out infinite' }}
                      />
                      <div
                        className="absolute w-24 h-24 rounded-full bg-white/10 bottom-5 right-5"
                        style={{ animation: 'float 5s ease-in-out infinite', animationDelay: '1s' }}
                      />
                    </div>

                    {/* Avatar */}
                    <div className="relative w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform duration-500">
                      👤
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-background-elevated via-transparent to-transparent" />
                  </div>

                  {/* Profile Info */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {student.name}
                      </h3>
                      <span className="flex items-center gap-1 text-xs font-medium text-msu-green bg-msu-green/10 px-2 py-0.5 rounded-full">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {student.status}
                      </span>
                    </div>

                    <p className="text-body-sm text-sm mb-3">
                      🎓 {student.major} {student.year}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600">
                        📍 {student.location}
                      </span>
                      {student.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-msu-green/10 text-msu-green"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Bio */}
                    <p className="text-body-sm text-sm line-clamp-2">
                      {student.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-glass-border py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-msu-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">S</span>
              </div>
              <span className="text-lg font-display font-semibold text-gradient-primary">
                SpartanFinder
              </span>
            </div>

            <div className="flex items-center gap-8 text-body-sm">
              <Link href="/about" className="hover:text-msu-green transition-colors">
                About
              </Link>
              <Link href="/privacy" className="hover:text-msu-green transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-msu-green transition-colors">
                Terms
              </Link>
            </div>

            <p className="text-sm text-foreground-subtle">
              © {new Date().getFullYear()} SpartanFinder. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Additional Animation Keyframes */}
      <style jsx>{`
        @keyframes expandWidth {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, -30px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
