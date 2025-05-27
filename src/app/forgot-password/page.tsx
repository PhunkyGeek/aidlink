'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      console.error(err);
      setError('Could not send reset link. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 shadow rounded-xl max-w-md w-full p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">
          Forgot Password 🔒
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {"Enter your email and we'll send you instructions to reset your password"}
        </p>

        {sent ? (
          <p className="text-green-600">Reset link sent! Check your inbox.</p>
        ) : (
          <form className="space-y-4" onSubmit={handleReset}>
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-black dark:text-white"
            />
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-md"
            >
              Send reset link
            </button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>
        )}

        <Link href="/login" className="text-sm text-purple-600 hover:underline block mt-4">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}
