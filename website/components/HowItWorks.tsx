'use client'

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Download & Sign Up',
      description: 'Get the SkyConnect SL app and create your free account in seconds.',
      emoji: '📱',
    },
    {
      number: '02',
      title: 'Browse & Discover',
      description: 'Explore verified tours, hotels, transport, and local experiences.',
      emoji: '🔍',
    },
    {
      number: '03',
      title: 'Book Instantly',
      description: 'Choose your perfect experience and book with just a few taps.',
      emoji: '✨',
    },
    {
      number: '04',
      title: 'Enjoy Your Trip',
      description: 'Relax and enjoy authentic Sri Lankan experiences with peace of mind.',
      emoji: '🌴',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Four simple steps to your perfect Sri Lankan adventure
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line (Desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-1/2 w-full h-0.5 
                              bg-gradient-to-r from-primary-blue to-primary-teal opacity-30 z-0"></div>
              )}

              {/* Step Card */}
              <div className="relative bg-white rounded-2xl p-8 text-center 
                            hover:shadow-xl transition-shadow duration-300 z-10">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 
                              w-12 h-12 bg-gradient-primary rounded-full flex items-center 
                              justify-center text-white font-bold text-lg shadow-lg">
                  {index + 1}
                </div>

                {/* Emoji */}
                <div className="text-6xl mb-6 mt-4">{step.emoji}</div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* For Partners Section */}
        <div className="mt-20 bg-white rounded-3xl p-12 shadow-lg">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4 gradient-text">
                Are You a Service Provider?
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Join SkyConnect and reach thousands of travelers looking for authentic 
                Sri Lankan experiences. Grow your business with our verified partner program.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Zero upfront costs - only pay when you get bookings',
                  'Reach international and local travelers',
                  'Easy-to-use partner dashboard',
                  'Marketing support and visibility',
                  'Secure and instant payments',
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
              <a href="#partners" className="btn-primary inline-block">
                Become a Partner
              </a>
            </div>

            <div className="bg-gradient-accent rounded-2xl p-8 text-white">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🤝</div>
                <h4 className="text-2xl font-bold mb-2">Partner Success Story</h4>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-xl p-6">
                <p className="mb-4 italic">
                  "Since joining SkyConnect SL, my tour bookings have increased by 300%. 
                  The platform is easy to use, and I love connecting with travelers 
                  from around the world!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl">
                    👨
                  </div>
                  <div>
                    <div className="font-semibold">Kasun Perera</div>
                    <div className="text-sm opacity-90">Tour Guide, Ella</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
