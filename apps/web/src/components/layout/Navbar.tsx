'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Shield, Menu, X, ChevronDown, LogOut, User, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const { user, logout, isClinic } = useAuth()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const isHome = pathname === '/'

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled || !isHome
        ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'
        : 'bg-transparent'
    )}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-gradient-to-br from-[#1e3a5f] to-[#14b8a6] rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className={cn(
            'font-bold text-xl tracking-tight transition-colors',
            scrolled || !isHome ? 'text-[#1e3a5f]' : 'text-white'
          )}>
            MedTour<span className="text-teal-500">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { href: '/search', label: 'Find a Clinic' },
            { href: '/how-it-works', label: 'How It Works' },
            { href: '/clinics', label: 'For Clinics' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-teal-500',
                scrolled || !isHome ? 'text-slate-600' : 'text-white/90',
                pathname === item.href && 'text-teal-500'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  scrolled || !isHome
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-white hover:bg-white/10'
                )}
              >
                <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.email[0].toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{user.email.split('@')[0]}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                  </div>
                  {isClinic ? (
                    <Link href="/clinic/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setProfileOpen(false)}>
                      <LayoutDashboard className="w-4 h-4 text-teal-500" /> Clinic Dashboard
                    </Link>
                  ) : (
                    <Link href="/patient/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setProfileOpen(false)}>
                      <User className="w-4 h-4 text-teal-500" /> My Dashboard
                    </Link>
                  )}
                  <button onClick={() => { logout(); setProfileOpen(false) }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className={cn(
                'text-sm font-medium transition-colors px-4 py-2 rounded-xl',
                scrolled || !isHome ? 'text-slate-600 hover:text-[#1e3a5f]' : 'text-white/90 hover:text-white'
              )}>
                Sign In
              </Link>
              <Link href="/auth/register" className="btn-teal text-sm py-2.5 px-5">
                Get Started Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={cn('md:hidden p-2 rounded-lg', scrolled || !isHome ? 'text-slate-700' : 'text-white')}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-xl">
          <div className="px-4 py-4 space-y-1">
            {[
              { href: '/search', label: 'Find a Clinic' },
              { href: '/how-it-works', label: 'How It Works' },
              { href: '/clinics', label: 'For Clinics' },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="block px-4 py-3 text-slate-700 hover:text-teal-600 font-medium rounded-xl hover:bg-slate-50" onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2 border-t border-slate-100 mt-3">
              {user ? (
                <button onClick={() => { logout(); setMobileOpen(false) }} className="btn-secondary w-full justify-center text-sm">Sign Out</button>
              ) : (
                <>
                  <Link href="/auth/login" className="btn-secondary w-full justify-center text-sm" onClick={() => setMobileOpen(false)}>Sign In</Link>
                  <Link href="/auth/register" className="btn-teal w-full justify-center text-sm" onClick={() => setMobileOpen(false)}>Get Started Free</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
