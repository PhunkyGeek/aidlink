'use client';

import { RolePrompt } from '@/components/RolePrompt';

export default function RedirectPage() {
  const rolePrompt = RolePrompt();

  return (
    <div className="min-h-screen flex items-center justify-center">
      {rolePrompt}
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}