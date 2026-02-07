'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!user.emailVerified) {
        router.push('/verify-email');
      } else if (userRole === 'traveler') {
        router.push('/traveler/home');
      } else if (userRole === 'partner') {
        router.push('/partner/home');
      } else if (userRole === 'admin') {
        router.push('/admin/dashboard');
      }
    }
  }, [user, userRole, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
