'use client'

export default function Destinations() {
  const destinations = [
    {
      name: 'Sigiriya',
      category: 'Ancient Wonders',
      emoji: '🏛️',
      listings: '45+ Tours',
      gradient: 'from-orange-400 to-red-500',
    },
    {
      name: 'Ella',
      category: 'Nature & Adventure',
      emoji: '🏔️',
      listings: '38+ Experiences',
      gradient: 'from-green-400 to-teal-500',
    },
    {
      name: 'Galle',
      category: 'Coastal Paradise',
      emoji: '🏖️',
      listings: '52+ Hotels',
      gradient: 'from-blue-400 to-cyan-500',
    },
    {
      name: 'Kandy',
      category: 'Cultural Heritage',
      emoji: '🕉️',
      listings: '41+ Tours',
      gradient: 'from-purple-400 to-pink-500',
    },
    {
      name: 'Yala',
      category: 'Wildlife Safari',
      emoji: '🦁',
      listings: '29+ Safaris',
      gradient: 'from-yellow-400 to-orange-500',
    },
    {
      name: 'Colombo',
      category: 'Urban Experience',
      emoji: '🏙️',
      listings: '67+ Activities',
      gradient: 'from-indigo-400 to-purple-500',
    },
  ]

  return (
    <section id="destinations" className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="section-title">Popular Destinations</h2>
          <p className="section-subtitle">
            Explore the most beautiful places in Sri Lanka with verified local guides
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl cursor-pointer 
                       hover:shadow-2xl transition-all duration-300"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${dest.gradient} opacity-90 
                            group-hover:opacity-100 transition-opacity`}></div>

              {/* Content */}
              <div className="relative p-8 text-white min-h-[280px] flex flex-col justify-between">
                {/* Top */}
                <div>
                  <div className="text-6xl mb-4">{dest.emoji}</div>
                  <div className="text-sm font-medium opacity-90 mb-2">
                    {dest.category}
                  </div>
                  <h3 className="text-3xl font-bold mb-2">{dest.name}</h3>
                </div>

                {/* Bottom */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold bg-white/20 backdrop-blur 
                                 px-4 py-2 rounded-full">
                    {dest.listings}
                  </span>
                  <div className="transform group-hover:translate-x-2 transition-transform">
                    →
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 
                            transition-opacity"></div>
            </div>
          ))}
        </div>

        {/* More Destinations CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            And many more amazing destinations waiting to be discovered...
          </p>
          <a href="#download" className="btn-secondary">
            Explore All Destinations
          </a>
        </div>
      </div>
    </section>
  )
}
