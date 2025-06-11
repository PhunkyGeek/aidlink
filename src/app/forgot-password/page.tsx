'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      toast.error('Invalid email address');
      return;
    }

    if (!auth) {
      setError('Authentication service unavailable');
      toast.error('Authentication service unavailable');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      setError(null);
      toast.success('Reset link sent! Check your inbox.');
    } catch (err: any) {
      console.error('Password reset error:', err);
      const message = err.code === 'auth/user-not-found'
        ? 'No account found for this email'
        : 'Could not send reset link. Try again.';
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-gray-800 shadow rounded-xl max-w-md w-full p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2 text-purple-400">
          Forgot Password 🔒
        </h1>
        <p className="text-sm text-gray-300 mb-6">
          Enter your email and we’ll send you instructions to reset your password
        </p>

        {sent ? (
          <div className="text-green-400">
            <p>Reset link sent! Check your inbox.</p>
            <Link
              href="/auth/login"
              className="text-sm text-purple-400 hover:text-purple-300 block mt-4"
            >
              ← Back to Login
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleReset}>
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-700 bg-gray-800 text-gray-100 focus:border-purple-400 focus:ring focus:ring-purple-400/20"
            />
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-md"
            >
              Send Reset Link
            </button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </form>
        )}

        {!sent && (
          <Link
            href="/auth/login"
            className="text-sm text-purple-400 hover:text-purple-300 block mt-4"
          >
            ← Back to Login
          </Link>
        )}
      </div>
    </div>
  );
}