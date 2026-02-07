'use client'

import { FiCheckCircle, FiDollarSign, FiTrendingUp, FiUsers } from 'react-icons/fi'

export default function Partners() {
  const benefits = [
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: 'Reach More Customers',
      description: 'Get discovered by thousands of travelers actively looking for experiences.',
    },
    {
      icon: <FiDollarSign className="w-8 h-8" />,
      title: 'Grow Your Revenue',
      description: 'Increase bookings with our commission-based model. Only pay when you earn.',
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: 'Boost Your Business',
      description: 'Access to marketing tools, analytics, and business growth resources.',
    },
    {
      icon: <FiCheckCircle className="w-8 h-8" />,
      title: 'Trusted Platform',
      description: 'Build credibility with our verification badge and customer reviews.',
    },
  ]

  return (
    <section id="partners" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="section-title">Partner With Us</h2>
          <p className="section-subtitle">
            Join hundreds of service providers growing their business with SkyConnect SL
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left - Benefits */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex gap-4 p-6 rounded-2xl hover:bg-gray-50 
                         transition-colors duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl 
                                flex items-center justify-center text-white">
                    {benefit.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right - Partner Types */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">
                Who Can Join?
              </h3>
              <div className="space-y-3">
                {[
                  { icon: '🏨', text: 'Hotels & Accommodations' },
                  { icon: '🧳', text: 'Tour Operators & Guides' },
                  { icon: '🚗', text: 'Transport Services' },
                  { icon: '🎯', text: 'Activity Providers' },
                  { icon: '🍽️', text: 'Restaurants & Cafes' },
                  { icon: '🎨', text: 'Experience Creators' },
                ].map((type, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-white rounded-xl p-4 
                             shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-3xl">{type.icon}</span>
                    <span className="font-semibold text-gray-800">{type.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Partner Application Form */}
        <div className="bg-gradient-primary rounded-3xl p-12 text-white max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-lg opacity-90">
              Fill out the form below and our team will reach out within 24 hours
            </p>
          </div>

          <form className="grid md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Your Name *"
              className="bg-white/20 backdrop-blur border border-white/30 rounded-xl 
                       px-6 py-4 text-white placeholder-white/70 focus:outline-none 
                       focus:border-white/50"
              required
            />
            <input
              type="text"
              placeholder="Business Name *"
              className="bg-white/20 backdrop-blur border border-white/30 rounded-xl 
                       px-6 py-4 text-white placeholder-white/70 focus:outline-none 
                       focus:border-white/50"
              required
            />
            <input
              type="email"
              placeholder="Email Address *"
              className="bg-white/20 backdrop-blur border border-white/30 rounded-xl 
                       px-6 py-4 text-white placeholder-white/70 focus:outline-none 
                       focus:border-white/50"
              required
            />
            <input
              type="tel"
              placeholder="Phone Number *"
              className="bg-white/20 backdrop-blur border border-white/30 rounded-xl 
                       px-6 py-4 text-white placeholder-white/70 focus:outline-none 
                       focus:border-white/50"
              required
            />
            <select
              className="bg-white/20 backdrop-blur border border-white/30 rounded-xl 
                       px-6 py-4 text-white focus:outline-none focus:border-white/50 
                       md:col-span-2"
              required
            >
              <option value="" className="text-gray-900">Select Service Type *</option>
              <option value="hotel" className="text-gray-900">Hotel / Accommodation</option>
              <option value="tour" className="text-gray-900">Tour Operator / Guide</option>
              <option value="transport" className="text-gray-900">Transport Service</option>
              <option value="activity" className="text-gray-900">Activity Provider</option>
              <option value="restaurant" className="text-gray-900">Restaurant / Cafe</option>
              <option value="other" className="text-gray-900">Other</option>
            </select>
            <textarea
              placeholder="Tell us about your business..."
              rows={4}
              className="bg-white/20 backdrop-blur border border-white/30 rounded-xl 
                       px-6 py-4 text-white placeholder-white/70 focus:outline-none 
                       focus:border-white/50 md:col-span-2"
            ></textarea>
            <button
              type="submit"
              className="bg-white text-primary-blue font-bold py-4 px-8 rounded-xl 
                       hover:shadow-lg transition-all md:col-span-2"
            >
              Submit Application
            </button>
          </form>

          <p className="text-center text-sm opacity-75 mt-6">
            By submitting, you agree to our Partner Terms & Conditions
          </p>
        </div>
      </div>
    </section>
  )
}
