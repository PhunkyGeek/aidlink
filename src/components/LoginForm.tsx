'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '@/lib/firebase';
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
import FormInput from '@/components/ui/FormInput';
import IconButton from '@/components/ui/IconButton';
import { toast } from 'react-hot-toast';
import { initiateZkLogin } from '@/lib/zkLogin';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleLoginSuccess(result.user);
    } catch (err) {
      console.error(err);
      setError('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    const selectedProvider = provider === 'google' ? googleProvider : facebookProvider;
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, selectedProvider);
      await handleLoginSuccess(result.user);
    } catch (err) {
      console.error(err);
      setError('OAuth login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleZkLogin = async () => {
    const toastId = toast.loading('Redirecting to Sui Wallet...');
    try {
      await initiateZkLogin();
    } catch (err) {
      console.error(err);
      toast.error('zkLogin failed');
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
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
        <FormInput type="email" value={email} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />

        <div className="relative">
          <FormInput
            type={showPassword ? 'text' : 'password'}
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
            aria-label="Toggle password visibility"
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
          disabled={loading}
          className={`w-full font-medium py-2 rounded-md transition ${
            loading
              ? 'bg-purple-400 text-white opacity-70 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
      </form>

      <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-300">
        New on our platform?{' '}
        <Link href="/register" className="text-purple-600 hover:underline">
          Create an account
        </Link>
      </div>

      <div className="my-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-400">
        or
      </div>

      <div className="flex justify-center gap-4">
        <IconButton onClick={() => handleOAuthLogin('google')} ariaLabel="Login with Google">
          <RiGoogleFill size={20} className="text-red-500" />
        </IconButton>
        <IconButton onClick={() => handleOAuthLogin('facebook')} ariaLabel="Login with Facebook">
          <RiFacebookFill size={20} className="text-blue-600" />
        </IconButton>
        <IconButton onClick={handleZkLogin} ariaLabel="zkLogin with Fingerprint">
          <RiFingerprintLine size={20} className="text-purple-500" />
        </IconButton>
      </div>
    </div>
  );
}
