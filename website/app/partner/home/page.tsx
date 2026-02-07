'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getPartnerProfile, getPartnerListings } from '@/services/firestoreService';
import { PartnerProfile, Listing } from '@/types';

export default function PartnerHomePage() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!user.emailVerified) {
        router.push('/verify-email');
      } else if (userRole !== 'partner') {
        router.push('/dashboard');
      } else {
        loadProfile();
      }
    }
  }, [user, userRole, loading, router]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const partnerProfile = await getPartnerProfile(user.uid);
      if (!partnerProfile) {
        router.push('/partner/create-profile');
      } else {
        setProfile(partnerProfile);
        const partnerListings = await getPartnerListings(user.uid);
        setListings(partnerListings);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">✓ Approved</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">⏳ Pending</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">✗ Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-primary text-white rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome, {profile?.businessName || 'Partner'}! 🏢
              </h1>
              <p className="text-lg opacity-90 mb-4">
                Manage your listings and grow your business
              </p>
            </div>
            <div>
              {getStatusBadge(profile?.approvalStatus || 'pending')}
            </div>
          </div>
        </div>

        {/* Approval Status Alert */}
        {profile?.approvalStatus === 'pending' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-lg">
            <div className="flex">
              <div className="text-3xl mr-3">⏳</div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Approval Pending</h3>
                <p className="text-yellow-700">
                  Your partner account is under review. You can create listings, but they won't be visible until approved by an admin.
                </p>
              </div>
            </div>
          </div>
        )}

        {profile?.approvalStatus === 'rejected' && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded-lg">
            <div className="flex">
              <div className="text-3xl mr-3">✗</div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Account Rejected</h3>
                <p className="text-red-700">
                  Unfortunately, your partner application was not approved. Please contact support for more information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-travel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Listings</p>
                <p className="text-2xl font-bold text-primary-blue">{listings.length}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>
          <div className="card-travel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active</p>
                <p className="text-2xl font-bold text-primary-green">
                  {listings.filter(l => l.isActive).length}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
          <div className="card-travel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Views</p>
                <p className="text-2xl font-bold text-accent-gold">-</p>
              </div>
              <div className="text-4xl">👁️</div>
            </div>
          </div>
          <div className="card-travel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Bookings</p>
                <p className="text-2xl font-bold text-purple-600">-</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-travel p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/partner/create-listing')}
              className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <span className="text-3xl">➕</span>
              <div className="text-left">
                <p className="font-semibold text-primary-blue">Create Listing</p>
                <p className="text-sm text-gray-600">Add new service</p>
              </div>
            </button>
            <button
              onClick={() => router.push('/partner/listings')}
              className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
            >
              <span className="text-3xl">📋</span>
              <div className="text-left">
                <p className="font-semibold text-primary-green">My Listings</p>
                <p className="text-sm text-gray-600">Manage services</p>
              </div>
            </button>
            <button
              onClick={() => router.push('/partner/edit-profile')}
              className="flex items-center gap-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition-colors"
            >
              <span className="text-3xl">✏️</span>
              <div className="text-left">
                <p className="font-semibold text-accent-gold">Edit Profile</p>
                <p className="text-sm text-gray-600">Update business info</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Listings */}
        <div className="card-travel p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Listings</h2>
            <button
              onClick={() => router.push('/partner/listings')}
              className="text-primary-blue hover:underline font-medium"
            >
              View All →
            </button>
          </div>
          
          {listings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-600 mb-4">You haven't created any listings yet</p>
              <button
                onClick={() => router.push('/partner/create-listing')}
                className="btn-primary"
              >
                Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.slice(0, 3).map((listing) => (
                <div key={listing.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-soft transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">{listing.title}</h3>
                    {listing.isActive ? (
                      <span className="text-green-500 text-sm">●</span>
                    ) : (
                      <span className="text-gray-400 text-sm">●</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{listing.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-blue font-bold">${listing.price}</span>
                    <span className="text-sm text-gray-500 capitalize">{listing.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
