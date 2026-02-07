'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createTravelerProfile } from '@/services/firestoreService';

const INTERESTS = [
  { value: 'cultural', label: '🏛️ Cultural Sites', emoji: '🏛️' },
  { value: 'nature', label: '🌿 Nature & Wildlife', emoji: '🌿' },
  { value: 'adventure', label: '🏄 Adventure Sports', emoji: '🏄' },
  { value: 'beach', label: '🏖️ Beach & Water', emoji: '🏖️' },
  { value: 'food', label: '🍜 Food & Cuisine', emoji: '🍜' },
  { value: 'photography', label: '📸 Photography', emoji: '📸' },
];

export default function CreateTravelerProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    interests: [] as string[],
    budgetMin: 50,
    budgetMax: 500,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.interests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createTravelerProfile({
        userId: user.uid,
        email: user.email!,
        ...formData,
      });
      router.push('/traveler/home');
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card-travel p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">✈️</div>
            <h1 className="text-3xl font-bold text-neutral-charcoal mb-2">
              Create Your Traveler Profile
            </h1>
            <p className="text-gray-600">
              Tell us about yourself to get personalized recommendations
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="Your full name"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Country *
              </label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="e.g., United States"
              />
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Your Interests * (Select at least one)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest.value}
                    type="button"
                    onClick={() => handleInterestToggle(interest.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.interests.includes(interest.value)
                        ? 'border-primary-blue bg-blue-50 shadow-soft'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{interest.emoji}</div>
                    <p className="text-sm font-medium">
                      {interest.label.replace(interest.emoji + ' ', '')}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Daily Budget Range (USD)
              </label>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Minimum: ${formData.budgetMin}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({ ...formData, budgetMin: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Maximum: ${formData.budgetMax}
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={formData.budgetMax}
                    onChange={(e) => setFormData({ ...formData, budgetMax: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Profile...' : 'Create Profile & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
