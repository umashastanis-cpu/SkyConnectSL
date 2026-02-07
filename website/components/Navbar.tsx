'use client'

import { useState, useEffect } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, userRole, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const getUserInitial = () => {
    return user?.email?.charAt(0).toUpperCase() || 'U'
  }

  const getRoleBadge = () => {
    if (userRole === 'admin') return '👑'
    if (userRole === 'partner') return '🏢'
    if (userRole === 'traveler') return '✈️'
    return ''
  }

  const navLinks = user ? [
    { name: 'Browse Listings', href: '/listings' },
  ] : [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Destinations', href: '#destinations' },
    { name: 'For Partners', href: '#partners' },
    { name: 'Download', href: '#download' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold">
              <span className="gradient-text">SkyConnect SL</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-neutral-charcoal hover:text-primary-blue font-medium transition-colors 
                         relative after:absolute after:bottom-0 after:left-0 after:h-0.5 
                         after:w-0 hover:after:w-full after:bg-primary-blue after:transition-all"
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <>
                {userRole === 'partner' && (
                  <>
                    <Link href="/partner/listings" className="text-neutral-charcoal hover:text-primary-blue font-medium">
                      My Listings
                    </Link>
                    <Link href="/partner/create-listing" className="text-neutral-charcoal hover:text-primary-blue font-medium">
                      Create
                    </Link>
                  </>
                )}
                {userRole === 'admin' && (
                  <Link href="/admin/dashboard" className="text-neutral-charcoal hover:text-primary-blue font-medium">
                    Admin
                  </Link>
                )}
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-primary text-white font-medium hover:shadow-lg transition-all"
                  >
                    <span>{getRoleBadge()}</span>
                    <span className="w-7 h-7 bg-white text-primary-blue rounded-full flex items-center justify-center font-bold text-sm">
                      {getUserInitial()}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 border">
                      <div className="px-4 py-2 border-b">
                        <p className="text-xs text-gray-500">Signed in</p>
                        <p className="font-medium truncate text-sm">{user.email}</p>
                      </div>
                      <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => setShowUserMenu(false)}>
                        🏠 Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm"
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-neutral-charcoal hover:text-primary-blue font-medium">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 hover:text-primary-blue"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 bg-white rounded-b-lg shadow-lg">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 hover:text-primary-blue"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="px-4 pt-2">
              <a href="#download" className="btn-primary block text-center">
                Get Started
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
