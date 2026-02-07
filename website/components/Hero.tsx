'use client'

import { FiDownload, FiPlay } from 'react-icons/fi'

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-emerald-50 to-amber-50 -z-10"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary-green rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-primary-blue rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent-gold rounded-full mix-blend-multiply filter blur-2xl opacity-10"></div>

      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fadeInUp">
            <div className="inline-block">
              <span className="glass text-primary-blue px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-soft border border-primary-blue/20">
                🇱🇰 Proudly Sri Lankan
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Your Gateway to
              <span className="gradient-text"> Authentic </span>
              Sri Lankan Experiences
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              Connect with verified local service providers. Discover tours, hotels, 
              and authentic experiences across the Pearl of the Indian Ocean.
            </p>

            {/* Stats */}
            <div className="flex gap-8 py-4">
              <div>
                <div className="text-3xl font-bold gradient-text">500+</div>
                <div className="text-gray-600">Verified Partners</div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text">1000+</div>
                <div className="text-gray-600">Happy Travelers</div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text">4.8★</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <a href="#download" className="btn-primary flex items-center gap-2">
                <FiDownload />
                Download App
              </a>
              <button className="btn-secondary flex items-center gap-2">
                <FiPlay />
                Watch Demo
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4 pt-4">
              <img src="https://img.shields.io/badge/Trusted%20by-SLTDA-blue" alt="SLTDA" className="h-8" />
              <img src="https://img.shields.io/badge/Rating-4.8%2F5-green" alt="Rating" className="h-8" />
            </div>
          </div>

          {/* Right Content - App Mockup */}
          <div className="relative animate-fadeInUp delay-200">
            <div className="relative z-10">
              {/* Phone Mockup */}
              <div className="bg-white rounded-3xl shadow-card p-4 mx-auto max-w-sm ring-1 ring-gray-200">
                <div className="bg-gradient-hero rounded-2xl p-6 text-white">
                  <div className="text-center mb-6">
                    <div className="text-lg font-semibold mb-1">Good Morning, Traveler 👋</div>
                    <div className="text-sm opacity-90">Where do you want to go today?</div>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="bg-white rounded-full px-4 py-3 text-gray-600 mb-6">
                    🔍 Search destinations, hotels...
                  </div>

                  {/* Quick Actions Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">🧭</div>
                      <div className="text-sm font-semibold">Explore</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">✈️</div>
                      <div className="text-sm font-semibold">Tours</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">🏨</div>
                      <div className="text-sm font-semibold">Hotels</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">🚗</div>
                      <div className="text-sm font-semibold">Transport</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-6 -right-6 glass rounded-2xl shadow-card p-4 max-w-xs animate-pulse backdrop-blur-xl bg-white/80">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-green to-emerald-400 rounded-full flex items-center justify-center text-white shadow-soft">
                  ✅
                </div>
                <div>
                  <div className="font-bold text-sm text-neutral-charcoal">Verified Partners</div>
                  <div className="text-xs text-gray-600">100% Authentic</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 glass rounded-2xl shadow-card p-4 max-w-xs animate-pulse delay-500 backdrop-blur-xl bg-white/80">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-cta rounded-full flex items-center justify-center text-white shadow-soft">
                  💰
                </div>
                <div>
                  <div className="font-bold text-sm text-neutral-charcoal">Best Prices</div>
                  <div className="text-xs text-gray-600">Save up to 30%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
