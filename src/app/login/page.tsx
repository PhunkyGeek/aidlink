'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import SkeletonLoginForm from '@/components/SkeletonLoginForm';

const LoginForm = dynamic(() => import('@/components/LoginForm'), {
  ssr: false,
  loading: () => <SkeletonLoginForm />,
});

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Suspense fallback={<SkeletonLoginForm />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
