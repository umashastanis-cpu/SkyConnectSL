'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createListing } from '@/services/firestoreService';

const CATEGORIES = [
  { value: 'tour', label: '🚌 Tour & Sightseeing' },
  { value: 'accommodation', label: '🏨 Accommodation' },
  { value: 'transport', label: '🚗 Transportation' },
  { value: 'activity', label: '🏄 Activity & Adventure' },
];

export default function CreateListingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    location: '',
    duration: '',
    capacity: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createListing({
        partnerId: user.uid,
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        price: Number(formData.price),
        location: formData.location,
        duration: formData.duration,
        capacity: Number(formData.capacity),
        isActive: true,
      });
      router.push('/partner/listings');
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card-travel p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📝</div>
            <h1 className="text-3xl font-bold text-neutral-charcoal mb-2">
              Create New Listing
            </h1>
            <p className="text-gray-600">
              Share your amazing service with travelers
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Listing Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="e.g., Sigiriya Rock Fortress Day Tour"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Category *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: category.value })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.category === category.value
                        ? 'border-primary-blue bg-blue-50 shadow-soft'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{category.label.split(' ')[0]}</div>
                    <p className="text-sm font-medium">
                      {category.label.substring(category.label.indexOf(' ') + 1)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none"
                placeholder="Describe your service in detail. What makes it special? What's included?"
              />
            </div>

            {/* Price and Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="50.00"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="e.g., Sigiriya"
                />
              </div>
            </div>

            {/* Duration and Capacity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="e.g., 8 hours"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="e.g., 10"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/partner/home')}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
