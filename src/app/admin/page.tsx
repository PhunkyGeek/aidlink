'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';

export default function AdminIndexPage() {
  const { role } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (role === 'admin') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/');
    }
  }, [role, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
