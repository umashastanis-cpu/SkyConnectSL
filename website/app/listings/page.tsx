'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAllListings } from '@/services/firestoreService';
import { Listing } from '@/types';

const CATEGORIES = ['All', 'Tour', 'Accommodation', 'Transport', 'Activity'];
const LOCATIONS = ['All', 'Colombo', 'Kandy', 'Galle', 'Ella', 'Sigiriya', 'Yala'];

export default function BrowseListingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [selectedCategory, selectedLocation, searchQuery, priceRange, listings]);

  const loadListings = async () => {
    try {
      const allListings = await getAllListings();
      // Only show active listings
      const activeListings = allListings.filter(l => l.isActive);
      setListings(activeListings);
      setFilteredListings(activeListings);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterListings = () => {
    let filtered = [...listings];

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(l => l.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Location filter
    if (selectedLocation !== 'All') {
      filtered = filtered.filter(l => l.location?.toLowerCase().includes(selectedLocation.toLowerCase()));
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(l =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filter
    filtered = filtered.filter(l => l.price >= priceRange[0] && l.price <= priceRange[1]);

    setFilteredListings(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading amazing experiences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-charcoal mb-4">
            Explore Sri Lanka 🇱🇰
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover authentic experiences from trusted local partners
          </p>
        </div>

        {/* Search Bar */}
        <div className="card-travel p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tours, hotels, activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent text-lg"
              />
            </div>
            <button className="btn-primary">
              🔍 Search
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="space-y-6">
            {/* Category Filter */}
            <div className="card-travel p-6">
              <h3 className="font-bold text-lg mb-4">Category</h3>
              <div className="space-y-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary-blue text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div className="card-travel p-6">
              <h3 className="font-bold text-lg mb-4">Location</h3>
              <div className="space-y-2">
                {LOCATIONS.map((location) => (
                  <button
                    key={location}
                    onClick={() => setSelectedLocation(location)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedLocation === location
                        ? 'bg-primary-green text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="card-travel p-6">
              <h3 className="font-bold text-lg mb-4">Price Range</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                <span className="font-semibold text-primary-blue">{filteredListings.length}</span> experiences found
              </p>
              <select className="px-4 py-2 border border-gray-300 rounded-lg">
                <option>Sort by: Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
              </select>
            </div>

            {filteredListings.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-600 text-xl">No listings found</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredListings.map((listing) => (
                  <div
                    key={listing.id}
                    onClick={() => router.push(`/listings/${listing.id}`)}
                    className="card-travel overflow-hidden cursor-pointer group"
                  >
                    {/* Image Placeholder */}
                    <div className="aspect-[4/3] bg-gradient-primary flex items-center justify-center text-white text-6xl group-hover:scale-105 transition-transform">
                      {listing.category === 'tour' && '🚌'}
                      {listing.category === 'accommodation' && '🏨'}
                      {listing.category === 'transport' && '🚗'}
                      {listing.category === 'activity' && '🏄'}
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold group-hover:text-primary-blue transition-colors">
                          {listing.title}
                        </h3>
                        <span className="px-3 py-1 bg-blue-100 text-primary-blue rounded-full text-sm font-medium capitalize">
                          {listing.category}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {listing.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">From</p>
                          <p className="text-2xl font-bold text-primary-blue">
                            ${listing.price}
                          </p>
                        </div>
                        {listing.location && (
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium">📍 {listing.location}</p>
                          </div>
                        )}
                      </div>

                      <button className="w-full mt-4 btn-secondary">
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
