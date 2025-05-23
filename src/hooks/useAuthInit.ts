'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useUserStore } from '@/store/useUserStore';
import { getUserRole } from '@/utils/getUserRole';

export function useAuthInit() {
  const { setAddress, setRole } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAddress(user.uid);
        const role = await getUserRole(user.uid);
        setRole(role);
      } else {
        setAddress(null);
        setRole(null);
      }
    });

    return () => unsubscribe(); // cleanup
  }, [setAddress, setRole]);
}
