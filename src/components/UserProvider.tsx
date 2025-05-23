// ✅ components/UserProvider.tsx (updated and fixed)
'use client';

import { useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useUserStore } from '@/store/useUserStore';
import { getUserRole } from '@/utils/getUserRole';

export default function UserProvider({ children }: { children: React.ReactNode }) {
  const currentAccount = useCurrentAccount();
  const setAddress = useUserStore((s) => s.setAddress);
  const setRole = useUserStore((s) => s.setRole);

  useEffect(() => {
    const syncUserState = async () => {
      if (currentAccount?.address) {
        setAddress(currentAccount.address);
        const role = await getUserRole(currentAccount.address);
        setRole(role);
      }
    };
    syncUserState();
  }, [currentAccount?.address, setAddress, setRole]);

  return <>{children}</>;
}
