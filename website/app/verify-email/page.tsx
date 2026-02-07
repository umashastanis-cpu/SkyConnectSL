"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user, firebaseUser, sendVerificationEmail, reloadUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }

    if (firebaseUser.emailVerified) {
      router.push('/dashboard');
    }
  }, [firebaseUser, router]);

  const handleResendEmail = async () => {
    setLoading(true);
    setMessage('');
    try {
      await sendVerificationEmail();
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      setMessage('Failed to send email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    setMessage('');
    try {
      await reloadUser();
      if (firebaseUser?.emailVerified) {
        setMessage('Email verified successfully! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setMessage('Email not verified yet. Please check your inbox and click the verification link.');
      }
    } catch (error) {
      setMessage('Failed to check verification status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-card p-8 text-center">
        <div className="text-6xl mb-6">📧</div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Verify Your Email
        </h1>
        
        <p className="text-gray-600 mb-6">
          We've sent a verification email to <br />
          <span className="font-semibold text-gray-900">{user?.email}</span>
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Next steps:</strong>
          </p>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Check your email inbox</li>
            <li>Click the verification link in the email</li>
            <li>Return here and click "I've Verified My Email"</li>
          </ol>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.includes('successfully') || message.includes('sent')
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleCheckVerification}
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Checking...' : "I've Verified My Email"}
          </button>

          <button
            onClick={handleResendEmail}
            disabled={loading}
            className="w-full btn-secondary disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-gray-500 hover:text-primary-blue"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
