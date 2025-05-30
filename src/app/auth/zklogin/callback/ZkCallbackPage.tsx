'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { jwtToAddress } from '@mysten/sui/zklogin';
import { useUserStore } from '@/store/useUserStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/ui/Spinner';

export default function ZkCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser, setRole } = useUserStore();

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
        // Retrieve salt
        let userSalt: string | null = null;
        if (typeof window !== 'undefined') {
          userSalt = localStorage.getItem('zk_salt');
        }

        if (!userSalt) {
          if (!db) {
            throw new Error('Firestore database not initialized');
          }
          const tempAddress = jwtToAddress(token, '0');
          const userDoc = await getDoc(doc(db, 'users', tempAddress));
          userSalt = userDoc.data()?.salt;
        }

        if (!userSalt) {
          throw new Error('User salt not found');
        }

        // Compute address
        const address = jwtToAddress(token, userSalt);

        // Fetch role from Firestore
        let role: 'donor' | 'recipient' | 'validator' | 'admin' = 'donor';
        if (db) {
          const userRoleDoc = await getDoc(doc(db, 'userRoles', address));
          const fetchedRole = userRoleDoc.data()?.role;
          if (['donor', 'recipient', 'validator', 'admin'].includes(fetchedRole)) {
            role = fetchedRole as typeof role;
          }
        }

        // Store user data
        if (typeof window !== 'undefined') {
          localStorage.setItem('zk_token', token);
          localStorage.setItem('zk_salt', userSalt);
        }

        setUser({
          address,
          role,
          displayName: null,
          photoURL: null,
        });
        setRole(role);

        toast.success('ZkLogin successful');
        router.replace(redirect);
      } catch (error: any) {
        console.error('ZkLogin error:', error);
        toast.error('ZkLogin failed: ' + error.message);
        router.replace('/auth/error');
      }
    }

    handleCallback();
  }, [searchParams, router, setUser, setRole]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center text-gray-100">
        <Spinner size="lg" className="text-purple-400 mb-2" />
        <p>Verifying ZkLogin credentials...</p>
      </div>
    </div>
  );
}