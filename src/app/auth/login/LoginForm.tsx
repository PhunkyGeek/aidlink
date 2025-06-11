'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider, facebookAuthProvider, db } from '@/lib/firebase';
import { useUserStore } from '@/store/useUserStore';
import { getUserRole } from '@/utils/getUserRole';
import { doc, setDoc } from 'firebase/firestore';
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
import toast from 'react-hot-toast';
import { initiateZkLogin } from '@/lib/zkLogin';
import Loader from '@/components/Loader';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const router = useRouter();
  const { setAddress, setRole, setProfile, setId } = useUserStore();

  const handleLoginSuccess = async (user: any) => {
    setShowLoader(true);
    if (!db) {
      toast.error('Database service unavailable');
      return;
    }
    const userId = user.uid;
    setId(userId);
    setProfile(user.displayName || null, user.photoURL || null);
    try {
      const role = await getUserRole(userId);
      setRole(role);
      await setDoc(doc(db, 'users', userId), {
        userId,
        email: user.email || '',
        address: null, // Wallet address will be set by IconConnectWallet
        role,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        isConnected: false, // Updated by IconConnectWallet
        createdAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true });
      // toast.success('Logged in successfully!');
      router.push('/redirect');
    } catch (error: any) {
      console.error('Error handling login success:', error);
      toast.error('Failed to sync user data: ' + error.message);
    } finally {
      setShowLoader(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast.error('Authentication service not initialized.');
      return;
    }
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleLoginSuccess(result.user);
    } catch (err: any) {
      console.error('Email login error:', err);
      toast.error(err.message.includes('invalid-credential') ? 'Invalid email or password.' : 'Login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    if (!auth) {
      toast.error('Authentication service not initialized.');
      return;
    }
    const selectedProvider = provider === 'google' ? googleAuthProvider : facebookAuthProvider;
    if (!selectedProvider) {
      toast.error(`${provider === 'google' ? 'Google' : 'Facebook'} authentication not configured.`);
      return;
    }
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, selectedProvider);
      await handleLoginSuccess(result.user);
    } catch (err: any) {
      console.error(`${provider} login error:`, err);
      toast.error(`Failed to login with ${provider === 'google' ? 'Google' : 'Facebook'}: ` + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleZkLogin = async () => {
    const toastId = toast.loading('Redirecting to Sui Wallet...');
    try {
      await initiateZkLogin();
      toast.success('zkLogin initiated!');
    } catch (err: any) {
      console.error('zkLogin error:', err);
      toast.error('zkLogin failed: ' + err.message);
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <div className="bg-black shadow rounded-xl max-w-md w-full p-8">
      {showLoader && <Loader />}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-100">
          Welcome to AidLink 👋
        </h1>
        <p className="text-sm text-gray-400">
          Please sign in to your account
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleEmailLogin} aria-label="Login form">
        <FormInput
          type="email"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="border-gray-700 bg-gray-900 text-gray-100 focus:border-purple-400 focus:ring-purple-400/20"
        />

        <div className="relative">
          <FormInput
            type={showPassword ? 'text' : 'password'}
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="border-gray-700 bg-gray-900 text-gray-100 focus:border-purple-400 focus:ring-purple-400/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center space-x-2 text-gray-400">
            <input type="checkbox" className="accent-purple-500" />
            <span>Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-purple-400 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full font-medium py-2 rounded-md transition ${
            loading
              ? 'bg-purple-400 text-white opacity-70 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-2 focus:ring-purple-400/20'
          }`}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className="text-center mt-4 text-sm text-gray-400">
        New on our platform?{' '}
        <Link href="/auth/register" className="text-purple-400 hover:underline">
          Create an account
        </Link>
      </div>

      <div className="my-4 border-t border-gray-700 text-center text-sm text-gray-400">
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