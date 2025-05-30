// src/app/auth/zklogin/callback/page.tsx
import { Suspense } from 'react';
import ZkCallbackPage from './ZkCallbackPage';
import { Spinner } from '@/components/ui/Spinner';

export default function ZkLoginCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
          <div className="text-center text-gray-100">
            <Spinner size="lg" className="text-purple-400 mb-2" />
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <ZkCallbackPage />
    </Suspense>
  );
}