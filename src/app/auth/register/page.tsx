'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, googleAuthProvider, facebookAuthProvider, db } from '@/lib/firebase';
import { useUserStore } from '@/store/useUserStore';
import { setUserRole } from '@/utils/getUserRole';
import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import {
  RiEyeLine,
  RiEyeOffLine,
  RiGoogleFill,
  RiFacebookFill,
  RiFingerprintLine,
} from 'react-icons/ri';
import { useZkLoginHandler } from '@/hooks/useZkLoginHandler';
import IconButton from '@/components/ui/IconButton';
import { Spinner } from '@/components/ui/Spinner';
import FormInput from '@/components/ui/FormInput';
import toast from 'react-hot-toast';
import Loader from '@/components/Loader';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'donor' | 'recipient' | null>(null);
  const [showRolePrompt, setShowRolePrompt] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const router = useRouter();
  const { setId, setRole: setZustandRole, setProfile } = useUserStore();
  const { zkLoading, handleZkLogin } = useZkLoginHandler();

  const parseFirebaseError = (err: any): string => {
    const code = err.code || '';
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Email is already registered.';
      case 'auth/invalid-email':
        return 'Invalid email format.';
      case 'auth/weak-password':
        return 'Password is too weak (minimum 6 characters).';
      case 'auth/popup-closed-by-user':
        return 'OAuth popup was closed.';
      default:
        return err.message || 'Unknown error occurred.';
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return setShowRolePrompt(true);

    if (!auth || !db) {
      setError('Authentication service unavailable');
      toast.error('Authentication service unavailable');
      return;
    }

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });

      const uid = result.user.uid;
      const displayName = result.user.displayName || name;
      const photoURL = result.user.photoURL || null;

      setId(uid);
      setZustandRole(role);
      setProfile(displayName, photoURL);
      await setUserRole(uid, role);

      await setDoc(doc(db, 'users', uid), {
        userId: uid,
        email: email || '',
        address: null, // Wallet address set by IconConnectWallet
        role,
        displayName,
        photoURL,
        isConnected: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true });

      toast.success('Registration successful');
      setShowLoader(true);
      await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
      router.push('/redirect');
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = parseFirebaseError(err);
      setError(`Registration failed: ${errorMessage}`);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    if (!role) return setShowRolePrompt(true);
    if (!auth || !db) {
      setError('Authentication service unavailable');
      toast.error('Authentication service unavailable');
      return;
    }

    const selectedProvider = provider === 'google' ? googleAuthProvider : facebookAuthProvider;
    if (!selectedProvider) {
      setError('OAuth provider unavailable');
      toast.error('OAuth provider unavailable');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithPopup(auth, selectedProvider);
      const uid = result.user.uid;
      const displayName = result.user.displayName || 'User';
      const photoURL = result.user.photoURL || null;

      setId(uid);
      setZustandRole(role);
      setProfile(displayName, photoURL);
      await setUserRole(uid, role);

      await setDoc(doc(db, 'users', uid), {
        userId: uid,
        email: result.user.email || '',
        address: null, // Wallet address set by IconConnectWallet
        role,
        displayName,
        photoURL,
        isConnected: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, { merge: true });

      toast.success('OAuth registration successful');
      setShowLoader(true);
      await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
      router.push('/redirect');
    } catch (err: any) {
      console.error('OAuth error:', err);
      const errorMessage = parseFirebaseError(err);
      setError(`OAuth failed: ${errorMessage}`);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 relative">
      {showLoader && <Loader />}
      {showRolePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-sm w-full space-y-4 text-center shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Select your role
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              This helps us personalize your experience.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setRole('donor');
                  setShowRolePrompt(false);
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
              >
                Donor
              </button>
              <button
                onClick={() => {
                  setRole('recipient');
                  setShowRolePrompt(false);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Recipient
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-black shadow rounded-xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Journey starts here 🚀
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            Making the world a better place, little by little!
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleRegister}>
          <FormInput
            type="text"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-gray-700 bg-gray-900 text-gray-100 focus:border-purple-400 focus:ring-purple-400/20"
          />

          <FormInput
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-gray-700 bg-gray-900 text-gray-100 focus:border-purple-400 focus:ring-purple-400/20"
          />

          <div className="relative">
            <FormInput
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-gray-700 bg-gray-900 text-gray-100 focus:border-purple-400 focus:ring-purple-400/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
            >
              {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
          </div>

          <label className="text-sm text-gray-600 dark:text-gray-300 flex items-start space-x-2">
            <input
              type="checkbox"
              className="mt-1 accent-purple-600"
              required
            />
            <span>
              I agree to{' '}
              <Link href="#" className="text-purple-600 underline">
                privacy policy & terms
              </Link>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-medium py-2 rounded-md transition bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        </form>

        <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-purple-600 hover:underline">
            Sign in
          </Link>
        </div>

        <div className="my-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center -mt-3">
            <span className="bg-white dark:bg-black px-2 text-sm text-gray-400 dark:text-gray-300">
              or
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          {loading ? (
            <Spinner size="md" />
          ) : (
            <>
              <IconButton
                onClick={() => handleOAuth('google')}
                ariaLabel="Register with Google"
              >
                <RiGoogleFill className="text-red-600" size={24} />
              </IconButton>
              <IconButton
                onClick={() => handleOAuth('facebook')}
                ariaLabel="Register with Facebook"
              >
                <RiFacebookFill className="text-blue-600" size={24} />
              </IconButton>
              <IconButton
                onClick={() => handleZkLogin(role)}
                ariaLabel="Register with zkLogin"
                disabled={zkLoading}
              >
                <RiFingerprintLine className="text-purple-500" size={24} />
              </IconButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}