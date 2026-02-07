'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getTravelerProfile } from '@/services/firestoreService';
import { TravelerProfile } from '@/types';

export default function TravelerHomePage() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<TravelerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!user.emailVerified) {
        router.push('/verify-email');
      } else if (userRole !== 'traveler') {
        router.push('/dashboard');
      } else {
        loadProfile();
      }
    }
  }, [user, userRole, loading, router]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const travelerProfile = await getTravelerProfile(user.uid);
      if (!travelerProfile) {
        router.push('/traveler/create-profile');
      } else {
        setProfile(travelerProfile);
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
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-primary text-white rounded-2xl p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.name || 'Traveler'}! ✈️
          </h1>
          <p className="text-lg opacity-90">
            Ready to explore amazing experiences in Sri Lanka?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-travel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Destinations</p>
                <p className="text-2xl font-bold text-primary-blue">6+</p>
              </div>
              <div className="text-4xl">🏝️</div>
            </div>
          </div>
          <div className="card-travel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Budget Range</p>
                <p className="text-2xl font-bold text-primary-green">${profile?.budgetMin} - ${profile?.budgetMax}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
          <div className="card-travel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Interests</p>
                <p className="text-2xl font-bold text-accent-gold">{profile?.interests?.length || 0}</p>
              </div>
              <div className="text-4xl">❤️</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-travel p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/listings')}
              className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <span className="text-3xl">🔍</span>
              <div className="text-left">
                <p className="font-semibold text-primary-blue">Browse Listings</p>
                <p className="text-sm text-gray-600">Find experiences</p>
              </div>
            </button>
            <button
              onClick={() => router.push('/traveler/edit-profile')}
              className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
            >
              <span className="text-3xl">✏️</span>
              <div className="text-left">
                <p className="font-semibold text-primary-green">Edit Profile</p>
                <p className="text-sm text-gray-600">Update preferences</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition-colors">
              <span className="text-3xl">⭐</span>
              <div className="text-left">
                <p className="font-semibold text-accent-gold">Favorites</p>
                <p className="text-sm text-gray-600">Saved items</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
              <span className="text-3xl">📅</span>
              <div className="text-left">
                <p className="font-semibold text-purple-600">Bookings</p>
                <p className="text-sm text-gray-600">Your trips</p>
              </div>
            </button>
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="card-travel p-8">
          <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Sigiriya Rock', 'Ella Tea Country', 'Galle Fort'].map((destination, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="aspect-[4/3] bg-gradient-primary rounded-xl mb-3 flex items-center justify-center text-white text-4xl group-hover:scale-105 transition-transform">
                  {['🏰', '🌄', '🏛️'][index]}
                </div>
                <h3 className="font-semibold text-lg">{destination}</h3>
                <p className="text-gray-600 text-sm">View experiences →</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
