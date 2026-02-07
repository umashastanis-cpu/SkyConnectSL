'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createPartnerProfile } from '@/services/firestoreService';

const BUSINESS_CATEGORIES = [
  { value: 'tour', label: '🚌 Tour Operator' },
  { value: 'accommodation', label: '🏨 Accommodation' },
  { value: 'transport', label: '🚗 Transportation' },
  { value: 'activity', label: '🏄 Activities & Adventures' },
  { value: 'restaurant', label: '🍽️ Restaurant' },
  { value: 'other', label: '📦 Other Services' },
];

export default function CreatePartnerProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: '',
    businessCategory: '',
    businessAddress: '',
    contactPhone: '',
    description: '',
    registrationNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      await createPartnerProfile({
        userId: user.uid,
        email: user.email!,
        ...formData,
        approvalStatus: 'pending',
      });
      router.push('/partner/home');
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
            <div className="text-6xl mb-4">🏢</div>
            <h1 className="text-3xl font-bold text-neutral-charcoal mb-2">
              Create Partner Profile
            </h1>
            <p className="text-gray-600">
              Tell us about your business to start offering services
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg mb-6">
            <p className="text-blue-800 text-sm">
              ℹ️ Your profile will be reviewed by our admin team. You can create listings immediately, but they'll only be visible after approval.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="e.g., Lanka Adventures Tours"
              />
            </div>

            {/* Business Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Business Category *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {BUSINESS_CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, businessCategory: category.value })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.businessCategory === category.value
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

            {/* Business Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Address *
              </label>
              <input
                type="text"
                required
                value={formData.businessAddress}
                onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="e.g., 123 Main St, Colombo, Sri Lanka"
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="+94 XX XXX XXXX"
              />
            </div>

            {/* Registration Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Registration Number (Optional)
              </label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="e.g., BRN123456789"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Description *
              </label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none"
                placeholder="Tell travelers about your business, services, and what makes you unique..."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Profile...' : 'Submit for Approval'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
