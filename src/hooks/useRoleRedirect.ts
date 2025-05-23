'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import toast from 'react-hot-toast';

export function useRoleRedirect() {
  const { role } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!role) return;

    const routeMap: Record<string, string> = {
      admin: '/admin/dashboard',
      validator: '/validator-dashboard',
      recipient: '/connect-walletr',
      donor: '/connect-wallet',
    };

    const destination = routeMap[role] || '/';
    toast.success(`Logged in as ${role}. Redirecting...`);
    router.replace(destination);
  }, [role, router]);
}
