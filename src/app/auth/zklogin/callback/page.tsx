'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { jwtToAddress } from '@mysten/sui/zklogin';
import { useUserStore } from '@/store/useUserStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function ZkCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser, setRole } = useUserStore();

  useEffect(() => {
    async function handleZkLogin() {
      const token = searchParams.get('token');
      const redirect = searchParams.get('redirect') || '/';

      if (!token) {
        toast.error('No token found in ZK login callback');
        router.replace('/auth/error');
        return;
      }

      try {
        // Retrieve salt
        let userSalt: string | null = null;
        if (typeof window !== 'undefined') {
          userSalt = localStorage.getItem('zk_salt');
        }

        if (!userSalt && db) {
          const tempAddress = jwtToAddress(token, '0');
          const userDoc = await getDoc(doc(db, 'users', tempAddress));
          if (userDoc.exists()) {
            userSalt = userDoc.data().salt;
          }
        }

        if (!userSalt) {
          throw new Error('User salt not found');
        }

        // Compute address
        const address = jwtToAddress(token, userSalt);

        // Fetch role from Firestore
        let role: 'donor' | 'recipient' | 'validator' | 'admin' = 'donor';
        if (db) {
          const userDoc = await getDoc(doc(db, 'userRoles', address));
          if (userDoc.exists()) {
            const fetchedRole = userDoc.data().role;
            if (['donor', 'recipient', 'validator', 'admin'].includes(fetchedRole)) {
              role = fetchedRole as typeof role;
            }
          }
        }

        // Store user data
        if (typeof window !== 'undefined') {
          localStorage.setItem('zk_token', token);
          if (userSalt) {
            localStorage.setItem('zk_salt', userSalt); // Ensure salt is stored
          }
        }
        setUser({
          address,
          role,
          displayName: null,
          photoURL: null,
        });
        setRole(role);

        toast.success('ZK Login successful');
        router.replace(redirect);
      } catch (error: any) {
        console.error('ZK Login error:', error);
        toast.error('ZK Login failed: ' + error.message);
        router.replace('/auth/error');
      }
    }

    handleZkLogin();
  }, [searchParams, router, setUser, setRole]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center text-gray-600">
        <p>Verifying ZK Login credentials...</p>
      </div>
    </div>
  );
}