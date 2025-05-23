'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { handleZkLoginCallback } from '@/lib/zkLogin';
import type { Role } from '@/utils/getUserRole';

function redirectBasedOnRole(role: Role): string {
  switch (role) {
    case 'validator':
      return '/validator-dashboard';
    case 'recipient':
      return '/submit-aid';
    case 'admin':
      return '/admin';
    default:
      return '/requests';
  }
}

export default function ZkLoginCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processLogin() {
      const token = searchParams.get('token');
      const salt = searchParams.get('userSalt');

      if (!token || !salt) {
        setError('Missing login credentials.');
        setTimeout(() => router.push('/'), 3000);
        return;
      }

      try {
        const role = await handleZkLoginCallback({ token, salt });
        router.push('/redirect');
      } catch (err) {
        console.error('Login error:', err);
        setError('Login failed. Please try again.');
        setTimeout(() => router.push('/'), 3000);
      }
    }

    processLogin();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 text-center">
      {error ? (
        <>
          <h1 className="text-xl font-semibold mb-2 text-red-600">{error}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Redirecting to home...
          </p>
        </>
      ) : (
        <>
          <h1 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
            Finishing Login...
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Please wait while we complete your authentication.
          </p>
        </>
      )}
    </div>
  );
}
