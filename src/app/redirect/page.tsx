'use client';

import { useRoleRedirect } from '@/hooks/useRoleRedirect';

export default function RedirectPage() {
  useRoleRedirect();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
