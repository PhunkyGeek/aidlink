'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '@/lib/firebase';
import { initiateZkLogin } from '@/lib/zkLogin';
import { useUserStore } from '@/store/useUserStore';
import { getUserRole } from '@/utils/getUserRole';
import Link from 'next/link';
import {
  RiEyeLine,
  RiEyeOffLine,
  RiGoogleFill,
  RiFacebookFill,
  RiFingerprintLine,
} from 'react-icons/ri';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setAddress, setRole, setProfile } = useUserStore();

  const handleLoginSuccess = async (user: any) => {
    const userAddress = user.uid;
    setAddress(userAddress);
    setProfile(user.displayName || null, user.photoURL || null);

    const role = await getUserRole(userAddress);
    setRole(role);

    router.push('/redirect');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleLoginSuccess(result.user);
    } catch (err) {
      console.error(err);
      setError('Invalid credentials.');
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    const selectedProvider = provider === 'google' ? googleProvider : facebookProvider;
    try {
      const result = await signInWithPopup(auth, selectedProvider);
      await handleLoginSuccess(result.user);
    } catch (err) {
      console.error(err);
      setError('OAuth login failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-black shadow rounded-xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Welcome to AidLink 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Please sign in to your account
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleEmailLogin}>
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-black dark:text-white"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 pr-10 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-black dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
            >
              {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
              <input type="checkbox" className="accent-purple-500" />
              <span>Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-purple-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-md transition"
          >
            Log In
          </button>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        </form>

        <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-300">
          New on our platform?{' '}
          <Link href="/register" className="text-purple-600 hover:underline">
          Create an account
          </Link>
        </div>

        <div className="my-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-400">or</div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleOAuthLogin('google')}
            className="p-2 rounded border hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <RiGoogleFill size={20} className="text-red-500" />
          </button>
          <button
            onClick={() => handleOAuthLogin('facebook')}
            className="p-2 rounded border hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <RiFacebookFill size={20} className="text-blue-600" />
          </button>
          <button
            onClick={initiateZkLogin}
            className="p-2 rounded border hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <RiFingerprintLine size={20} className="text-purple-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
