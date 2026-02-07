'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getPartnerListings } from '@/services/firestoreService';
import { Listing } from '@/types';

export default function PartnerListingsPage() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (userRole !== 'partner') {
        router.push('/dashboard');
      } else {
        loadListings();
      }
    }
  }, [user, userRole, loading, router]);

  const loadListings = async () => {
    if (!user) return;
    
    try {
      const partnerListings = await getPartnerListings(user.uid);
      setListings(partnerListings);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    if (filter === 'active') return listing.isActive;
    if (filter === 'inactive') return !listing.isActive;
    return true;
  });

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-charcoal">My Listings</h1>
            <p className="text-gray-600 mt-1">Manage your service offerings</p>
          </div>
          <button
            onClick={() => router.push('/partner/create-listing')}
            className="btn-primary"
          >
            ➕ Create New Listing
          </button>
        </div>

        {/* Stats & Filters */}
        <div className="card-travel p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              <div>
                <p className="text-sm text-gray-600">Total Listings</p>
                <p className="text-2xl font-bold text-primary-blue">{listings.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {listings.filter(l => l.isActive).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-400">
                  {listings.filter(l => !l.isActive).length}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-blue text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'inactive'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        {/* Listings */}
        {filteredListings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-600 text-xl mb-4">
              {filter === 'all' ? 'No listings yet' : `No ${filter} listings`}
            </p>
            <button
              onClick={() => router.push('/partner/create-listing')}
              className="btn-primary"
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="card-travel overflow-hidden">
                {/* Image Placeholder */}
                <div className="aspect-[4/3] bg-gradient-primary flex items-center justify-center text-white text-6xl">
                  {listing.category === 'tour' && '🚌'}
                  {listing.category === 'accommodation' && '🏨'}
                  {listing.category === 'transport' && '🚗'}
                  {listing.category === 'activity' && '🏄'}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold">{listing.title}</h3>
                    {listing.isActive ? (
                      <span className="text-green-500 text-xl">●</span>
                    ) : (
                      <span className="text-gray-400 text-xl">●</span>
                    )}
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {listing.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Category</span>
                      <span className="font-medium capitalize">{listing.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price</span>
                      <span className="font-bold text-primary-blue">${listing.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Location</span>
                      <span className="font-medium">{listing.location}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
                      Edit
                    </button>
                    <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
