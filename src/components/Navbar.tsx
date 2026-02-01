'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/discover', label: 'Discover', icon: '🔍' },
  { href: '/feed', label: 'Feed', icon: '📝' },
  { href: '/events', label: 'Events', icon: '📅' },
  { href: '/messages', label: 'Messages', icon: '💬' },
  { href: '/friends', label: 'Friends', icon: '🤝' },
  { href: '/classes', label: 'Classes', icon: '📚' },
  { href: '/places', label: 'Places', icon: '📍' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/discover" className="flex items-center gap-2.5 group transition-all duration-300">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-msu-gradient rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all">
              <span className="text-white font-black text-lg md:text-xl">S</span>
            </div>
            <span className="text-xl md:text-2xl font-black text-gradient-primary tracking-tight hidden sm:inline">
              SpartanFinder
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/discover' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 relative group ${
                    isActive
                      ? 'text-msu-green bg-msu-green/5'
                      : 'text-foreground-muted hover:text-msu-green hover:bg-msu-green/5'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span className="text-sm">{item.icon}</span>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-msu-green rounded-full" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/profile"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                pathname === '/profile'
                  ? 'bg-msu-green/10 text-msu-green'
                  : 'hover:bg-background-elevated text-foreground-muted hover:text-msu-green'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-msu-gradient flex items-center justify-center text-white text-sm font-bold shadow-sm">
                👤
              </div>
              <span className="hidden md:inline font-semibold text-sm">Profile</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-foreground-subtle hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <span className="hidden sm:inline">Logout</span>
              <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex gap-2 pb-3 overflow-x-auto no-scrollbar -mx-4 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/discover' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-msu-gradient text-white shadow-lg'
                    : 'bg-background-elevated text-foreground-muted border border-glass-border'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
