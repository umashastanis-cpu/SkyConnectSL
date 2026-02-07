'use client'

import { FiCheck, FiShield, FiStar, FiZap, FiGlobe, FiHeart } from 'react-icons/fi'

export default function Features() {
  const features = [
    {
      icon: <FiShield className="w-8 h-8" />,
      title: 'Verified Partners',
      description: 'Every service provider is personally verified and approved by our team for your safety.',
      color: 'bg-blue-50 text-primary-blue border-2 border-blue-100',
    },
    {
      icon: <FiStar className="w-8 h-8" />,
      title: 'Authentic Experiences',
      description: 'Connect with local experts who know Sri Lanka like the back of their hand.',
      color: 'bg-emerald-50 text-primary-green border-2 border-emerald-100',
    },
    {
      icon: <FiZap className="w-8 h-8" />,
      title: 'Instant Booking',
      description: 'Book tours, hotels, and transport in seconds. No more endless phone calls.',
      color: 'bg-amber-50 text-accent-gold border-2 border-amber-100',
    },
    {
      icon: <FiGlobe className="w-8 h-8" />,
      title: 'All-in-One Platform',
      description: 'Tours, hotels, transport, and activities - everything you need in one app.',
      color: 'bg-cyan-50 text-cyan-600 border-2 border-cyan-100',
    },
    {
      icon: <FiHeart className="w-8 h-8" />,
      title: 'Personalized Recommendations',
      description: 'AI-powered suggestions based on your preferences and travel style.',
      color: 'bg-rose-50 text-rose-600 border-2 border-rose-100',
    },
    {
      icon: <FiCheck className="w-8 h-8" />,
      title: 'Transparent Pricing',
      description: 'No hidden fees. What you see is what you pay. Simple and honest.',
      color: 'bg-orange-50 text-orange-600 border-2 border-orange-100',
    },
  ]

  return (
    <section id="features" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="section-title">Why Choose SkyConnect?</h2>
          <p className="section-subtitle">
            Everything you need for an unforgettable Sri Lankan adventure
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group card-travel p-8 hover:border-primary-blue 
                       hover:-translate-y-2 transition-all duration-300 cursor-pointer"
            >
              <div className={`w-16 h-16 ${feature.color} rounded-xl flex items-center justify-center mb-6 
                            group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-hero text-white rounded-3xl p-12 max-w-4xl mx-auto shadow-card">
            <h3 className="text-3xl font-bold mb-4">Ready to explore Sri Lanka?</h3>
            <p className="text-lg mb-8 opacity-95">
              Join thousands of travelers who trust SkyConnect SL for their Sri Lankan adventures
            </p>
            <a href="#download" className="bg-gradient-cta text-white font-bold py-4 px-10 
                                         rounded-full hover:shadow-card hover:scale-105 transition-all 
                                         inline-block uppercase tracking-wide text-sm">
              Start Your Journey
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
