'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '@/lib/firebase';
import { useUserStore } from '@/store/useUserStore';
import { setUserRole } from '@/utils/getUserRole';
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

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'donor' | 'recipient' | null>(null);
  const [showRolePrompt, setShowRolePrompt] = useState(true);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { setAddress, setRole: setZustandRole, setProfile } = useUserStore();
  const { zkLoading, handleZkLogin } = useZkLoginHandler();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return setShowRolePrompt(true);

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });

      const uid = result.user.uid;
      const displayName = result.user.displayName || name;
      const photoURL = result.user.photoURL || null;

      setAddress(uid);
      setZustandRole(role);
      setProfile(displayName, photoURL);
      await setUserRole(uid, role);

      router.push('/redirect');
    } catch (err) {
      console.error(err);
      setError('Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    if (!role) return setShowRolePrompt(true);
    const selectedProvider = provider === 'google' ? googleProvider : facebookProvider;

    setLoading(true);
    try {
      const result = await signInWithPopup(auth, selectedProvider);
      const uid = result.user.uid;
      const displayName = result.user.displayName || 'User';
      const photoURL = result.user.photoURL || null;

      setAddress(uid);
      setZustandRole(role);
      setProfile(displayName, photoURL);
      await setUserRole(uid, role);

      router.push('/redirect');
    } catch (err) {
      console.error(err);
      setError('OAuth failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 relative">
      {/* Role Prompt Modal */}
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
                  setRole("donor");
                  setShowRolePrompt(false);
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
              >
                Donor
              </button>
              <button
                onClick={() => {
                  setRole("recipient");
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
          <input
            type="text"
            required
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-black dark:text-white"
          />

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
              type={showPassword ? "text" : "password"}
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

          <label className="text-sm text-gray-600 dark:text-gray-300 flex items-start space-x-2">
            <input
              type="checkbox"
              className="mt-1 accent-purple-600"
              required
            />
            <span>
              I agree to{" "}
              <Link href="#" className="text-purple-600 underline">
                privacy policy & terms
              </Link>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-medium py-2 rounded-md transition ${
              loading
                ? "bg-purple-400 text-white opacity-70 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        </form>

        <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-600 hover:underline">
            Sign in
          </Link>
        </div>

        <div className="my-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-400">
          or
        </div>

        <div className="flex justify-center gap-4">
          {loading ? (
            <Spinner />
          ) : (
            <>
              <IconButton
                onClick={() => handleOAuth("google")}
                ariaLabel="Register with Google"
              >
                <RiGoogleFill size={20} className="text-red-500" />
              </IconButton>
              <IconButton
                onClick={() => handleOAuth("facebook")}
                ariaLabel="Register with Facebook"
              >
                <RiFacebookFill size={20} className="text-blue-600" />
              </IconButton>
              <IconButton
                onClick={() => handleZkLogin(role)}
                ariaLabel="zkLogin with Fingerprint"
                disabled={zkLoading}
              >
                <RiFingerprintLine size={20} className="text-purple-500" />
              </IconButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
