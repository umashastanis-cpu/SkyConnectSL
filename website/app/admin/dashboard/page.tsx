'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getPendingPartners, approvePartner, rejectPartner } from '@/services/firestoreService';
import { PartnerProfile } from '@/types';

export default function AdminDashboardPage() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const [pendingPartners, setPendingPartners] = useState<PartnerProfile[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (userRole !== 'admin') {
        router.push('/dashboard');
      } else {
        loadPendingPartners();
      }
    }
  }, [user, userRole, loading, router]);

  const loadPendingPartners = async () => {
    try {
      const partners = await getPendingPartners();
      setPendingPartners(partners);
    } catch (error) {
      console.error('Error loading pending partners:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleApprove = async (partnerId: string) => {
    setActionLoading(partnerId);
    try {
      await approvePartner(partnerId);
      await loadPendingPartners();
    } catch (error) {
      console.error('Error approving partner:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (partnerId: string) => {
    setActionLoading(partnerId);
    try {
      await rejectPartner(partnerId);
      await loadPendingPartners();
    } catch (error) {
      console.error('Error rejecting partner:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard 👑</h1>
          <p className="text-lg opacity-90">
            Manage partner approvals and platform oversight
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card-travel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingPartners.length}</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>
          <div className="card-travel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-primary-blue">-</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
          <div className="card-travel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Listings</p>
                <p className="text-2xl font-bold text-primary-green">-</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>
          <div className="card-travel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Revenue</p>
                <p className="text-2xl font-bold text-accent-gold">-</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
        </div>

        {/* Pending Partners */}
        <div className="card-travel p-8">
          <h2 className="text-2xl font-bold mb-6">Pending Partner Approvals</h2>
          
          {pendingPartners.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-gray-600">No pending partner applications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPartners.map((partner) => (
                <div key={partner.userId} className="border border-gray-200 rounded-xl p-6 hover:shadow-soft transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold">{partner.businessName}</h3>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                          Pending Review
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{partner.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{partner.contactPhone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Category</p>
                          <p className="font-medium capitalize">{partner.businessCategory}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Registration</p>
                          <p className="font-medium">{partner.registrationNumber || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Address</p>
                        <p className="text-gray-700">{partner.businessAddress}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Description</p>
                        <p className="text-gray-700">{partner.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(partner.userId)}
                      disabled={actionLoading === partner.userId}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {actionLoading === partner.userId ? 'Processing...' : '✓ Approve Partner'}
                    </button>
                    <button
                      onClick={() => handleReject(partner.userId)}
                      disabled={actionLoading === partner.userId}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {actionLoading === partner.userId ? 'Processing...' : '✗ Reject'}
                    </button>
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
