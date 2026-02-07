'use client'

import { FiStar } from 'react-icons/fi'

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      country: '🇬🇧 United Kingdom',
      rating: 5,
      text: 'SkyConnect SL made our Sri Lanka trip absolutely perfect! We found an amazing tour guide in Ella through the app. Highly recommended!',
      avatar: '👩',
    },
    {
      name: 'Michael Chen',
      country: '🇺🇸 United States',
      rating: 5,
      text: 'Best travel app I\'ve used. All our bookings in one place, verified partners, and transparent pricing. Saved us so much time and hassle!',
      avatar: '👨',
    },
    {
      name: 'Priya Sharma',
      country: '🇮🇳 India',
      rating: 5,
      text: 'As a solo female traveler, safety was my priority. SkyConnect\'s verified partners gave me peace of mind. Had the most amazing experience!',
      avatar: '👩‍🦱',
    },
    {
      name: 'David Martinez',
      country: '🇪🇸 Spain',
      rating: 5,
      text: 'The personalized recommendations were spot on! Discovered hidden gems we would have never found otherwise. Thank you SkyConnect SL!',
      avatar: '👨‍🦰',
    },
    {
      name: 'Emma Wilson',
      country: '🇦🇺 Australia',
      rating: 5,
      text: 'Booked everything from our hotel to safari tours through SkyConnect SL. The instant booking feature is a game-changer. Love it!',
      avatar: '👱‍♀️',
    },
    {
      name: 'Rajesh Kumar',
      country: '🇱🇰 Sri Lanka',
      rating: 5,
      text: 'Even as a local, I use SkyConnect SL to discover new experiences in my own country. Supporting local businesses has never been easier!',
      avatar: '👨‍💼',
    },
  ]

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="section-title">What Travelers Say</h2>
          <p className="section-subtitle">
            Real experiences from real travelers who trusted SkyConnect
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl 
                       transition-shadow duration-300"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FiStar key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-12 h-12 bg-gradient-primary rounded-full 
                              flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.country}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white rounded-3xl p-12 shadow-lg">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">4.8/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">1,247</div>
              <div className="text-gray-600">Happy Travelers</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">98%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">500+</div>
              <div className="text-gray-600">Verified Partners</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
