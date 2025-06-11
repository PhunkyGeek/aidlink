'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUserStore } from '@/store/useUserStore';
import { handleZkLoginCallback } from '@/lib/zkLogin';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/ui/Spinner';

export default function ZkCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    async function processCallback() {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', ''));
      const idToken = params.get('id_token');
      const redirect = searchParams.get('redirect') || '/';

      if (!idToken) {
        toast.error('No id_token found in zkLogin callback');
        router.replace('/auth/error');
        return;
      }

      try {
        const role = await handleZkLoginCallback({ idToken, redirect });

        if (!db) {
          throw new Error('Firestore database not initialized');
        }
        const address = useUserStore.getState().address;
        if (!address) {
          throw new Error('Address not set in user store');
        }

        await setDoc(
          doc(db, 'users', address),
          {
            userId: address,
            email: null,
            address,
            role,
            displayName: null,
            photoURL: null,
            isConnected: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { merge: true }
        );

        useUserStore.getState().setUser({
          id: null,
          address,
          role,
          displayName: null,
          photoURL: null,
        });

        toast.success('ZkLogin successful');
        router.replace(redirect);
      } catch (error: any) {
        console.error('ZkLogin error:', error);
        toast.error(`ZkLogin failed: ${error.message}`);
        router.replace('/auth/error');
      }
    }

    processCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center text-gray-100">
        <Spinner size="lg" className="text-purple-400 mb-2" />
        <p>Verifying zkLogin credentials...</p>
      </div>
    </div>
  );
}