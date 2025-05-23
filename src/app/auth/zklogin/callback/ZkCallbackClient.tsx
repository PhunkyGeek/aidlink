'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ZkCallbackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    const redirect = searchParams.get('redirect') || '/';

    if (token) {
      // Replace with actual login/token handling logic
      console.log('ZK token received:', token);

      // Example: store token and redirect
      localStorage.setItem('zk_token', token);
      router.replace(redirect);
    } else {
      console.warn('No token found in ZK login callback.');
      router.replace('/auth/error');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center text-gray-600">
        <p>Verifying ZK Login credentials...</p>
      </div>
    </div>
  );
}
