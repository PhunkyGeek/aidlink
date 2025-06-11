'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUserStore } from '@/store/useUserStore';
import { handleZkLoginCallback } from '@/lib/zkLogin';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/ui/Spinner';

export default function ZkCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser } = useUserStore();

  useEffect(() => {
    async function handleCallback() {
      const token = searchParams.get('token');
      const redirect = searchParams.get('redirect') || '/';

      if (!token) {
        toast.error('No token found in ZkLogin callback');
        router.replace('/auth/error');
        return;
      }

      try {
        // Retrieve salt from localStorage
        let userSalt: string | null = null;
        if (typeof window !== 'undefined') {
          userSalt = localStorage.getItem('zk_salt');
        }

        if (!userSalt) {
          throw new Error('User salt not found. Please initiate zkLogin again.');
        }

        // Handle zkLogin callback
        const role = await handleZkLoginCallback({ token, salt: userSalt, redirect });

        // Update Firestore
        if (!db) {
          throw new Error('Firestore database not initialized');
        }
        const address = useUserStore.getState().address;
        if (!address) {
          throw new Error('Address not set in user store');
        }

        await setDoc(doc(db, 'users', address), {
          userId: address, // Use address as ID (no Firebase UID)
          email: null,
          address,
          role,
          displayName: null,
          photoURL: null,
          isConnected: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }, { merge: true });

        // Update user store (redundant but ensures consistency)
        setUser({
          id: null, // No Firebase UID
          address,
          role,
          displayName: null,
          photoURL: null,
        });

        toast.success('ZkLogin successful');
        router.replace(redirect);
      } catch (error: any) {
        console.error('ZkLogin error:', error);
        toast.error('ZkLogin failed: ' + error.message);
        router.replace('/auth/error');
      }
    }

    handleCallback();
  }, [searchParams, router, setUser]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center text-gray-100">
        <Spinner size="lg" className="text-purple-400 mb-2" />
        <p>Verifying ZkLogin credentials...</p>
      </div>
    </div>
  );
}