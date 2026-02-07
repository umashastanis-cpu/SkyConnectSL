'use client'

import { FiDownload, FiSmartphone } from 'react-icons/fi'

export default function Download() {
  return (
    <section id="download" className="py-20 px-4 bg-gradient-to-br from-blue-50 via-emerald-50 to-amber-50">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-gradient-hero rounded-3xl overflow-hidden shadow-card">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="p-12 text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Download SkyConnect SL Today
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Start your Sri Lankan adventure with the most trusted travel platform. 
                Available on iOS and Android.
              </p>

              {/* App Store Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a
                  href="#"
                  className="bg-black text-white rounded-xl px-6 py-4 flex items-center 
                           gap-3 hover:bg-gray-900 transition-colors group"
                >
                  <div className="text-3xl">📱</div>
                  <div>
                    <div className="text-xs">Download on the</div>
                    <div className="text-lg font-bold">App Store</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="bg-black text-white rounded-xl px-6 py-4 flex items-center 
                           gap-3 hover:bg-gray-900 transition-colors group"
                >
                  <div className="text-3xl">🤖</div>
                  <div>
                    <div className="text-xs">GET IT ON</div>
                    <div className="text-lg font-bold">Google Play</div>
                  </div>
                </a>
              </div>

              {/* QR Code Section */}
              <div className="bg-white/20 backdrop-blur rounded-2xl p-6 inline-block">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center">
                    <div className="text-4xl">📲</div>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Scan QR Code</p>
                    <p className="text-sm opacity-90">Quick download link</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-sm opacity-90">Downloads</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">4.8★</div>
                  <div className="text-sm opacity-90">Rating</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-sm opacity-90">Partners</div>
                </div>
              </div>
            </div>

            {/* Right - Phone Mockup */}
            <div className="relative p-12 hidden lg:block">
              <div className="relative z-10">
                {/* Phone Frame */}
                <div className="bg-white rounded-[3rem] shadow-2xl p-4 max-w-sm mx-auto 
                              transform rotate-6 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-gradient-primary rounded-[2.5rem] p-6 text-white 
                                aspect-[9/19] flex flex-col">
                    {/* App Screenshot Mockup */}
                    <div className="text-center mb-4">
                      <div className="text-lg font-semibold mb-1">Good Morning 👋</div>
                      <div className="text-sm opacity-90">Where to today?</div>
                    </div>
                    
                    {/* Search */}
                    <div className="bg-white rounded-full px-4 py-3 text-gray-600 text-sm mb-4">
                      🔍 Search destinations...
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      {['🧭 Explore', '✈️ Tours', '🏨 Hotels', '🚗 Transport'].map((item, i) => (
                        <div
                          key={i}
                          className="bg-white/20 backdrop-blur rounded-xl flex items-center 
                                   justify-center text-sm font-semibold"
                        >
                          {item}
                        </div>
                      ))}
                    </div>

                    {/* Featured Card */}
                    <div className="bg-white rounded-xl p-3 mt-4 text-gray-900">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-2xl">🏝️</div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">Ella Adventure</div>
                          <div className="text-xs text-gray-600">From $120</div>
                        </div>
                        <div className="text-yellow-500 text-sm">★ 4.9</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-1/4 -right-8 w-32 h-32 bg-white/20 rounded-full 
                            blur-2xl"></div>
              <div className="absolute bottom-1/4 -left-8 w-32 h-32 bg-white/20 rounded-full 
                            blur-2xl"></div>
            </div>
          </div>
        </div>

        {/* Web Version CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Prefer to use on desktop?</p>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-primary-blue font-semibold 
                     hover:underline"
          >
            <FiSmartphone />
            Try Our Web Version
          </a>
        </div>
      </div>
    </section>
  )
}
