// ✅ components/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { Role } from '@/utils/getUserRole';
import { isLoggedIn, hasAnyRole } from '@/lib/auth';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  children: React.ReactNode;
}

const ProtectedRoute = ({ allowedRoles = [], children }: ProtectedRouteProps) => {
  const router = useRouter();
  const { address, role } = useUserStore();

  useEffect(() => {
    if (!address) {
      router.push('/');
    } else if (allowedRoles.length > 0 && !allowedRoles.includes(role!)) {
      router.push('/');
    }
  }, [address, role, router, allowedRoles]);

  if (!address || (allowedRoles.length > 0 && !allowedRoles.includes(role!))) {
    return null; // Prevent rendering while redirecting
  }

  return <>{children}</>;
};

export default ProtectedRoute;
