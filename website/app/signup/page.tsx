"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, UserRole } from '../../contexts/AuthContext';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('traveler');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, role);
      router.push('/verify-email');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-card p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Join SkyConnect SL</h1>
          <p className="text-gray-600">Create your account and start exploring</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('traveler')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  role === 'traveler'
                    ? 'border-primary-blue bg-blue-50'
                    : 'border-gray-300 hover:border-primary-blue'
                }`}
              >
                <div className="text-3xl mb-2">✈️</div>
                <div className="font-semibold text-gray-900">Traveler</div>
                <div className="text-xs text-gray-600 mt-1">Explore Sri Lanka</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('partner')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  role === 'partner'
                    ? 'border-primary-blue bg-blue-50'
                    : 'border-gray-300 hover:border-primary-blue'
                }`}
              >
                <div className="text-3xl mb-2">🏢</div>
                <div className="font-semibold text-gray-900">Partner</div>
                <div className="text-xs text-gray-600 mt-1">Offer services</div>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-blue"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-blue"
              placeholder="••••••••"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-blue"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-blue hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary-blue">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
